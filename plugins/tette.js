// Se vuoi mantenere il ranking
globalThis.tetteRank = globalThis.tetteRank || {};

let handler = async (m, { conn }) => {

  let user = null;

  if (m.mentionedJid && m.mentionedJid[0]) {
    user = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    user = m.quoted.sender;
  }

  if (!user) return m.reply('Devi menzionare qualcuno 😏');

  let numero = Math.floor(Math.random() * 9) + 1;
  let lettere = ['A','B','C','D','E','F'];
  let lettera = lettere[Math.floor(Math.random() * lettere.length)];

  let misura = numero + lettera;

  // 10% possibilità negativa
  if (Math.random() < 0.10) {
    misura = '-' + misura;
  }

  let roll = Math.random();
  let rarita = 'COMMON';

  if (roll > 0.95) rarita = 'MYTHIC 🔱';
  else if (roll > 0.85) rarita = 'LEGENDARY 🔥';
  else if (roll > 0.65) rarita = 'EPIC ⚡';
  else if (roll > 0.40) rarita = 'RARE ⭐';

  let fortuna = Math.floor(Math.random() * 101);

  // Ranking
  if (!globalThis.tetteRank[user]) globalThis.tetteRank[user] = 0;
  globalThis.tetteRank[user] += 1;

  let testo =
    'oh @' + user.split('@')[0] + ' ha una ' + misura +
    '\n\n🎲 Rarità: ' + rarita +
    '\n🍀 Fortuna: ' + fortuna + '%' +
    '\n🏆 Livello Caos: ' + globalThis.tetteRank[user];

  await conn.sendMessage(
    m.chat,
    {
      text: testo,
      mentions: [user]
    },
    { quoted: m }
  );
};

handler.help = ['tette',];
handler.tags = ['giochi'];
handler.command = /^(tette)$/i;
handler.group = true;
handler.botAdmin = false;
handler.fail = null;
export default handler;