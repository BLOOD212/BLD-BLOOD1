import fs from 'fs'

const dbPath = './database.json'

function loadDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: {} }, null, 2))
  }

  let db = JSON.parse(fs.readFileSync(dbPath))
  if (!db.users) db.users = {}

  return db
}

function getRanking(db) {
  return Object.entries(db.users)
    .map(([jid, data]) => {
      let total = data?.messaggi || data?.messages || 0
      return [jid, total]
    })
    .filter(([_, total]) => total > 0)
    .sort((a, b) => b[1] - a[1])
}

let handler = async (m, { conn, command, usedPrefix }) => {

  if (!m.isGroup)
    return m.reply('❌ Questo comando funziona solo nei gruppi.')

  let db = loadDB()
  let ranking = getRanking(db)

  if (!ranking.length)
    return m.reply('⚠️ Nessun messaggio registrato nel database.')

  let userJid = m.sender
  let userPosition = ranking.findIndex(([jid]) => jid === userJid) + 1

  // =========================
  // 📊 STATS (MESSAGGI GRUPPO)
  // =========================
  if (command === 'resoconto') {

    let totalGroupMessages = ranking.reduce((acc, [, total]) => acc + total, 0)

    let text =
`📊 *MESSAGGI TOTALI GRUPPO*

💬 *Totale messaggi:* ${totalGroupMessages}
📍 *La tua posizione:* ${userPosition || 'Non classificato'}`

    const buttons = [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "🏆 Top 5",
          id: `${usedPrefix}top5`
        })
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "🔟 Top 10",
          id: `${usedPrefix}top10`
        })
      }
    ]

    return await conn.sendMessage(m.chat, {
      text,
      footer: '📊 Statistiche Gruppo',
      interactiveButtons: buttons
    }, { quoted: m })
  }

  // =========================
  // 🏆 TOP 5
  // =========================
  if (command === 'top5') {

    let top5 = ranking.slice(0, 5)
    let medals = ['🥇', '🥈', '🥉', '🏅', '🏅']
    let mentions = []

    let text = '🏆 *TOP 5 ATTIVITÀ*\n\n'

    top5.forEach(([jid, total], i) => {
      mentions.push(jid)
      text += `${medals[i]} @${jid.split('@')[0]}\n`
      text += `   💬 Messaggi: ${total}\n\n`
    })

    text += `📍 La tua posizione: ${userPosition || 'Non classificato'}`

    return await conn.sendMessage(m.chat, {
      text,
      mentions
    }, { quoted: m })
  }

  // =========================
  // 🔟 TOP 10
  // =========================
  if (command === 'top10') {

    let top10 = ranking.slice(0, 10)
    let mentions = []

    let text = '🔟 *TOP 10 ATTIVITÀ*\n\n'

    top10.forEach(([jid, total], i) => {
      mentions.push(jid)
      text += `${i + 1}° @${jid.split('@')[0]}\n`
      text += `   💬 Messaggi: ${total}\n\n`
    })

    text += `📍 La tua posizione: ${userPosition || 'Non classificato'}`

    return await conn.sendMessage(m.chat, {
      text,
      mentions
    }, { quoted: m })
  }
}

handler.command = ['resoconto', 'top5', 'top10']
handler.tags = ['stats']
handler.help = ['stats']

export default handler