// Ranking temporaneo piselli (si resetta al riavvio)
globalThis.piselliRank = globalThis.piselliRank || {};

let handler = async (m, { conn }) => {

  let target = null;

  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender;
  } else {
    return m.reply("Devi menzionare qualcuno 😏");
  }

  // Numero casuale da 0 a 60
  const misura = Math.floor(Math.random() * 61);

  // Frasi troll a seconda della misura
  let fraseRandom = '';
  if (misura <= 10) {
    fraseRandom = `😅 @${target.split("@")[0]} ha solo ${misura}cm... piccolino! 🥲`;
  } else if (misura <= 30) {
    fraseRandom = `😏 @${target.split("@")[0]} ha ${misura}cm, niente male! 😉`;
  } else if (misura <= 50) {
    fraseRandom = `🔥 Wow! @${target.split("@")[0]} sfoggia ${misura}cm! 🍆`;
  } else {
    fraseRandom = `🚀 IMPRESSIONANTE! @${target.split("@")[0]} ha ${misura}cm! 🍆💪`;
  }

  // Salva misura
  if (!globalThis.piselliRank[target]) globalThis.piselliRank[target] = [];
  globalThis.piselliRank[target].push(misura);

  // Calcolo Top 5
  let top5 = Object.entries(globalThis.piselliRank)
    .map(([jid, misure]) => {
      const maxMisura = Math.max(...misure);
      return { jid, maxMisura };
    })
    .sort((a, b) => b.maxMisura - a.maxMisura)
    .slice(0, 5);

  const medaglie = ["🥇", "🥈", "🥉"];

  let classifica = top5
    .map((e, i) => {
      const medaglia = medaglie[i] || "🏅";
      const titoloRe = i === 0 ? " 👑 Re del gruppo" : "";
      return `${medaglia} @${e.jid.split("@")[0]} - ${e.maxMisura}cm 🍆${titoloRe}`;
    })
    .join("\n");

  const testoFinale = `${fraseRandom}\n\n🏆 Top piselli:\n${classifica}`;

  // Menziona solo target + top5
  const mentions = [...new Set([target, ...top5.map(e => e.jid)])];

  await conn.sendMessage(
    m.chat,
    {
      text: testoFinale,
      mentions: mentions
    },
    { quoted: m }
  );
};

handler.help = ['cazzo @utente'];
handler.tags = ['fun'];
handler.command = ['cazzo'];

export default handler;