import fs from 'fs'

const dbPath = './database.json'

// =========================
// DATABASE
// =========================
function loadDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({
      users: {},
      lastDailyReset: null,
      lastWeeklyReset: null
    }, null, 2))
  }

  let db = JSON.parse(fs.readFileSync(dbPath))

  if (!db.users) db.users = {}
  return db
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

// =========================
// RESET AUTOMATICO
// =========================
function checkResets(db) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const week = `${now.getFullYear()}-W${Math.ceil((now.getDate()) / 7)}`

  // Reset Giornaliero
  if (db.lastDailyReset !== today) {
    for (let u in db.users) {
      db.users[u].daily = 0
      db.users[u].notifiedTop3 = false
    }
    db.lastDailyReset = today
  }

  // Reset Settimanale
  if (db.lastWeeklyReset !== week) {
    for (let u in db.users) {
      db.users[u].weekly = 0
    }
    db.lastWeeklyReset = week
  }

  saveDB(db)
}

// =========================
// XP + LEVEL SYSTEM
// =========================
function calculateLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp))
}

function getBadge(level) {
  if (level >= 30) return "👑 Re del Gruppo"
  if (level >= 15) return "🔥 Spammer Leggendario"
  if (level >= 5) return "💬 Chiacchierone"
  return "🐣 Newbie"
}

// =========================
// RANKING
// =========================
function getRanking(db, type) {
  return Object.entries(db.users)
    .map(([jid, data]) => [jid, data[type] || 0])
    .filter(([_, total]) => total > 0)
    .sort((a, b) => b[1] - a[1])
}

// =========================
// HANDLER
// =========================
let handler = async (m, { conn, command, usedPrefix }) => {
  if (!m.isGroup)
    return m.reply('❌ Solo nei gruppi 😅')

  let db = loadDB()
  checkResets(db)

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
  const now = Date.now()

  // =========================
  // ANTI SPAM (10 sec)
  // =========================
  if (now - user.lastMessage > 10000) {
    user.xp += 5
    user.daily += 1
    user.weekly += 1
    user.global += 1
    user.lastMessage = now
  }

  // =========================
  // LEVEL UP
  // =========================
  const newLevel = calculateLevel(user.xp)

  if (newLevel > user.level) {
    user.level = newLevel
    await conn.sendMessage(m.chat, {
      text: `🎉 @${m.sender.split('@')[0]} è salito al livello ${newLevel}!\n🎖 Badge: ${getBadge(newLevel)}`,
      mentions: [m.sender]
    })
  }

  saveDB(db)

  // =========================
  // COMANDI
  // =========================
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

  if (command === 'topday' || command === 'topweek' || command === 'topglobal') {

    const type =
      command === 'topday' ? 'daily' :
      command === 'topweek' ? 'weekly' :
      'global'

    const ranking = getRanking(db, type)

    let text = `🏆 *TOP ${type.toUpperCase()}*\n\n`
    let mentions = []
    const medals = ['🥇', '🥈', '🥉']

    ranking.slice(0, 10).forEach(([jid, total], i) => {
      mentions.push(jid)
      text += `${medals[i] || (i + 1) + '°'} @${jid.split('@')[0]}\n`
      text += `   💬 ${total}\n\n`
    })

    return await conn.sendMessage(m.chat, { text, mentions })
  }
}

handler.command = [
  'rank',
  'topday',
  'topweek',
  'topglobal'
]

handler.tags = ['xp']
handler.help = [
  'rank',
  'topday',
  'topweek',
  'topglobal'
]

export default handler