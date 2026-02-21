const kebabIngredients = [
  '*Pane pita 🫓*', '*Pane lavash 🫓*', '*Carne di pollo 🍗*', '*Carne di manzo 🥩*', '*Carne di agnello 🐑*',
  '*Insalata 🥗*', '*Pomodori 🍅*', '*Cipolla 🧅*', '*Cetriolini sottaceto 🥒*', '*Peperoni 🌶️*',
  '*Salsa allo yogurt 🥛*', '*Salsa piccante 🔥*', '*Salsa all’aglio 🧄*', '*Patatine fritte 🍟*',
  '*Formaggio feta 🧀*', '*Rucola 🥗*', '*Mais 🌽*', '*Peperoncino fresco 🌶️*'
];

const kebabBotReplies = [
  "🌯 Kebab perfetto!", "😋 Che bontà!", "🔥 Attenzione, questo è piccante!", 
  "🤔 Kebab interessante...", "🎉 Kebab da campioni!", "🙃 Combinazione curiosa!", 
  "😱 Troppi ingredienti!", "🤤 Mmm, che delizia!"
];

const playAgainButtons = () => [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Ordina un altro kebab! 🌯', id: `.kebab` }) }];

let handler = async (m, { conn, args }) => {
  let messages = [
    `🌯 *Scegli gli ingredienti per il tuo kebab!*`,
    `🔥 *Personalizza il tuo kebab!*`,
    `🌟 *Crea il kebab dei tuoi sogni!*`,
    `🧂 *Scegli i tuoi ingredienti preferiti!*`,
  ];

  if (global.kebabGame?.[m.chat]) return m.reply('⚠️ *C\'è già un kebab in preparazione in questo gruppo!*');

  const cooldownKey = `kebab_${m.chat}`;
  const now = Date.now();
  const cooldownTime = 5000;
  const lastGame = global.cooldowns?.[cooldownKey] || 0;
  if (now - lastGame < cooldownTime) {
    const remainingTime = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
    return m.reply(`⏳ *Aspetta ancora ${remainingTime} secondi prima di avviare un nuovo gioco!*`);
  }

  global.cooldowns = global.cooldowns || {};
  global.cooldowns[cooldownKey] = now;

  const messageIntro = messages[Math.floor(Math.random() * messages.length)];
  let messageText = `${messageIntro}\n\n`;
  kebabIngredients.forEach((c, i) => { messageText += `${i + 1}. ${c}\n`; });
  messageText += '\n*Rispondi con i numeri degli ingredienti separati da virgola (es. 1, 2, 3)*\n*Scrivi "fine" per completare il tuo kebab*';

  try {
    const msg = await conn.sendMessage(m.chat, { text: messageText, footer: '🌯 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 🌯' }, { quoted: m });
    global.kebabGame = global.kebabGame || {};
    global.kebabGame[m.chat] = {
      id: msg.key.id,
      ingredients: [],
      user: m.sender,
      timeout: setTimeout(async () => {
        if (!global.kebabGame?.[m.chat]) return;
        const kebab = global.kebabGame[m.chat].ingredients.join(', ');
        const userTag = `@${global.kebabGame[m.chat].user.split('@')[0]}`;
        const randomReply = kebabBotReplies[Math.floor(Math.random() * kebabBotReplies.length)];
        await conn.sendMessage(m.chat, { text: `*KEBAB CREATO DA* ${userTag}\n\n*Ingredienti scelti:* ${kebab}\n\n${randomReply}`, footer: '🌯 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 🌯', interactiveButtons: playAgainButtons() }, { quoted: msg });
        delete global.kebabGame[m.chat];
      }, 120000)
    };
  } catch (error) {
    console.error('Errore nel gioco kebab:', error);
    m.reply('❌ *Si è verificato un errore durante l\'avvio del gioco*\n🔄 *Riprova tra qualche secondo*');
  }
};

handler.before = async (m, { conn }) => {
  const chat = m.chat;
  const game = global.kebabGame?.[chat];
  if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe || m.sender !== game.user) return;

  const choices = m.text.trim().split(',').map(s => s.trim()).filter(s => s);
  for (const choice of choices) {
    if (choice.toLowerCase() === 'fine') {
      clearTimeout(game.timeout);
      const kebab = game.ingredients.join(', ');
      const userTag = `@${game.user.split('@')[0]}`;
      const randomReply = kebabBotReplies[Math.floor(Math.random() * kebabBotReplies.length)];
      await conn.sendMessage(m.chat, { text: `*KEBAB CREATO DA* ${userTag}\n\n*Ingredienti scelti:* ${kebab}\n\n${randomReply}`, footer: '🌯 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 🌯', interactiveButtons: playAgainButtons() }, { quoted: m });
      delete global.kebabGame[m.chat];
      return;
    }
    const index = parseInt(choice) - 1;
    if (!isNaN(index) && kebabIngredients[index] && !game.ingredients.includes(kebabIngredients[index])) {
      game.ingredients.push(kebabIngredients[index]);
    } else if (isNaN(index)) {
      await conn.sendMessage(m.chat, { text: '*Scelta non valida. Usa solo numeri o "fine".*' });
      return;
    }
  }
  await conn.sendMessage(m.chat, { text: `*Hai scelto ${game.ingredients.join(', ')}.*\n*Vuoi aggiungere altro? (rispondi con i numeri degli ingredienti separati da virgola o "fine")*` });
};

handler.help = ['kebab'];
handler.tags = ['giochi'];
handler.command = /^kebab$/i;
handler.group = true;
handler.register = true;

export default handler;