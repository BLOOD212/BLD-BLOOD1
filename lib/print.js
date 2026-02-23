import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'
import { fileURLToPath } from 'url'
import NodeCache from 'node-cache'

const __filename = fileURLToPath(import.meta.url)
const nameCache = new NodeCache({ stdTTL: 600 });
const groupMetaCache = new NodeCache({ stdTTL: 300 });
const errorThrottle = {};
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g

export default async function (m, conn = { user: {} }) {
  if (!global.messageUpdateListenerSet) {
    conn.ev.on('messages.update', (updates) => {
      for (const update of updates) {
        if (update.update.message?.editedMessage) {
          const editedContent = update.update.message.editedMessage.message?.conversation ||
                                update.update.message.editedMessage.message?.extendedTextMessage?.text ||
                                update.update.message.editedMessage.message?.imageMessage?.caption ||
                                'Contenuto non disponibile';
          let oldContent = 'Contenuto originale non disponibile';
          try {
            const originalMsg = global.store?.getMessage(update.key);
            if (originalMsg) {
              oldContent = originalMsg.message?.conversation ||
                           originalMsg.message?.extendedTextMessage?.text ||
                           originalMsg.message?.imageMessage?.caption ||
                           'Contenuto originale non disponibile';
            }
          } catch (e) {
          }
          console.log(chalk.hex('#FF4500')('⚡ MODIFICATO:'), oldContent, chalk.cyan('→'), editedContent);
        } else if (update.update.message === null) {
          console.log(chalk.hex('#FF0000').bold('🗑️ ELIMINATO:'), update.key.id);
        }
      }
    })
    global.messageUpdateListenerSet = true
  }

  if (!m || m.key?.fromMe) return

  try {
    const senderJid = conn.decodeJid(m.sender)
    const chatJid = conn.decodeJid(m.chat || '')
    const botJid = conn.decodeJid(conn.user?.jid)

    if (!chatJid) return;

    let _name = nameCache.get(senderJid);
    if (!_name) {
      _name = await conn.getName(senderJid) || '';
      nameCache.set(senderJid, _name);
    }
    const sender = formatPhoneNumber(senderJid, _name)
    let chatName = nameCache.get(chatJid);
    if (!chatName) {
      chatName = await conn.getName(chatJid) || 'Chat Sconosciuta';
      nameCache.set(chatJid, chatName);
    }
    const chat = chatName
    const me = formatPhoneNumber(botJid || '', conn.user?.name || 'Bot')
    const isOwner = Array.isArray(global.owner)
      ? global.owner.map(([number]) => number).includes(senderJid.split('@')[0])
      : global.owner === senderJid.split('@')[0]
    const isGroup = chatJid.endsWith('@g.us') || false
    const isAdmin = isGroup ? await checkAdmin(conn, chatJid, senderJid) : false
    const isPremium = global.prems?.includes(senderJid) || false
    const isBanned = global.DATABASE?.data?.users?.[senderJid]?.banned || false
    
    if (global.lastLogJid === senderJid && Date.now() - global.lastLogTime < 1000) return;
    global.lastLogJid = senderJid;
    global.lastLogTime = Date.now();
    
    const user = global.DATABASE?.data?.users?.[senderJid] || { exp: '?', euro: '?' }
    const filesize = getFileSize(m)
    const ts = formatTimestamp(m.messageTimestamp)
    const messageAge = getMessageAge(m.messageTimestamp)
    const c = getColorScheme()
    const bordi = getBorders(c)
    const tipo = formatType(m)

    const righe = [
      `${bordi.top}`,
      `${bordi.pipe} ${c.label('🤖 BOT     :')} ${c.text(me)}`,
      `${bordi.pipe} ${c.label('🕙 ORA     :')} ${c.text(ts)}${messageAge ? c.secondary(' ☄️ ') + c.meta(messageAge) : ''}`,
      `${bordi.pipe} ${c.label('👤 MITTENTE:')} ${c.text(sender)}${isGroup ? ` ${c.secondary('◈')} ${getUserStatus(isOwner, isAdmin, isPremium, isBanned, c)}` : ''}`,
      `${bordi.pipe} ${c.label('💬 CHAT    :')} ${c.text(chat)}${isGroup ? c.secondary(' [GRP]') : c.secondary(' [PVT]')}`,
      `${bordi.pipe} ${c.label('📝 TIPO    :')} ${c.text(tipo)}${getMessageFlags(m, c)}`
    ]

    if (filesize) righe.push(`${bordi.pipe} ${c.label('📦 SIZE    :')} ${c.text(formatSize(filesize))}`)
    if (m.isCommand) righe.push(`${bordi.pipe} ${c.label('⚙️ COMMAND :')} ${c.text('/' + getCommand(m.text))}`)
    if (user.exp !== '?') righe.push(`${bordi.pipe} ${c.label('✨ STATUS  :')} ${c.text(user.exp + ' XP')}${user.euro !== '?' ? c.secondary(' • ') + c.label('💶 ') + c.text(user.euro) : ''}`)
    
    if (isGroup && chatJid) {
      try {
        let groupMeta = groupMetaCache.get(chatJid);
        if (!groupMeta) {
          groupMeta = await conn.groupMetadata(chatJid);
          if (groupMeta) groupMetaCache.set(chatJid, groupMeta, { ttl: 300 });
        }
        const participantCount = groupMeta?.participants?.length || '?'
        righe.push(`${bordi.pipe} ${c.label('👥 MEMBRI  :')} ${c.text(participantCount)}`)
      } catch (e) {}
    }

    if (m.quoted) {
      const quotedSenderJid = conn.decodeJid(m.quoted.sender)
      let qname = nameCache.get(quotedSenderJid) || 'Utente';
      righe.push(`${bordi.pipe} ${c.label('↪️ REPLY TO:')} ${c.text(qname)}`)
    }

    righe.push(`${bordi.bottom}`)

    console.log('\n' + righe.join('\n'))

    const logText = await formatText(m, conn)
    if (logText?.trim()) console.log('  ' + logText)

    logMessageSpecifics(m, c)

  } catch (error) {
    throttleError('Errore:', error.message, 5000);
  }
}

