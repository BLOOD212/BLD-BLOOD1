import fs from 'fs'
import cron from 'node-cron'

const dbPath = './database.json'

function loadDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: {} }, null, 2))
  }
  let db = JSON.parse(fs.readFileSync(dbPath))
  if (!db.users) db.users = {}
  return db
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

// Reset giornaliero
function resetDailyRanking() {
  let db = loadDB()
  db.users = {}
  saveDB(db)
  console.log('🕛 Classifica giornaliera resettata alle 00:00')
}

// Cron job: ogni giorno a mezzanotte
cron.schedule('0 0 * * *', () => {
  resetDailyRanking()
})

function getRanking(db) {
  return Object.entries(db.users)
    .map(([jid, data]) => [jid, data?.messaggi || data?.messages || 0])
    .filter(([_, total]) => total > 0)
    .sort((a, b) => b[1] - a[1])
}

function generaTop(ranking, limit, userPosition, medals = []) {
  let text = `🏆 *TOP ${limit} ATTIVITÀ DEL GRUPPO*\n\n`
  let mentions = []

  ranking.slice(0, limit).forEach(([jid, total], i) => {
    mentions.push(jid)
    let medal = medals[i] || `${i + 1}°`
    text += `${medal} @${jid.split('@')[0]}\n   💬 Messaggi: ${total}\n\n`
  })

  text += `📍 La tua posizione: ${userPosition || 'Non classificato'}\n`
  text += `⏰ La classifica si resetta ogni 24h da mezzanotte in poi (nerd style 😎)`
  return { text, mentions }
}

// =========================
// Handler comandi e aggiornamento messaggi
// =========================
let handler = async (m, { conn, command, usedPrefix }) => {
  if (!m.isGroup)
    return m.reply('❌ Questo comando funziona solo nei gruppi nerd 😅')

  let db = loadDB()
  if (!db.users[m.sender]) db.users[m.sender] = { messaggi: 0 }

  // 🔹 Incremento messaggi dell’utente
  db.users[m.sender].messaggi += 1
  saveDB(db)

  let ranking = getRanking(db)
  let userIndex = ranking.findIndex(([jid]) => jid === m.sender)
  let userPosition = userIndex !== -1 ? userIndex + 1 : null

  // 🔹 Notifica se entra nella Top 3
  if (userPosition && userPosition <= 3 && db.users[m.sender].notifiedTop3 !== true) {
    await conn.sendMessage(m.chat, {
      text: `🎉 Wow! @${m.sender.split('@')[0]} è entrato nella TOP 3 del gruppo! 🏆\nKeep spamming those messages 😎`,
      mentions: [m.sender]
    })
    db.users[m.sender].notifiedTop3 = true
    saveDB(db)
  }

  // =========================
  // Comandi: resoconto / top5 / top10
  // =========================
  if (command === 'resoconto') {
    let totalGroupMessages = ranking.reduce((acc, [, total]) => acc + total, 0)
    let text =
`📊 *MESSAGGI TOTALI GRUPPO*

💬 *Totale messaggi:* ${totalGroupMessages}
📍 *La tua posizione:* ${userPosition || 'Non classificato'}
💡 Nerd tip: la top si resetta ogni giorno alle 00:00 🕛`

    const buttons = [
      { buttonId: `${usedPrefix}top5`, buttonText: { displayText: '🏆 Top 5' }, type: 1 },
      { buttonId: `${usedPrefix}top10`, buttonText: { displayText: '🔟 Top 10' }, type: 1 }
    ]

    return await conn.sendMessage(m.chat, {
      text,
      footer: '📊 Statistiche Gruppo nerd style 😎',
      buttons
    }, { quoted: m })
  }

  if (command === 'top5' || command === 'top10') {
    const limit = command === 'top5' ? 5 : 10
    const medals = ['🥇', '🥈', '🥉', '🏅', '🏅']
    const { text, mentions } = generaTop(ranking, limit, userPosition, medals)

    return await conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
  }
}

// Comandi
handler.command = ['resoconto', 'top5', 'top10']
handler.tags = ['stats']
handler.help = ['stats']

export default handler