const handler = async (m, { conn, participants, text }) => {
  try {
    const users = participants.map(u => conn.decodeJid(u.id));

    const messageText = text && text.trim().length > 0
      ? text
      : '📢';

    for (let i = 0; i < 10; i++) {
      await conn.sendMessage(m.chat, {
        text: messageText,
        mentions: users
      });
    }

  } catch (e) {
    console.error('Errore bigtag:', e);
    m.reply('❌ Si è verificato un errore');
  }
};

handler.help = ['bigtag <testo>'];
handler.tags = ['gruppo'];
handler.command = /^\.?bigtag$/i;
handler.owner = true;
handler.group = true;

export default handler;
