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
      fs.writeFileSync(dbPath, JSON.stringify({
        users: {},
        lastDailyReset: null,
        lastWeeklyReset: null
      }, null, 2))
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
// CALCOLO SETTIMANA CORRETTO
// =========================
function getWeekNumber(date) {
  const firstDay = new Date(date.getFullYear(), 0, 1)
  const pastDays = (date - firstDay) / 86400000
  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7)
}

// =========================
// RESET AUTOMATICO
// =========================
function checkResets(db) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const week = `${now.getFullYear()}-W${getWeekNumber(now)}`

  // Reset Giornaliero
  if (db.lastDailyReset !== today) {
    console.log('🔄 Reset giornaliero')
    for (let u in db.users) {
      db.users[u].daily = 0
      db.users[u].notifiedTop3 = false
    }
    db.lastDailyReset = today
  }

  // Reset Settimanale
  if (db.lastWeeklyReset !== week) {
    console.log('🔄 Reset settimanale')
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
// RESOCONTO AUTOMATICO
// =========================
async function sendResoconto(conn, db, chatId) {
  const ranking = getRanking(db, 'global')

  if (ranking.length === 0) return

  let text = `📊 *RESOCONTO AUTOMATICO*\n`
  text += `🏆 Top 10 utenti più attivi:\n\n`

  let mentions = []
  const medals = ['🥇', '🥈', '🥉']

  ranking.slice(0, 10).forEach(([jid, total], i) => {
    mentions.push(jid)
    text += `${medals[i] || (i + 1) + '°'} @${jid.split('@')[0]}\n`
    text += `   💬 ${total} messaggi\n\n`
  })

  await conn.sendMessage(chatId, { text, mentions })
}

// Pianificazione giornaliera alle 23:59
async function scheduleResoconto() {
  const now = new Date()
  const next = new Date()
  next.setHours(23, 59, 0, 0)

  if (now > next) next.setDate(next.getDate() + 1)

  const delay = next - now

  setTimeout(async () => {
    const db = loadDB()

    // Scorre tutte le chat dove il bot è attivo
    const chats = Object.keys(global.conn.chats)
    for (let chatId of chats) {
      if (!chatId.endsWith('@g.us')) continue // solo gruppi
      await sendResoconto(global.conn, db, chatId)
    }

    scheduleResoconto() // ripeti domani
  }, delay)
}

scheduleResoconto()

// =========================
// HANDLER
// =========================
let handler = async (m, { conn, command }) => {
  try {
    if (!m.isGroup) return

    console.log('📩 Messaggio ricevuto da:', m.sender)

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
    const nowTime = Date.now()

    // =========================
    // ANTI SPAM (10 sec)
    // =========================
    if (nowTime - user.lastMessage > 10000) {
      user.xp += 5
      user.daily += 1
      user.weekly += 1
      user.global += 1
      user.lastMessage = nowTime
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

    if (['topday','topweek','topglobal'].includes(command)) {

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

    if (command === 'resoconto') {
      await sendResoconto(conn, db, m.chat)
    }

  } catch (err) {
    console.error('❌ Errore nel plugin XP:', err)
  }
}

handler.command = ['rank','topday','topweek','topglobal','resoconto']
handler.tags = ['xp']
handler.help = ['rank','topday','topweek','topglobal','resoconto']

export default handler