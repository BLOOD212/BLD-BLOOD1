import fs from 'fs'

const dbPath = './database.json'

console.log('✅ XP Plugin caricato')

// =========================
// DATABASE
// =========================
function loadDB() {
  try {
    if (!fs.existsSync(dbPath)) {
      console.log('📁 Creo database...')
      fs.writeFileSync(
        dbPath,
        JSON.stringify({ users: {}, lastDailyReset: null, lastWeeklyReset: null }, null, 2)
      )
    }

    const raw = fs.readFileSync(dbPath, 'utf8')
    let db = JSON.parse(raw)
    if (!db.users) db.users = {}
    return db
  } catch (err) {
    console.error('❌ Errore loadDB:', err)
    return { users: {} }
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
  } catch (err) {
    console.error('❌ Errore saveDB:', err)
  }
}

// =========================
// CALCOLO SETTIMANA ISO
// =========================
function getISOWeekNumber(date) {
  const tmp = new Date(date.valueOf())
  const dayNum = (date.getDay() + 6) % 7
  tmp.setDate(tmp.getDate() - dayNum + 3)
  const firstThursday = new Date(tmp.getFullYear(), 0, 4)
  const diff = tmp - firstThursday
  return 1 + Math.round(diff / 604800000)
}

// =========================
// XP + LEVEL SYSTEM
// =========================
function calculateLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp))
}

function getBadge(level) {
  if (level >= 30) return '👑 Re del Gruppo'
  if (level >= 15) return '🔥 Spammer Leggendario'
  if (level >= 5) return '💬 Chiacchierone'
  return '🐣 Newbie'
}

// =========================
// RANKING
// =========================
function getRanking(db, type) {
  return Object.entries(db.users)
    .map(([jid, data]) => [jid, data[type] ?? 0])
    .sort((a, b) => b[1] - a[1])
}

// =========================
// INVIO RESOCONTO / TOP 3
// =========================
async function sendResoconto(conn, db, chatId) {
  const ranking = getRanking(db, 'global')
  if (!ranking.length) return

  let text = `📊 *RESOCONTO AUTOMATICO*\n🏆 Top 10 utenti più attivi:\n\n`
  let mentions = []
  const medals = ['🥇', '🥈', '🥉']

  ranking.slice(0, 10).forEach(([jid, total], i) => {
    mentions.push(jid)
    text += `${medals[i] || (i + 1) + '°'} @${jid.split('@')[0]}\n   💬 ${total} messaggi\n\n`
  })

  await conn.sendMessage(chatId, { text, mentions })
}

async function notifyTop3(conn, db, chatId, type) {
  const ranking = getRanking(db, type)
  if (!ranking.length) return

  let text = type === 'daily' ? '🏅 *TOP 3 GIORNALIERO*\n\n' : '🏅 *TOP 3 SETTIMANALE*\n\n'
  let mentions = []
  const medals = ['🥇', '🥈', '🥉']

  ranking.slice(0, 3).forEach(([jid, total], i) => {
    mentions.push(jid)
    text += `${medals[i]} @${jid.split('@')[0]} — 💬 ${total}\n`
  })

  await conn.sendMessage(chatId, { text, mentions })
}

// =========================
// RESET AUTOMATICO
// =========================
function checkResets(db, conn) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const week = `${now.getFullYear()}-W${getISOWeekNumber(now)}`

  const chats = Object.keys(conn?.chats || {}).filter(id => id.endsWith('@g.us'))

  let changed = false

  // Reset giornaliero
  if (db.lastDailyReset !== today) {
    console.log('🔄 Reset giornaliero attivato a mezzanotte')
    for (let u in db.users) {
      db.users[u].daily = 0
      db.users[u].notifiedTop3 = false
    }
    db.lastDailyReset = today
    changed = true

    for (let chatId of chats) notifyTop3(conn, db, chatId, 'daily')
  }

  // Reset settimanale
  if (db.lastWeeklyReset !== week) {
    console.log('🔄 Reset settimanale attivato a mezzanotte')
    for (let u in db.users) db.users[u].weekly = 0
    db.lastWeeklyReset = week
    changed = true

    for (let chatId of chats) notifyTop3(conn, db, chatId, 'weekly')
  }

  if (changed) saveDB(db)
}

