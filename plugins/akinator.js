import { Aki } from 'aki-api'

// FIX SSL: Necessario per molti server Linux
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let nomeDelBot = global.db.data.nomedelbot || `𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙`
  
  // Inizializza l'oggetto delle sessioni
  conn.akinator = conn.akinator ? conn.akinator : {}

  // Se l'utente vuole resettare la partita
  if (text === 'reset') {
    delete conn.akinator[m.sender]
    return m.reply("🔄 Sessione di Akinator resettata.")
  }

  // 1. GESTIONE PARTITA IN CORSO
  if (conn.akinator[m.sender]) {
    let { aki, msg } = conn.akinator[m.sender]
    
    // Controlla che l'input sia un numero valido
    if (!text || isNaN(text) || text < 0 || text > 4) {
      return m.reply(`⚠ Rispondi con un numero da 0 a 4!\n\n0 = Sì\n1 = No\n2 = Non so\n3 = Probabilmente sì\n4 = Probabilmente no`)
    }

    try {
      await aki.step(text.trim())

      if (aki.progress >= 80 || aki.currentStep >= 70) {
        await aki.win()
        let personaggio = aki.answers[0]
        let txt = `✨ *L'HO INDOVINATO!* ✨\n\n`
        txt += `👤 *Nome:* ${personaggio.name}\n`
        txt += `📝 *Descrizione:* ${personaggio.description}\n\n`
        txt += `*${nomeDelBot}*`
        
        await conn.sendMessage(m.chat, { 
          image: { url: personaggio.absolute_picture_path }, 
          caption: txt 
        }, { quoted: m })
        
        delete conn.akinator[m.sender]
        return
      }

      let domanda = `*🤖 AKINATOR - Domanda n. ${aki.currentStep + 1}*\n\n`
      domanda += `> _${aki.question}_\n\n`
      domanda += `0 (Sì), 1 (No), 2 (Boh), 3 (Probabile), 4 (Probabile No)`

      await conn.sendMessage(m.chat, { text: domanda, edit: msg }, { quoted: m })

    } catch (e) {
      console.error("[ERRORE AKINATOR]:", e.message)
      delete conn.akinator[m.sender]
      return m.reply("❌ Akinator mi ha bloccato (Cloudflare 403). Riprova tra un po'.")
    }

  } else {
    // 2. AVVIO NUOVA PARTITA
    try {
      // Tentativo di avvio con parametri IT
      let aki = new Aki({ 
        region: 'it', 
        childMode: false 
      })
      
      await aki.start()
      
      let intro = `*🎮 AKINATOR È INIZIATO!*\n\n`
      intro += `*Domanda n. 1:*\n> _${aki.question}_\n\n`
      intro += `Rispondi con *${usedPrefix + command} [numero]*`

      let { key } = await conn.sendMessage(m.chat, { text: intro }, { quoted: m })
      
      conn.akinator[m.sender] = { aki, msg: key }

    } catch (e) {
      console.error("[ERRORE AVVIO]:", e.message)
      // Se fallisce qui, l'IP è bannato
      return m.reply("❌ Errore 403: Il server di Akinator ha bloccato il bot. L'IP del tuo server è segnalato come bot.")
    }
  }
}

handler.help = ['akinator']
handler.tags = ['giochi']
handler.command = /^(akinator|aki)$/i

export default handler
