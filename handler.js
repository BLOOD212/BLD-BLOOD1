import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import NodeCache from 'node-cache'
import { getAggregateVotesInPollMessage, toJid } from '@realvare/based'

global.ignoredUsersGlobal = new Set()
global.ignoredUsersGroup = {}
global.groupSpam = {}

if (!global.groupCache) {
    global.groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false })
}
if (!global.jidCache) {
    global.jidCache = new NodeCache({ stdTTL: 600, useClones: false })
}
if (!global.nameCache) {
    global.nameCache = new NodeCache({ stdTTL: 600, useClones: false });
}

export const fetchMetadata = async (conn, chatId) => await conn.groupMetadata(chatId)

const fetchGroupMetadataWithRetry = async (conn, chatId, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await conn.groupMetadata(chatId);
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

if (!global.cacheListenersSet) {
    const conn = global.conn
    if (conn) {
        conn.ev.on('groups.update', async (updates) => {
            for (const update of updates) {
                if (!update || !update.id) continue;
                try {
                    const metadata = await fetchGroupMetadataWithRetry(conn, update.id)
                    if (!metadata) continue
                    global.groupCache.set(update.id, metadata, { ttl: 300 })
                } catch (e) {
                    if (!e.message?.includes('not authorized') && !e.message?.includes('chat not found')) {
                        console.error(`[ERRORE] Cache update:`, e)
                    }
                }
            }
        })
        global.cacheListenersSet = true
    }
}

if (!global.pollListenerSet) {
    const conn = global.conn
    if (conn) {
        conn.ev.on('messages.update', async (chatUpdate) => {
            for (const { key, update } of chatUpdate) {
                if (update.pollUpdates) {
                    try {
                        const pollCreation = await global.store.getMessage(key)
                        if (pollCreation) {
                            await getAggregateVotesInPollMessage({
                                message: pollCreation,
                                pollUpdates: update.pollUpdates,
                            })
                        }
                    } catch (e) {
                        console.error('[ERRORE] Poll update:', e)
                    }
                }
            }
        })
        global.pollListenerSet = true
    }
}

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))
const responseHandlers = new Map()

function initResponseHandler(conn) {
    if (!conn.waitForResponse) {
        conn.waitForResponse = async (chat, sender, options = {}) => {
            const { timeout = 30000, validResponses = null, onTimeout = null, filter = null } = options
            return new Promise((resolve) => {
                const key = chat + sender
                const timeoutId = setTimeout(() => {
                    responseHandlers.delete(key)
                    if (onTimeout) onTimeout()
                    resolve(null)
                }, timeout)
                responseHandlers.set(key, { resolve, timeoutId, validResponses, filter })
            })
        }
    }
}

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    
    if (m.message?.protocolMessage?.type === 'MESSAGE_EDIT') {
        const key = m.message.protocolMessage.key;
        const editedMessage = m.message.protocolMessage.editedMessage;
        m.key = key;
        m.message = editedMessage;
        m.text = editedMessage.conversation || editedMessage.extendedTextMessage?.text || '';
        m.mtype = Object.keys(editedMessage)[0];
    }
    
    m = smsg(this, m, global.store)
    if (!m || !m.key || !m.chat || !m.sender) return
    if (m.fromMe) return

    if (m.key) {
        m.key.remoteJid = this.decodeJid(m.key.remoteJid)
        if (m.key.participant) m.key.participant = this.decodeJid(m.key.participant)
    }

    initResponseHandler(this)

    let user = null
    let chat = null
    try {
        if (!global.db.data) await global.loadDatabase()
        
        let normalizedSender = this.decodeJid(m.sender)
        let normalizedBot = this.decodeJid(this.user.jid)
        
        user = global.db.data.users[normalizedSender] || (global.db.data.users[normalizedSender] = { exp: 0, euro: 10, name: m.pushName || '?', banned: false })
        chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = { isBanned: false, antispam: false, moderatori: [] })

        let isSam = global.owner.some(([num]) => num + '@s.whatsapp.net' === normalizedSender)
        let isOwner = isSam || m.fromMe
        
        // IDENTIFICAZIONE MODERATORI DEL BOT
        let modsList = chat.moderatori || []
        let isBotMod = modsList.includes(normalizedSender)

        let isRealAdmin = false
        let isBotAdmin = false
        let groupMetadata = null

        if (m.isGroup) {
            groupMetadata = global.groupCache.get(m.chat) || await fetchGroupMetadataWithRetry(this, m.chat)
            if (groupMetadata) {
                global.groupCache.set(m.chat, groupMetadata, { ttl: 300 })
                let participants = groupMetadata.participants || []
                
                // Controllo se è admin REALE di WhatsApp
                isRealAdmin = participants.some(u => this.decodeJid(u.id) === normalizedSender && (u.admin === 'admin' || u.admin === 'superadmin'))
                isBotAdmin = participants.some(u => this.decodeJid(u.id) === normalizedBot && (u.admin === 'admin' || u.admin === 'superadmin'))
            }
        }

        // Definizione isAdmin per il resto dei plugin (Admin Reale o Mod del bot)
        let isAdmin = isRealAdmin || isBotMod

        const ___dirname = join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin) continue

            let _prefix = plugin.customPrefix || global.prefix || '.'
            let match = (Array.isArray(_prefix) ? _prefix : [_prefix]).find(p => m.text.startsWith(p))

            if (!match) continue

            let usedPrefix = match
            let noPrefix = m.text.replace(usedPrefix, '')
            let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
            command = command?.toLowerCase() || ''

            let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd === command) :
                typeof plugin.command === 'string' ? plugin.command === command : false

            if (!isAccept) continue

            // --- INIZIO BLOCCO SPECIFICO MODERATORI ---
            const adminActions = ['promuovi', 'retrocedi', 'promote', 'demote']
            if (adminActions.includes(command)) {
                // Se è un moderatore del bot MA non è admin reale e non è owner
                if (isBotMod && !isRealAdmin && !isOwner) {
                    await this.reply(m.chat, `🚫 *Azione negata.*\n\nSei un moderatore del bot, ma non sei un amministratore di questo gruppo. Non puoi gestire i privilegi degli altri utenti.`, m)
                    return // Blocca l'esecuzione
                }
            }
            // --- FINE BLOCCO SPECIFICO ---

            // Check permessi standard
            if (plugin.owner && !isOwner) { global.dfail('owner', m, this); continue }
            if (plugin.group && !m.isGroup) { global.dfail('group', m, this); continue }
            if (plugin.botAdmin && !isBotAdmin) { global.dfail('botAdmin', m, this); continue }
            if (plugin.admin && !isAdmin) { global.dfail('admin', m, this); continue }

            try {
                await plugin.call(this, m, {
                    match, usedPrefix, noPrefix, args, command, text: args.join(' '),
                    conn: this, isOwner, isAdmin, isRealAdmin, isBotMod, isBotAdmin, groupMetadata
                })
            } catch (e) {
                console.error(e)
                this.reply(m.chat, format(e), m)
            }
            break
        }
    } catch (e) {
        console.error(e)
    }
}

global.dfail = async (type, m, conn) => {
    const msg = {
        owner: '🛡️ Comando riservato al proprietario.',
        group: '👥 Questo comando può essere usato solo nei gruppi.',
        admin: '🛠️ Questo comando è solo per gli amministratori.',
        botAdmin: '🤖 Il bot deve essere amministratore per eseguire questa azione.'
    }[type]
    if (msg) conn.reply(m.chat, msg, m)
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => { 
    unwatchFile(file)     
    console.log(chalk.white.bold("File: 'handler.js' Aggiornato"))
})
