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
          console.log(chalk.bgHex('#FFD700').black(' ✏️ MODIFICA '), chalk.cyan('Messaggio aggiornato rilevato.'));
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

    let _name = nameCache.get(senderJid) || await conn.getName(senderJid) || '';
    nameCache.set(senderJid, _name);
    
    const sender = formatPhoneNumber(senderJid, _name)
    let chatName = nameCache.get(chatJid) || await conn.getName(chatJid) || 'Chat';
    nameCache.set(chatJid, chatName);

    const isOwner = Array.isArray(global.owner) ? global.owner.map(([number]) => number).includes(senderJid.split('@')[0]) : global.owner === senderJid.split('@')[0]
    const isGroup = chatJid.endsWith('@g.us')
    const isAdmin = isGroup ? await checkAdmin(conn, chatJid, senderJid) : false
    const isPremium = global.prems?.includes(senderJid) || false
    const isBanned = global.DATABASE?.data?.users?.[senderJid]?.banned || false

    const user = global.DATABASE?.data?.users?.[senderJid] || { exp: '?', euro: '?' }
    const c = getColorScheme()
    const b = getBorders(c)

    // Costruzione Righe con allineamento sistemato
    const righe = [
      b.top,
      `${b.p} ${c.lab('🤖 BOT      ')} ${c.sec('»')} ${c.txt(conn.user?.name || 'Blood')}`,
      `${b.p} ${c.lab('⏰ TEMPO    ')} ${c.sec('»')} ${c.txt(formatTimestamp(m.messageTimestamp))} ${c.met(getMessageAge(m.messageTimestamp))}`,
      `${b.p} ${c.lab('👤 USER     ')} ${c.sec('»')} ${c.txt(sender)}`,
      `${b.p} ${c.lab('🛡️ STATUS   ')} ${c.sec('»')} ${getUserStatus(isOwner, isAdmin, isPremium, isBanned, c)}`,
      `${b.p} ${c.lab('💬 CHAT     ')} ${c.sec('»')} ${c.txt(chatName)} ${isGroup ? c.met('[GROUP]') : c.met('[PRIVATE]')}`,
      `${b.p} ${c.lab('📂 TIPO     ')} ${c.sec('»')} ${c.txt(formatType(m))}${getMessageFlags(m, c)}`
    ]

    if (m.isCommand) righe.push(`${b.p} ${c.lab('⚡ COMANDO  ')} ${c.sec('»')} ${c.cmd(getCommand(m.text))}`)
    if (user.exp !== '?') righe.push(`${b.p} ${c.lab('📊 LIVELLO  ')} ${c.sec('»')} ${c.txt(user.exp + ' XP')} ${c.sec('|')} ${c.lab('💰')} ${c.txt(user.euro)}`)

    righe.push(b.bottom)

    console.log('\n' + righe.join('\n'))

    const logText = await formatText(m, conn)
    if (logText?.trim()) console.log(`  ${c.sec('┗')} ${logText}`)

    logMessageSpecifics(m, c)

  } catch (error) {
    throttleError('Log Error:', error.message, 5000);
  }
}

function getColorScheme() {
  const f = color => chalk.hex(color)
  return {
    lab: f('#ADFF2F').bold,      // GreenYellow (Etichette)
    txt: f('#F0F8FF'),           // AliceBlue (Contenuto)
    sec: f('#8A2BE2'),           // BlueViolet (Dettagli/Separatori)
    met: f('#00FFFF').italic,    // Cyan (Meta info)
    cmd: f('#FF00FF').bold,      // Magenta (Comandi)
    owner: f('#ADFF2F').inverse.bold,
    admin: f('#FFD700').bold,
    prem: f('#00FFFF').bold,
    ban: f('#FF4500').strikethrough
  }
}

function getBorders(c) {
  const line = c.sec('━'.repeat(45))
  return {
    top: `${c.sec('┏')}${line}${c.sec('┓')}`,
    bottom: `${c.sec('┗')}${line}${c.sec('┛')}`,
    p: c.sec('┃')
  }
}

function formatPhoneNumber(jid, name) {
  if (!jid) return 'Unknown';
  const num = jid.split('@')[0].split(':')[0];
  return name ? `${name} ${chalk.gray('('+num+')')}` : num;
}

async function checkAdmin(conn, chatId, senderId) {
  try {
    const groupMeta = groupMetaCache.get(chatId) || await conn.groupMetadata(chatId);
    groupMetaCache.set(chatId, groupMeta);
    return groupMeta?.participants?.some(p => conn.decodeJid(p.id) === conn.decodeJid(senderId) && p.admin) || false
  } catch { return false }
}

function formatTimestamp(ts) {
  return new Date(ts * 1000).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

function getMessageAge(ts) {
  const s = Math.floor((Date.now() / 1000) - ts)
  return s < 60 ? `[${s}s]` : `[${Math.floor(s/60)}m]`
}

function formatType(m) {
  return (m.mtype || 'msg').replace(/Message/gi, '').toUpperCase()
}

function getUserStatus(isOwner, isAdmin, isPremium, isBanned, c) {
  if (isBanned) return c.ban(' BANNED ')
  if (isOwner) return c.owner(' OWNER ')
  let s = []
  if (isAdmin) s.push(c.admin('ADMIN'))
  if (isPremium) s.push(c.prem('PREM'))
  return s.length ? s.join(chalk.gray(' | ')) : chalk.gray('USER')
}

function getMessageFlags(m, c) {
  return m.quoted ? ` ${c.sec('⎇')} ${c.met('Replied')}` : ''
}

function getCommand(text) {
  return text ? text.split(/\s/)[0].replace(/[^\w\s]/gi, '').toUpperCase() : ''
}

function logMessageSpecifics(m, c) {
  const icons = { imageMessage: '🖼️', videoMessage: '🎥', audioMessage: '🎵', stickerMessage: '✨' }
  if (icons[m.mtype]) console.log(`    ${c.sec('└')} ${icons[m.mtype]} ${c.met(m.mtype.replace('Message', ''))}`)
}

async function formatText(m, conn) {
  let text = (m.text || m.caption || '').trim()
  if (!text) return ''
  if (m.isCommand) return chalk.bgHex('#8A2BE2').white.bold(` ${text} `)
  return chalk.whiteBright(text)
}

watchFile(__filename, () => {
   console.log(chalk.bgHex('#8A2BE2').black.bold(" ⚡ BLOOD BOT : PLUGIN REFRESHED "))
})