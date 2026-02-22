import { xpRange } from '../lib/levelling.js'

const defaultMenu = {
  before: ``.trimStart(),
  header: 'ㅤㅤ⋆｡˚『 ╭ \`MENU PREMIUM\` ╯ 』˚｡⋆\n╭',
  body: '│ ➤ 『 🉐 』 %cmd', 
  footer: '*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*\n',
  after: `> ⋆｡°✩ BLOODBOT ✩°｡⋆`.trimEnd()
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  let tags = {
    'prem': 'premium'
  }

  try {
    let { level, exp, role } = global.db.data.users[m.sender]
    let { min, xp, max } = xpRange(level, global.multiplier)
    let name = await conn.getName(m.sender)
    let d = new Date()
    let locale = 'it'
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    let uptime = clockString(process.uptime() * 1000)
    let totalreg = Object.keys(global.db.data.users).length
    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes('premium')).map(plugin => ({
      help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
      prefix: 'customPrefix' in plugin,
    }))
    
    // Definire fake come oggetto vuoto se non è definito
    let fake = global.fake || {};  // Aggiungi questa riga

    let text = [
      defaultMenu.before,
      defaultMenu.header.replace(/%category/g, tags['premium']),
      help.map(menu => menu.help.map(cmd =>
        defaultMenu.body.replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
      ).join('\n')).join('\n'),
      defaultMenu.footer,
      defaultMenu.after
    ].join('\n')
    
    text = text.replace(/%name/g, name)
      .replace(/%level/g, level || 0)
      .replace(/%exp/g, exp || 0)
      .replace(/%role/g, role || 'N/A')
      .replace(/%week/g, week)
      .replace(/%date/g, date)
      .replace(/%time/g, time)
      .replace(/%uptime/g, uptime)
      .replace(/%totalreg/g, totalreg)
    
    await conn.sendMessage(m.chat, {
      video: { url: './media/menu/menu9.mp4' },
      caption: text.trim(),
      gifPlayback: true,
      gifAttribution: 2,
      mimetype: 'video/mp4',
      ...fake, // Usa il global.fake per il contesto
      contextInfo: {
        ...fake.contextInfo, // Mantieni il contesto del fake
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          ...fake.contextInfo?.forwardedNewsletterMessageInfo, // Usa l'operatore di optional chaining per evitare errori se 'contextInfo' è undefined
          newsletterName: " ⋆｡°✩ Menu Premium ✩°｡⋆"
        }
      }
    }, { quoted: m })

  } catch (e) {
    conn.reply(m.chat, '❌ Errore nel menu premium.', m)
    throw e
  }
}

handler.help = ['menuspremium']
handler.tags = ['menu']
handler.command = ['menupremium', 'menuprem']

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, 'h', m, s, 's'].join(' ')
}