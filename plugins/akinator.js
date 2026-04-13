let handler = async (m, { conn, text, usedPrefix, command }) => {
  let nomeDelBot = global.db.data.nomedelbot || `𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙`
  
  // Inizializziamo la sessione di gioco
  conn.akinatorIA = conn.akinatorIA ? conn.akinatorIA : {}

  // Gestione dell'input (da bottone o da testo)
  let scelta = m.quoted?.buttonsMessage?.buttons[0]?.buttonId || m.msg?.selectedButtonId || text?.trim()

  // Reset della partita
  if (scelta === 'stop' || scelta === 'reset') {
    delete conn.akinatorIA[m.sender]
    return m.reply("🎮 Partita terminata. Ho perso? 🧞‍♂️")
  }

  const promptSistema = `Sei Akinator, il genio del web. Il tuo obiettivo è indovinare il personaggio a cui l'utente sta pensando facendo una domanda alla volta. 
  REGOLE:
  1. Fai una domanda alla volta (massimo 15 parole per domanda).
  2. Aspetta la risposta dell'utente.
  3. Quando sei sicuro, scrivi: "IL PERSONAGGIO È: [Nome]".
  4. Sii breve, misterioso e divertente.`

  // 1. GESTIONE PARTITA IN CORSO
  if (conn.akinatorIA[m.sender]) {
    let sessione = conn.akinatorIA[m.sender]
    
    // Aggiungiamo la risposta alla cronologia
    sessione.messaggi.push({ role: "user", content: scelta })

    try {
      // CHIAMATA ALL'IA (Sostituisci con la tua funzione specifica se necessario)
      let rispostaIA = await global.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: promptSistema }, ...sessione.messaggi]
      })

      let testoIA = rispostaIA.choices[0].message.content
      sessione.messaggi.push({ role: "assistant", content: testoIA })

      // Se l'IA ha indovinato
      if (testoIA.includes("IL PERSONAGGIO È:")) {
        delete conn.akinatorIA[m.sender]
        return m.reply(`${testoIA}\n\n✨ *Grazie per aver giocato con ${nomeDelBot}!*`)
      }

      return inviaBottoni(conn, m, testoIA, usedPrefix, command)

    } catch (e) {
      console.error(e)
      return m.reply("❌ Errore nell'IA. Controlla le tue API Key.")
    }
  }

  // 2. AVVIO NUOVA PARTITA
  conn.akinatorIA[m.sender] = { messaggi: [] }
  let domandaIniziale = "🧞‍♂️ *BENVENUTO SU AKINATOR AI!*\n\nPensa a un personaggio. Io proverò a indovinarlo.\n\n*Iniziamo: il tuo personaggio è reale?*"
  
  return inviaBottoni(conn, m, domandaIniziale, usedPrefix, command)
}

// Funzione per inviare il messaggio con i tasti
async function inviaBottoni(conn, m, testo, usedPrefix, command) {
  const buttons = [
    { index: 1, quickReplyButton: { displayText: 'Sì ✅', id: `si` } },
    { index: 2, quickReplyButton: { displayText: 'No ❌', id: `no` } },
    { index: 3, quickReplyButton: { displayText: 'Boh 🤷‍♂️', id: `non lo so` } },
    { index: 4, quickReplyButton: { displayText: 'Esci 🚪', id: `stop` } }
  ]

  const templateMessage = {
    text: testo,
    footer: "Rispondi cliccando sui tasti qui sotto",
    templateButtons: buttons,
    viewOnce: true
  }

  return await conn.sendMessage(m.chat, templateMessage, { quoted: m })
}

handler.help = ['akinator']
handler.tags = ['giochi']
handler.command = /^(akinator|aki)$/i

export default handler