// =========================
// SCHEDULING RESOCONTO AUTOMATICO
// =========================
async function scheduleResoconto(conn) {
  const now = new Date()
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // giorno successivo
    0, 0, 0, 0
  )
  const delay = nextMidnight - now

  setTimeout(async () => {
    const db = loadDB()
    checkResets(db, conn)

    const chats = Object.keys(conn.chats || {}).filter(id => id.endsWith('@g.us'))
    for (let chatId of chats) await sendResoconto(conn, db, chatId)

    scheduleResoconto(conn)
  }, delay)
}

// =========================
// HANDLER MESSAGGI
// =========================
let handler = async (m, { conn, command }) => {
  try {
    if (!m.isGroup) return

    let db = loadDB()
    checkResets(db, conn)

    if (!db.users[m.sender]) {
      db.users[m.sender] = {
        xp: 0,
        level: 0,
        daily: 0,
        weekly: 0,
        global: 0,
        lastMessage: 0,
        notifiedTop3: false
      }
    }

    let user = db.users[m.sender]
    const nowTime = Date.now()

    // Anti-spam XP (max 1 XP ogni 3 sec)
    if (!user.lastMessage || nowTime - user.lastMessage > 3000) {
      user.xp += 5
      user.lastMessage = nowTime
    }

    // Incrementa sempre contatori
    user.daily = (user.daily || 0) + 1
    user.weekly = (user.weekly || 0) + 1
    user.global = (user.global || 0) + 1

    // Level up
    const newLevel = calculateLevel(user.xp)
    if (newLevel > user.level) {
      user.level = newLevel
      await conn.sendMessage(m.chat, {
        text: `🎉 @${m.sender.split('@')[0]} è salito al livello ${newLevel}!\n🎖 Badge: ${getBadge(newLevel)}`,
        mentions: [m.sender]
      })
    }

    saveDB(db)

    // COMANDI
    if (command === 'rank') {
      return m.reply(
`📊 *IL TUO PROFILO*

⭐ XP: ${user.xp}
🏅 Livello: ${user.level}
🎖 Badge: ${getBadge(user.level)}

💬 Oggi: ${user.daily}
📅 Settimana: ${user.weekly}
🌍 Totale: ${user.global}`
      )
    }

    if (['topday', 'topweek', 'topglobal'].includes(command)) {
      const type = command === 'topday' ? 'daily' : command === 'topweek' ? 'weekly' : 'global'
      const ranking = getRanking(db, type)

      if (!ranking.length) return m.reply(`⚠️ Nessun dato disponibile per ${command}`)

      let text = `🏆 *TOP ${type.toUpperCase()}*\n\n`
      let mentions = []
      const medals = ['🥇', '🥈', '🥉']

      ranking.slice(0, 10).forEach(([jid, total], i) => {
        mentions.push(jid)
        text += `${medals[i] || (i + 1) + '°'} @${jid.split('@')[0]}\n   💬 ${total}\n\n`
      })

      return await conn.sendMessage(m.chat, { text, mentions })
    }

    if (command === 'resoconto') {
      await sendResoconto(conn, db, m.chat)
    }

  } catch (err) {
    console.error('❌ Errore nel plugin XP:', err)
  }
}

handler.command = ['rank', 'topday', 'topweek', 'topglobal', 'resoconto']
handler.tags = ['xp']
handler.help = ['rank', 'topday', 'topweek', 'topglobal', 'resoconto']

// =========================
// AVVIO RESOCONTO AUTOMATICO
// =========================
if (global.conn) scheduleResoconto(global.conn)

export default handler