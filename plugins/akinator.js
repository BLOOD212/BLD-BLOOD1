import { Aki } from 'aki-api'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  conn.akinator = conn.akinator ? conn.akinator : {}
  
  // Rileva input da bottoni o testo
  let scelta = m.msg?.selectedButtonId || m.msg?.contextInfo?.externalAdReply?.title || text?.trim()
  if (scelta && scelta.includes(usedPrefix + command)) {
      scelta = scelta.replace(usedPrefix + command, '').trim()
  }

  if (conn.akinator[m.sender]) {
    let { aki, msg } = conn.akinator[m.sender]
    if (scelta === 'stop') {
        delete conn.akinator[m.sender]
        return m.reply("Partita annullata.")
    }

    try {
      await aki.step(scelta)
      if (aki.progress >= 80) {
        await aki.win()
        let p = aki.answers[0]
        let txt = `🧞‍♂️ *L'HO PRESO!*\n\n👤 *Nome:* ${p.name}\n📝 *Desc:* ${p.description}`
        await conn.sendMessage(m.chat, { image: { url: p.absolute_picture_path }, caption: txt }, { quoted: m })
        delete conn.akinator[m.sender]
        return
      }
      await inviaAki(conn, m, aki, usedPrefix, command)
    } catch (e) {
      delete conn.akinator[m.sender]
      return m.reply("❌ Errore: Il server Akinator ha rifiutato la connessione.")
    }
  } else {
    let aki = new Aki({ region: 'it' })
    await aki.start()
    conn.akinator[m.sender] = { aki }
    await inviaAki(conn, m, aki, usedPrefix, command)
  }
}

async function inviaAki(conn, m, aki, usedPrefix, command) {
  let sections = [
    { title: "Rispondi", rows: [
        {title: "Sì", rowId: `${usedPrefix + command} 0`},
        {title: "No", rowId: `${usedPrefix + command} 1`},
        {title: "Non so", rowId: `${usedPrefix + command} 2`},
        {title: "Probabile", rowId: `${usedPrefix + command} 3`},
        {title: "Probabile No", rowId: `${usedPrefix + command} 4`},
        {title: "STOP", rowId: `${usedPrefix + command} stop`}
    ]}
  ]
  const listMessage = {
    text: `*🤖 AKINATOR*\n\n*Domanda:* ${aki.question}\n*Progresso:* ${Math.round(aki.progress)}%`,
    footer: "Seleziona una risposta",
    buttonText: "Scegli 🧞‍♂️",
    sections
  }
  return await conn.sendMessage(m.chat, listMessage, { quoted: m })
}

handler.command = /^(akinator|aki)$/i
export default handler
