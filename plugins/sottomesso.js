const handler = async (msg, { conn, command, text }) => {
  const chatId = msg.chat;

  let mentionedJids = msg.mentionedJid || [];
  if (msg.quoted?.sender) mentionedJids.push(msg.quoted.sender);

  if (mentionedJids.length === 0 && text) {
    const potentialNumbers = text.split(/\s+/).map(t => t.replace(/[^0-9]/g, ''));
    for (let number of potentialNumbers) {
      if (number.length >= 8 && number.length <= 15) {
        mentionedJids.push(number + '@s.whatsapp.net');
      }
    }
  }

  if (mentionedJids.length === 0)
    return conn.reply(
      chatId,
      `Chi vuoi vedere quanto è sottomesso? ❌

Ops! Non hai taggato nessuno né risposto a un messaggio.

💡 Suggerimento: Tagga un utente o rispondi a un suo messaggio per scoprire il suo livello di sottomissione!`,
      msg
    );

  // Funzione per generare barra animata parziale
  const generateProgressFrame = (percent, step) => {
    const totalBars = 20;
    const filledBars = Math.round((percent / 100) * totalBars * (step / 3));
    const emptyBars = totalBars - filledBars;
    const emojis = ['💧','🔥','🌿','⚡'];
    const movingEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    let bar = '';
    for (let i = 0; i < filledBars; i++) {
      bar += i === filledBars - 1 ? movingEmoji : '█';
    }
    bar += '░'.repeat(emptyBars);
    return bar;
  };

  // Funzione per generare messaggio finale
  const generateFinalMessage = (jid, percent, progressBar) => {
    const tag = '@' + jid.split('@')[0];
    let comment;
    if (percent <= 20) comment = '😎 Quasi indipendente!';
    else if (percent <= 50) comment = '😐 Moderatamente sottomesso';
    else if (percent <= 80) comment = '😅 Sottomesso';
    else comment = '😱 Totale sottomissione!';
    return `👤 Utente: ${tag}
📊 Livello: ${percent}%
${progressBar}
🔮 ${comment}`;
  };

  // Ciclo per ogni utente menzionato
  for (let jid of mentionedJids) {
    const percent = Math.floor(Math.random() * 101);

    // Invia 3 “frame” per simulare la barra che si riempie
    for (let step = 1; step <= 3; step++) {
      const progressBar = generateProgressFrame(percent, step);
      await conn.sendMessage(chatId, { text: `📊 Livello in progresso:\n${progressBar}` });
      await new Promise(resolve => setTimeout(resolve, 500)); // mezzo secondo tra frame
    }

    // Messaggio finale con commento
    const progressBar = generateProgressFrame(percent, 3);
    await conn.sendMessage(chatId, {
      text: generateFinalMessage(jid, percent, progressBar),
      mentions: [jid],
    });
  }
};

handler.command = /^(sottomesso|sottomessa)$/i;
handler.group = true;

export default handler;