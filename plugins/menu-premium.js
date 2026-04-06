import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'

const defaultMenu = {
  before: `
┎━━━━━━━━━━━━━━━━━━━┑
┃   ✧  𝐁𝐋𝐃 - 𝐏𝐑𝐄𝐌𝐈𝐔𝐌  ✧   ┃
┖━━━━━━━━━━━━━━━━━━━┙
┌───────────────────┐
  👤 𝚄𝚜𝚎𝚛: %name
  🏆 𝚁𝚊𝚗𝚔: %role
  ✨ 𝚂𝚝𝚊𝚝𝚞𝚜: 𝙴𝚕𝚒𝚝𝚎
└───────────────────┘

*〘 ᴀᴄᴄᴇssɪɴɢ ᴘʀɪᴠᴀᴛᴇ ɴᴏᴅᴇ... 〙*
`.trimStart(),
  header: '┍━━━〔 %category 〕━━━┑',
  body: '┇ 👑  *%cmd*',
  footer: '┕━━━━━──ׄ──ׅ──ׄ──━━━━━┙\n',
  after: `_ʙʟᴅ-ʙᴏᴛ ᴇxᴄʟᴜsɪᴠᴇ sʏsᴛᴇᴍ_`
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  let tags = {
    'prem': 'ᴇʟɪᴛᴇ ᴘʀᴏᴛᴏᴄᴏʟ'
  }

  try {
    let user = global.db.data.users[m.sender]
    let { level, role } = user
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    
    // Filtraggio plugin premium
    let help = Object.values(global.plugins).filter(p => !p.disabled && p.tags && (p.tags.includes('premium') || p.tags.includes('prem'))).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      prefix: 'customPrefix' in p,
    }))

    let _text = [
      defaultMenu.before,
      defaultMenu.header.replace(/%category/g, tags['prem']),
      help.map(menu => menu.help.map(cmd => 
        defaultMenu.body.replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
      ).join('\n')).join('\n'),
      defaultMenu.footer,
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%',
      p: _p,
      name, level, role, uptime
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await m.react('⭐')

    await conn.sendMessage(m.chat, {
      video: { url: './media/menu/menu9.mp4' },
      caption: text.trim(),
      gifPlayback: true,
      mimetype: 'video/mp4',
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "✧ 𝙱𝙻𝙳-𝙱𝙾𝚃 𝙿𝚁𝙴𝙼𝙸𝚄𝙼 ✧"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Error in Premium Module.', m)
  }
}

handler.help = ['menupremium']
handler.tags = ['menu']
handler.command = ['menupremium', 'menuprem']

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
