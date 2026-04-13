let handler = async (m, { conn, text, usedPrefix, command }) => {
  let nomeDelBot = global.db.data.nomedelbot || `𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙`
  
  // Inizializziamo la sessione di gioco
  conn.akinatorIA = conn.akinatorIA ? conn.akinatorIA : {}

  // Comando per fermare il gioco
  if (text === 'stop' || text === 'reset') {
    delete conn.akinatorIA[m.sender]
    return m.reply("🎮 Partita terminata. Ho perso?")
  }

  // Messaggio di sistema per istruire l'IA
  const promptSistema = `Sei Akinator, il genio del web. Il tuo obiettivo è indovinare il personaggio a cui l'utente sta pensando facendo una domanda alla volta. 
  REGOLE:
  1. Fai una domanda alla volta.
  2. Aspetta la risposta dell'utente (Sì, No, Forse, ecc.).
  3. Quando sei sicuro al 90%, scrivi: "IL PERSONAGGIO È: [Nome]".
  4. Sii misterioso e divertente.`

  // 1. GESTIONE PARTITA IN CORSO
  if (conn.akinatorIA[m.sender]) {
    let sessione = conn.akinatorIA[m.sender]
    
    // Aggiungiamo la risposta dell'utente alla cronologia
    sessione.messaggi.push({ role: "user", content: text })

    try {
      // Chiamata all'IA (adattala alla funzione che usa il tuo bot per ChatGPT)
      // Esempio generico:
      let rispostaIA = await global.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: promptSistema }, ...sessione.messaggi]
      })

      let testoIA = rispostaIA.choices[0].message.content
      sessione.messaggi.push({ role: "assistant", content: testoIA })

      // Se l'IA ha indovinato, chiudiamo la sessione
      if (testoIA.includes("IL PERSONAGGIO È:")) {
        delete conn.akinatorIA[m.sender]
        return m.reply(testoIA + "\n\n✨ *Grazie per aver giocato!*")
      }

      return m.reply(`*🤖 AKINATOR AI*\n\n${testoIA}\n\n_(Rispondi a questo messaggio o usa ${usedPrefix + command} [risposta])_`)

    } catch (e) {
      return m.reply("❌ Errore nell'IA. Assicurati che le API siano cariche.")
    }
  }

  // 2. AVVIO NUOVA PARTITA
  conn.akinatorIA[m.sender] = {
    messaggi: []
  }

  return m.reply(`*🧞‍♂️ BENVENUTO SU AKINATOR AI!*\n\nPensa a un personaggio reale o immaginario. Io proverò a indovinarlo.\n\n*Iniziamo: il tuo personaggio è maschio?*`)
}

handler.help = ['akinator']
handler.tags = ['giochi']
handler.command = /^(akinator|aki)$/i

export default handler