function getColorScheme() {
  const f = color => chalk.hex(color)
  return {
    label: f('#FF8C00').bold,        // Arancio Supernova (Etichette)
    text: f('#E0FFFF'),              // Light Cyan (Testo)
    secondary: f('#7B68EE'),         // Medium Slate Blue (Divisori)
    meta: f('#00FA9A'),              // Spring Green (Metadati)
    bright: f('#FF00FF'),            // Magenta (Premium)
    background: chalk.bgHex('#7B68EE').black.bold,
    warning: f('#FFD700'),           // Oro (Admin)
    error: f('#FF4500'),             // Rosso Arancio (Bannati)
    success: f('#00FFFF').bold       // Ciano (Owner)
  }
}

function getBorders(c) {
  return {
    top: `${c.secondary('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━')} ${c.label('BLOOD🩸BOT')} ${c.secondary('━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')}`,
    bottom: `${c.secondary('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')}`,
    pipe: c.secondary('┃')
  }
}

// --- FUNZIONI DI SUPPORTO (Mantengono la tua logica originale) ---

function throttleError(message, error, delay) {
  const key = message + error;
  if (!errorThrottle[key] || Date.now() - errorThrottle[key] > delay) {
    console.error(chalk.red(message), error);
    errorThrottle[key] = Date.now();
  }
}

function formatPhoneNumber(jid, name) {
    if (!jid) return 'Sconosciuto';
    let userPart = jid.split('@')[0];
    let cleanNumber = userPart.split(':')[0];
    try {
        const number = PhoneNumber('+' + cleanNumber).getNumber('international');
        return number + (name ? ` ~${name}` : '');
    } catch {
        return (cleanNumber || '') + (name ? ` ~${name}` : '');
    }
}

async function checkAdmin(conn, chatId, senderId) {
  try {
    const decodedSender = conn.decodeJid(senderId);
    let groupMeta = groupMetaCache.get(chatId);
    if (!groupMeta) {
      groupMeta = await conn.groupMetadata(chatId);
      if (groupMeta) groupMetaCache.set(chatId, groupMeta);
    }
    return groupMeta?.participants?.some(p => 
      (conn.decodeJid(p.id) === decodedSender || p.jid === decodedSender) && 
      (p.admin === 'admin' || p.admin === 'superadmin')
    ) || false
  } catch { return false }
}

function getFileSize(m) {
  return m.msg?.fileLength || m.text?.length || 0
}

function formatTimestamp(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString('it-IT')
}

function getMessageAge(timestamp) {
  if (!timestamp) return ''
  const sec = (Date.now() / 1000) - timestamp
  if (sec < 60) return `${Math.floor(sec)}s`
  if (sec < 3600) return `${Math.floor(sec / 60)}m`
  return ''
}

function formatType(m) {
  return (m.mtype || 'unknown').replace(/Message/gi, '')
}

function getUserStatus(isOwner, isAdmin, isPremium, isBanned, c) {
  if (isBanned) return c.error('BANNED')
  if (isOwner) return c.success('OWNER')
  if (isAdmin) return c.warning('ADMIN')
  if (isPremium) return c.bright('PREM')
  return chalk.gray('USER')
}

function getMessageFlags(m, c) {
  let flags = []
  if (m.isCommand) flags.push(c.label('CMD'))
  if (m.quoted) flags.push(c.meta('REPLY'))
  return flags.length ? ` ${c.secondary('•')} ${flags.join(' ')}` : ''
}

function getCommand(text) {
  if (!text) return ''
  return text.split(' ')[0].slice(1)
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB', 'GB'][i]
}

function logMessageSpecifics(m, c) {
  const s = {
    audioMessage: () => console.log(`  ${c.secondary('🎵 AUDIO')} - ${c.meta(m.msg.seconds + 's')}`),
    videoMessage: () => console.log(`  ${c.secondary('🎥 VIDEO')} - ${m.msg.gifPlayback ? 'GIF' : 'MP4'}`),
    imageMessage: () => console.log(`  ${c.secondary('🖼️ IMAGE')}`),
    stickerMessage: () => console.log(`  ${c.secondary('🌟 STICKER')}`),
  }
  if (s[m.mtype]) s[m.mtype]()
}

async function formatText(m, conn) {
  if (!m.text && !m.caption) return ''
  let text = (m.text || m.caption || '').trim()
  if (m.isCommand) return chalk.bgHex('#FF8C00').black.bold(` ${text} `)
  if (m.quoted) return chalk.hex('#7B68EE').italic(text)
  return chalk.hex('#E0FFFF')(text)
}

watchFile(__filename, () => {
   console.log(chalk.bgHex('#7B68EE').white.bold(" 🚀 BLOOD BOT: REINIZIALIZZATO "))
})