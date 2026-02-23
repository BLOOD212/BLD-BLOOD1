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
          } catch (e) {}
          console.log('Messaggio editato:', oldContent, '->', editedContent);
        } else if (update.update.message === null) {
          console.log('Messaggio eliminato:', update.key.id);
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

    const user = global.DATABASE?.data?.users?.[senderJid] || { exp: '?', diamonds: '?', level: '¿', euro: '?', bank: '?' }

    const filesize = getFileSize(m)
    const ts = formatTimestamp(m.messageTimestamp)
    const messageAge = getMessageAge(m.messageTimestamp)

    const c = getColorScheme()
    const bordi = getBorders(c)
    const tipo = formatType(m)

    const righe = [
      `${bordi.top}`,
      `${bordi.pipe} ${c.label('📱 Bot:')} ${c.text(me)}`,
      `${bordi.pipe} ${c.label('⏰ Ora:')} ${c.text(ts)}${messageAge ? c.secondary(' • ') + c.meta(messageAge) : ''}`,
      `${bordi.pipe} ${c.label('👤 Da:')} ${c.text(sender)}${isGroup ? ` ${c.secondary('|')} ${getUserStatus(isOwner, isAdmin, isPremium, isBanned, c)}` : ''}`,
      `${bordi.pipe} ${c.label('💬 Chat:')} ${c.text(chat)}${isGroup ? c.secondary(' (Gruppo)') : c.secondary(' (Privato)')}`,
      `${bordi.pipe} ${c.label('📨 Tipo:')} ${c.text(tipo)}${getMessageFlags(m, c)}`
    ]

    if (filesize) righe.push(`${bordi.pipe} ${c.label('📦 Dimensione:')} ${c.text(formatSize(filesize))}`)
    if (m.isCommand) righe.push(`${bordi.pipe} ${c.label('⚙️ Comando:')} ${c.text(getCommand(m.text))}`)
    if (user.exp !== '?') righe.push(`${bordi.pipe} ${c.label('⭐ EXP:')} ${c.text(user.exp)}`)

    righe.push(`${bordi.bottom}`)

    console.log('\n' + righe.join('\n'))

    const logText = await formatText(m, conn)
    if (logText?.trim()) console.log(logText)

  } catch (error) {
    throttleError('Errore in print.js:', error.message, 5000);
  }
}

/* ===========================
   🎨 NEW DARK EMERALD THEME
=========================== */

function getColorScheme() {
  const hex = c => chalk.hex(c)

  return {
    label: hex('#00FFD1').bold,
    text: hex('#EAFBF9'),
    secondary: hex('#00BFA6'),
    meta: hex('#7FFFD4'),
    bright: hex('#1DE9B6'),
    bold: chalk.bold,
    italic: chalk.italic,
    white: hex('#F5FFFA'),
    gray: hex('#9DB8B2'),
    cyan: hex('#00FFFF'),
    magenta: hex('#FF4DA6'),
    blue: hex('#29B6F6'),
    green: hex('#00E676'),
    red: hex('#FF5252'),
    yellow: hex('#FFD54F'),
    background: chalk.bgHex('#002B2B'),
    info: hex('#B2DFDB'),
    warning: hex('#FFB74D'),
    error: hex('#FF1744'),
    success: hex('#00E5A8')
  }
}

function getBorders(c) {
  return {
    top: `${c.secondary.bold('╔════════════')}『 ${chalk.hex('#FFD700').bold('*BLOOD🩸BOT')} 』${c.secondary.bold('════════════╗')}`,
    bottom: `${c.secondary.bold('╚══════════════════════════════════════════════════╝')}`,
    pipe: c.secondary.bold('║')
  }
}

/* ===== RESTO FUNZIONI ORIGINALI INVARIATE ===== */

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
  } catch {
    return false
  }
}

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
    return cleanNumber + (name ? ` ~${name}` : '');
  }
}

function formatTimestamp(timestamp) {
  const date = timestamp ? new Date(timestamp * 1000) : new Date()
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getMessageAge(timestamp) {
  if (!timestamp) return ''
  const now = Date.now() / 1000
  const sec = now - timestamp
  if (sec < 60) return `${Math.floor(sec)}s fa`
  if (sec < 3600) return `${Math.floor(sec / 60)}m fa`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h fa`
  return ''
}

function formatType(m) {
  return (m.mtype || 'unknown').replace(/Message/gi, '')
}

function getUserStatus(isOwner, isAdmin, isPremium, isBanned, c) {
  let status = []
  if (isOwner) status.push(c.success('Owner'))
  if (isAdmin) status.push(c.warning('Admin'))
  if (isPremium) status.push(c.bright('Premium'))
  if (isBanned) status.push(c.error('Bannato'))
  return status.length ? `(${status.join(' | ')})` : (c.text('User'))
}

function getMessageFlags(m, c) {
  let flags = []
  if (m.isCommand) flags.push(c.label('Cmd'))
  if (m.quoted) flags.push(c.meta('In risposta'))
  return flags.length ? ` ${c.secondary('•')} ${flags.join(' ')}` : ''
}

function getCommand(text) {
  if (!text) return ''
  return text.split(' ')[0].slice(1)
}

function getFileSize(m) {
  return m.msg?.fileLength || 0
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)) + ' ' + sizes[i]
}

watchFile(__filename, () => {
  console.log(chalk.bgHex('#002B2B')(chalk.hex('#00FFD1').bold("File: 'lib/print.js' Aggiornato")))
})