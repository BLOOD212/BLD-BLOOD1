import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'

const defaultMenu = {
  before: ``.trimStart(),
  header: 'ㅤㅤ⋆｡˚『 ╭ `MENU GIOCHI` ╯ 』˚｡⋆\n╭',
  body: '│ ➤『🎮』 %cmd\n',
  footer: '*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*\n',
  after: ``,
}

let handler = async (m, { conn, usedPrefix: _p, __dirname, args, command }) => {
  let tags = { 'giochi': 'Giochi' }

  try {
    // dati base
    let d = new Date(new Date() + 3600000)
    let locale = 'it'
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
    let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
    let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' })
    let _uptime = process.uptime() * 1000

    let muptime
    if (process.send) {
      process.send('uptime')
      muptime = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }

    let uptime = clockString(_uptime)
    let muptimeStr = clockString(muptime)
    let wib = moment.tz('Europe/Rome').format('HH:mm:ss')
    let mode = global.opts['self'] ? 'Privato' : 'Pubblico'
    let _package = JSON.parse(await promises.readFile(join(__dirname, '../package.json')).catch(_ => ({}))) || {}

    let { age, exp, limit, level, role, registered, eris } = global.db.data.users[m.sender]
    let { min, xp, max } = xpRange(level, global.multiplier)
    let name = await conn.getName(m.sender)
    let premium = global.db.data.users[m.sender].premiumTime
    let prems = `${premium > 0 ? 'Premium' : 'Utente comune'}`
    let platform = os.platform()

    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered).length

    // help plugins
    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.tags) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p,
      limit: p.limit,
      premium: p.premium,
      enabled: !p.disabled
    }))

    let groups = {}
    for (let tag in tags) {
      groups[tag] = []
      for (let plugin of help)
        if (plugin.tags && plugin.tags.includes(tag) && plugin.help)
          groups[tag].push(plugin)
    }

    // costruzione menu
    let before = conn.menu?.before || defaultMenu.before
    let header = conn.menu?.header || defaultMenu.header
    let body = conn.menu?.body || defaultMenu.body
    let footer = conn.menu?.footer || defaultMenu.footer
    let after = conn.menu?.after || defaultMenu.after

    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag]) + '\n' +
          [
            ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help)
              .map(menu => menu.help.map(cmd => body.replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
                .replace(/%islimit/g, menu.limit ? '⚠️ Limitato' : '')
                .replace(/%isPremium/g, menu.premium ? '💎 Premium' : '')
                .trim()
              ).join('\n')),
            footer
          ].join('\n')
      }),
      after
    ].join('\n')

    let text = typeof conn.menu === 'string' ? conn.menu : typeof conn.menu === 'object' ? _text : ''

    let replace = {
      '%': '%',
      p: _p,
      muptime: muptimeStr,
      me: conn.getName(conn.user.jid),
      npmname: _package.name,
      npmdesc: _package.description,
      version: _package.version,
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      wib, mode, _p, eris, age, name, prems, level, limit,
      weton, week, date, dateIslamic, time, totalreg, rtotalreg, role,
      readmore
    }

    text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    // invio menu solo testo
    await conn.sendMessage(m.chat, {
      text: text.trim(),
      mentions: [m.sender]
    }, { quoted: m })

    await m.react('🎮')

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Si è verificato un errore nel menu giochi.', m)
  }
}

handler.help = ['menugiochi']
handler.tags = ['menu']
handler.command = ['menugiochi', 'menugame']

export default handler

// -------------------
// utils
// -------------------
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, ' H ', m, ' M ', s, ' S '].map(v => v.toString().padStart(2, '0')).join('')
}

function ucapan() {
  const time = moment.tz('Europe/Rome').format('HH')
  if (time >= 18) return "Sera 🌙"
  if (time >= 15) return "Pomeriggio 🌇"
  if (time >= 10) return "Mattina ☀️"
  if (time >= 4) return "Mattina 🌄"
  return "Sveglio così presto? 🥱"
}