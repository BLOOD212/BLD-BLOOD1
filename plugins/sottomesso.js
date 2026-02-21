const handler = async (msg, { conn, command, text }) => {
  let mentionedJid = msg.mentionedJid?.[0] || msg.quoted?.sender;

  if (!mentionedJid && text) {
    if (text.endsWith('@s.whatsapp.net') || text.endsWith('@c.us')) {
      mentionedJid = text.trim();
    } else {
      let number = text.replace(/[^0-9]/g, '');
      if (number.length >= 8 && number.length <= 15) {
        mentionedJid = number + '@s.whatsapp.net';
      }
    }
  }

  const chatId = msg.chat;

  if (!mentionedJid)
    return conn.reply(
      chatId,
      `╭━━━━━━━⚠️━━━━━━━╮
│   𝐄𝐑𝐑𝐎𝐑𝐄   │
╰━━━━━━━⚠️━━━━━━━╯

❌ Tagga qualcuno per scoprire il suo livello di sottomissione.`,
      msg
    );

  const tag = '@' + mentionedJid.split('@')[0];
  const randomPercent = Math.floor(Math.random() * 101); // 0-100%

  // Creiamo una barra di progresso
  const totalBars = 20;
  const filledBars = Math.round((randomPercent / 100) * totalBars);
  const emptyBars = totalBars - filledBars;
  const progressBar = '█'.repeat(filledBars) + '░'.repeat(emptyBars);

  return conn.sendMessage(chatId, {
    text: `
╭━━━━━━✨ 𝐒𝐎𝐓𝐓𝐎𝐌𝐄𝐒𝐒𝐎 ✨━━━━━━╮
│  
│  👤 Utente: ${tag}
│  📊 Sottomissione: ${randomPercent}%
│  ░░${progressBar}░░
│  
╰━━━━━━━💫━━━━━━━━━╯
🔮 Più sottomesso di quanto sembri!`,
    mentions: [mentionedJid],
  });
};

handler.command = /^(sottomesso|sottomessa)$/i;
handler.group = true;

export default handler;