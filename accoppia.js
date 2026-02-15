let handler = async (m, { conn }) => {

  let sender = m.sender;
  let target = null;

  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender;
  } else {
    return m.reply("Devi menzionare qualcuno da accoppiare 😏");
  }

  // Funzione per ottenere nome leggibile
  const getName = (jid) => {
    return conn.getName ? conn.getName(jid) : jid.split("@")[0];
  };

  const nome1 = getName(sender);
  const nome2 = getName(target);

  // Fusione nomi (prima metà del primo + seconda metà del secondo)
  const metà1 = nome1.substring(0, Math.floor(nome1.length / 2));
  const metà2 = nome2.substring(Math.floor(nome2.length / 2));
  const nomeFuso = (metà1 + metà2).replace(/\s+/g, '');

  // Giudizio random
  const giudiziBelli = [
    "😍 Nome stupendo!",
    "🔥 Suona benissimo!",
    "✨ È una ship perfetta!",
    "💖 Questo nome è arte!"
  ];

  const giudiziBrutti = [
    "💀 Mamma mia che disastro...",
    "😂 Questo nome è tremendo!",
    "🥲 Forse meglio restare amici...",
    "⚠️ Nome approvato da nessuno!"
  ];

  const èBello = Math.random() > 0.5;
  const giudizio = èBello
    ? giudiziBelli[Math.floor(Math.random() * giudiziBelli.length)]
    : giudiziBrutti[Math.floor(Math.random() * giudiziBrutti.length)];

  const testoFinale =
    `💞 Accoppiamento attivato!\n\n` +
    `@${sender.split("@")[0]} + @${target.split("@")[0]} = *${nomeFuso}*\n\n` +
    giudizio;

  await conn.sendMessage(
    m.chat,
    {
      text: testoFinale,
      mentions: [sender, target]
    },
    { quoted: m }
  );
};

handler.help = ['accoppia @utente'];
handler.tags = ['fun'];
handler.command = ['accoppia'];

export default handler;
