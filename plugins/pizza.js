const pizzaCondimenti = [
  '**Formaggio 🧀**',
  '**Salsa 🍅**',
  '**Wurstel 🍖**',
  '**Patatine 🍟**',
  '**Salame 🍖**',
  '**Piccante 🔥**',
  '**Ananas 🍍**',
  '**Acciughe 🐟**',
  '**Mozzarella 🧀**',
  '**Pistacchio 🌰**',
  '**Bufala 🐃**',
  '**Mortadella 🍖**',
  '**Prosciutto 🍖**',
  '**Funghi 🍄**',
  '**Olive 🫒**',
  '**Capricciosa 🍕**',
  '**Gruyère 🧀**',
  '**Gombas 🍄**',
  '**Peperoni 🔥**',
  '**Prosciutto crudo 🍖**',
  '**Ricotta 🧀**',
  '**Spinaci 🥗**',
  '**Tonno 🐟**',
  '**Zucchini 🥒**',
];

const playAgainButtons = () => [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Ordina un\'altra pizza! 🍕', id: `.pizza` }) }];

let handler = async (m, { conn, args }) => {
  let frasi = [
    `🍕 **Scegli i condimenti per la tua pizza!**`,
    `🔥 **Personalizza la tua pizza!**`,
    `🌟 **Crea la tua pizza ideale!**`,
    `🧂 **Scegli i tuoi condimenti preferiti!**`,
  ];

  if (global.pizzaGame?.[m.chat]) {
    return m.reply('⚠️ **C\'è già una partita attiva in questo gruppo!**');
  }

  const cooldownKey = `pizza_${m.chat}`;
  const lastGame = global.cooldowns?.[cooldownKey] || 0;
  const now = Date.now();
  const cooldownTime = 5000;
  if (now - lastGame < cooldownTime) {
    const remainingTime = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
    return m.reply(`⏳ **Aspetta ancora ${remainingTime} secondi prima di avviare un nuovo gioco!**`);
  }

  global.cooldowns = global.cooldowns || {};
  global.cooldowns[cooldownKey] = now;

  let frase = frasi[Math.floor(Math.random() * frasi.length)];
  let messaggio = '**Scegli i condimenti per la tua pizza:**\n\n';
  pizzaCondimenti.forEach((condimento, index) => {
    messaggio += `${index + 1}. ${condimento}\n`;
  });
  messaggio += '\n**Rispondi con il numero del condimento (es. 1, 2, 3)**';

  try {
    let msg = await conn.sendMessage(m.chat, { text: messaggio, footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙' }, { quoted: m });
    global.pizzaGame = global.pizzaGame || {};
    global.pizzaGame[m.chat] = {
      id: msg.key.id,
      condimenti: [],
      utente: m.sender,
    };
  } catch (error) {
    console.error('Errore nel gioco pizza:', error);
    m.reply('❌ **Si è verificato un errore durante l\'avvio del gioco**\n\n🔄 **Riprova tra qualche secondo**');
  }
};

handler.before = async (m, { conn }) => {
  const chat = m.chat;
  const game = global.pizzaGame?.[chat];

  if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe) return;

  const scelta = m.text.trim();
  if (pizzaCondimenti[parseInt(scelta) - 1]) {
    game.condimenti.push(pizzaCondimenti[parseInt(scelta) - 1]);
    await conn.sendMessage(m.chat, { text: `**Hai scelto ${pizzaCondimenti[parseInt(scelta) - 1]}.** **Vuoi aggiungere altro? (rispondi con il numero del condimento o "fine")**` });
  } else if (scelta.toLowerCase() === 'fine') {
    const pizza = game.condimenti.join(', ');
    const utente = `@${game.utente.split('@')[0]}`;
    await conn.sendMessage(m.chat, { text: `**PIZZA CREATA DA** ${utente}\n\n**Questa è la tua pizza:** ${pizza}`, footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙', interactiveButtons: playAgainButtons() }, { quoted: m });
    delete global.pizzaGame[m.chat];
  } else {
    await conn.sendMessage(m.chat, { text: '**Scelta non valida. Riprova.**' });
  }
};

handler.help = ['pizza'];
handler.tags = ['giochi'];
handler.command = /^pizza$/i;
handler.group = true;
handler.register = true;

export default handler;