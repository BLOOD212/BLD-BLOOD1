//plug-in di blood
globalThis.archivioMessaggi = globalThis.archivioMessaggi || {};

let handler = async (m, { conn, command }) => {
  // Lasciamo il comando manuale per testare il resoconto quando vuoi
  await inviaResocontoSettimanale(m.chat, conn);
};

// --- LOGICA DI SALVATAGGIO (Eseguita su OGNI messaggio) ---
handler.before = async function (m) {
  if (!m.chat || !m.text || m.isBaileys || !m.isGroup) return; 
  
  let chat = m.chat;
  let user = m.sender;

  if (!globalThis.archivioMessaggi[chat]) globalThis.archivioMessaggi[chat] = { totali: 0, utenti: {} };

  // Incrementa contatore totale del gruppo
  globalThis.archivioMessaggi[chat].totali += 1;

  // Incrementa contatore del singolo utente
  let nome = m.pushName || 'Utente Misterioso';
  if (!globalThis.archivioMessaggi[chat].utenti[user]) {
    globalThis.archivioMessaggi[chat].utenti[user] = { nome: nome, conteggio: 0 };
  }
  globalThis.archivioMessaggi[chat].utenti[user].conteggio += 1;
};

// --- FUNZIONE PER GENERARE E INVIARE IL RESOCONTO ---
async function inviaResocontoSettimanale(chatId, conn) {
  let dati = globalThis.archivioMessaggi[chatId];
  
  if (!dati || dati.totali === 0) {
    return conn.sendMessage(chatId, { text: "🌙 *Resoconto di Mezzanotte*\n\nOggi il gruppo è stato silenzioso come una tomba. Nessun messaggio registrato." });
  }

  // Creiamo la Top 3
  let classifica = Object.values(dati.utenti)
    .sort((a, b) => b.conteggio - a.conteggio)
    .slice(0, 3);

  let report = `🌙 *RESOCONTO DI MEZZANOTTE* 🌙\n`;
  report += `──────────────────\n\n`;
  report += `📊 Messaggi totali oggi: *${dati.totali}*\n\n`;
  report += `🏆 *TOP 3 CHIACCHIERONI:* \n`;

  const medaglie = ['🥇', '🥈', '🥉'];
  classifica.forEach((u, i) => {
    report += `${medaglie[i]} *${u.nome}*: ${u.conteggio} messaggi\n`;
  });

  report += `\n──────────────────\n`;
  report += `🧹 *I contatori sono stati resettati.* \nBuon riposo (o buona serata) a tutti! 😴`;

  await conn.sendMessage(chatId, { text: report });

  // Reset dei dati per il giorno dopo
  globalThis.archivioMessaggi[chatId] = { totali: 0, utenti: {} };
}

// --- AUTOMAZIONE A MEZZANOTTE ---
// Questa funzione controlla l'ora ogni minuto e si attiva a mezzanotte spaccata
setInterval(async () => {
    let ora = new Date().getHours();
    let minuti = new Date().getMinutes();
    
    // Se è mezzanotte e zero minuti
    if (ora === 0 && minuti === 0) {
        let gruppi = Object.keys(globalThis.archivioMessaggi);
        for (let gid of gruppi) {
            // "conn" deve essere accessibile globalmente o passato dal modulo principale
            if (globalThis.conn) { 
                await inviaResocontoSettimanale(gid, globalThis.conn);
            }
        }
    }
}, 60000); // Controlla ogni 60 secondi

handler.help = ['resoconto'];
handler.tags = ['strumenti'];
handler.command = /^(resoconto)$/i;
handler.group = true;

export default handler;
