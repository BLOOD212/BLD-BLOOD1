import { Aki } from 'aki-api'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let nomeDelBot = global.db.data.nomedelbot || `𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙`
  
  conn.akinator = conn.akinator ? conn.akinator : {}

  // Se l'utente risponde tramite un bottone o testo
  if (conn.akinator[m.sender]) {
    let { aki } = conn.akinator[m.sender]
    
    // Accetta sia il testo del bottone che il numero
    let input = text.trim()
    let stepMap = { "Sì": 0, "No": 1, "Non so": 2, "Probabilmente sì": 3, "Probabilmente no": 4 }
    let choice = stepMap[input] !== undefined ? stepMap[input] : input

    if (!/^[0-4]$/i.test(choice)) return

    await aki.step(choice)

    if (aki.progress >= 85 || aki.currentStep >= 78) {
      await aki.win()
      let personaggio = aki.answers[0]
      let txt = `✨ *L'HO INDOVINATO!* ✨\n\n`
      txt += `👤 *Personaggio:* ${personaggio.name}\n`
      txt += `📝 *Descrizione:* ${personaggio.description}`
      
      await conn.sendMessage(m.chat, { 
        image: { url: personaje.absolute_picture_path }, 
        caption: txt 
      }, { quoted: m })
      
      delete conn.akinator[m.sender]
      return
    }

    // Invia nuova domanda con bottoni
    await inviaDomanda(conn, m, aki, usedPrefix, command)
  } else {
    // Nuova partita
    let aki = new Aki({ region: 'it' })
    await aki.start()
    conn.akinator[m.sender] = { aki }
    await inviaDomanda(conn, m, aki, usedPrefix, command)
  }
}

// Funzione helper per inviare i bottoni
async function inviaDomanda(conn, m, aki, usedPrefix, command) {
  const buttons = [
    { buttonId: `${usedPrefix + command} 0`, buttonText: { displayText: 'Sì' }, type: 1 },
    { buttonId: `${usedPrefix + command} 1`, buttonText: { displayText: 'No' }, type: 1 },
    { buttonId: `${usedPrefix + command} 2`, buttonText: { displayText: 'Non so' }, type: 1 }
  ]

  const buttonMessage = {
    text: `*🤖 AKINATOR*\n\n*Domanda n. ${aki.currentStep + 1}:*\n> ${aki.question}`,
    footer: `Progresso: ${Math.round(aki.progress)}%`,
    buttons: buttons,
    headerType: 1
  }

  return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

handler.help = ['akinator']
handler.tags = ['giochi']
handler.command = /^(akinator|aki)$/i

export default handler
