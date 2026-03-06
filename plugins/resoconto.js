// plug-in di blood 
let handler = async (m, { conn }) => {
  let chatId = m.chat;
  
  // Inizializza se non esiste nel database persistente
  if (!global.db.data.chats[chatId].statsGiornaliere) {
    global.db.data.chats[chatId].statsGiornaliere = { totali: 0, utenti: {}, data: new Date().toLocaleDateString() };
  }

  let dati = global.db.data.chats[chatId].statsGiornaliere;

  if (dati.totali === 0) {
    return m.reply("📊 *STATISTICHE ATTUALI*\n\nNessun messaggio registrato oggi.");
  }

  let classifica = Object.values(dati.utenti)
    .sort((a, b) => b.conteggio - a.conteggio)
    .slice(0, 5); // Estesa a top 5 per più precisione

  let report = `📊 *STATISTICHE IN TEMPO REALE* 📊\n`;
  report += `_Dati salvati nel database_\n`;
  report += `──────────────────\n\n`;
  report += `💬 Messaggi totali: *${dati.totali}*\n\n`;
  report += `🏆 *TOP PARLATORI:* \n`;

  const medaglie = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  classifica.forEach((u, i) => {
    report += `${medaglie[i]} *${u.nome}*: ${u.conteggio} messaggi\n`;
  });

  report += `\n──────────────────\n`;
  report += `👉 _Reset automatico a mezzanotte._`;

  await conn.sendMessage(chatId, { text: report }, { quoted: m });
};

// --- REGISTRAZIONE PERSISTENTE ---
handler.before = async function (m) {
  if (!m.chat || !m.text || m.isBaileys || !m.isGroup) return; 

  let chat = m.chat;
  let user = m.sender;

  // Assicurati che la struttura esista nel database globale del bot
  if (!global.db.data.chats[chat]) global.db.data.chats[chat] = {};
  if (!global.db.data.chats[chat].statsGiornaliere) {
    global.db.data.chats[chat].statsGiornaliere = { totali: 0, utenti: {}, data: new Date().toLocaleDateString() };
  }

  let stats = global.db.data.chats[chat].statsGiornaliere;

  // Controllo sicurezza: se la data è diversa da quella salvata, resetta (gestione fallback mezzanotte)
  let oggi = new Date().toLocaleDateString();
  if (stats.data !== oggi) {
    stats.totali = 0;
    stats.utenti = {};
    stats.data = oggi;
  }

  stats.totali += 1;
  let nome = m.pushName || 'Utente';
  if (!stats.utenti[user]) {
    stats.utenti[user] = { nome: nome, conteggio: 0 };
  }
  stats.utenti[user].conteggio += 1;
};

// --- AUTOMAZIONE MEZZANOTTE CON DATABASE ---
setInterval(async () => {
    let ora = new Date().getHours();
    let minuti = new Date().getMinutes();

    if (ora === 0 && minuti === 0) {
        let chats = global.db.data.chats;
        for (let gid in chats) {
            let dati = chats[gid].statsGiornaliere;
            if (!dati || dati.totali === 0) continue;

            let classifica = Object.values(dati.utenti)
                .sort((a, b) => b.conteggio - a.conteggio)
                .slice(0, 3);

            let reportFinal = `🌙 *RESOCONTO FINALE DELLA GIORNATA* 🌙\n`;
            reportFinal += `──────────────────\n\n`;
            reportFinal += `📊 Totale messaggi: *${dati.totali}*\n\n`;
            reportFinal += `🏆 *PODIO DI OGGI:* \n`;

            const medaglie = ['🥇', '🥈', '🥉'];
            classifica.forEach((u, i) => {
                reportFinal += `${medaglie[i]} *${u.nome}*: ${u.conteggio}\n`;
            });

            reportFinal += `\n✨ *Database pulito. A domani!*`;

            if (global.conn) await global.conn.sendMessage(gid, { text: reportFinal }).catch(e => console.error(e));
            
            // Reset definitivo
            chats[gid].statsGiornaliere = { totali: 0, utenti: {}, data: new Date().toLocaleDateString() };
        }
    }
}, 60000);

handler.help = ['resoconto'];
handler.tags = ['strumenti'];
handler.command = /^(resoconto)$/i;
handler.group = true;

export default handler;
