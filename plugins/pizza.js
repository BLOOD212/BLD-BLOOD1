const pizzaCondimenti = [
  '*Formaggio 🧀*','*Mozzarella 🧀*','*Bufala 🐃*','*Ricotta 🧀*','*Stracchino 🧀*','*Feta 🧀*','*Gorgonzola 🧀*','*Gruyère 🧀*','*Scamorza 🧀*','*Burrata 🧀*',
  '*Pomodoro 🍅*','*Salsa 🍅*','*Passata di pomodoro 🍅*','*Pesto 🥗*','*Aglio 🧄*','*Cipolla 🧅*','*Porro 🧅*','*Peperoni 🔥*','*Jalapeño 🔥*','*Peperoncino 🔥*',
  '*Salame 🍖*','*Wurstel 🍖*','*Prosciutto 🍖*','*Prosciutto crudo 🍖*','*Prosciutto di Parma 🍖*','*Soppressata 🍖*','*Pancetta 🍖*','*Bacon 🍖*','*Salsiccia 🍖*','*Salsiccia piccante 🔥*',
  '*Salsiccia di pollo 🍖*','*Salsiccia di tacchino 🍖*','*Salsiccia di vitello 🍖*','*Pollo 🍗*','*Carne macinata 🍖*','*Tonno 🐟*','*Acciughe 🐟*','*Funghi 🍄*','*Champignon 🍄*','*Porcini 🍄*',
  '*Gombas 🍄*','*Olive nere 🫒*','*Olive verdi 🫒*','*Capperi 🌿*','*Mais 🌽*','*Ananas 🍍*','*Spinaci 🥗*','*Rucola 🥗*','*Broccoli 🥗*','*Cavolfiore 🥗*',
  '*Asparagi 🥗*','*Zucchine 🥒*','*Peperoni dolci 🌶️*','*Carciofi 🌿*','*Pomodorini 🍅*','*Erbe aromatiche 🌿*','*Origano 🌿*','*Basilico 🌿*','*Tartufi 🌰*','*Pistacchio 🌰*',
  '*Noci 🌰*','*Semi di zucca 🌰*','*Uova 🥚*','*Spezi 🧂*','*Pepe nero 🧂*','*Olio extra vergine 🫒*','*Burro 🧈*','*Carne di manzo 🍖*','*Carne di maiale 🍖*','*Carne di tacchino 🍖*',
  '*Carne di pollo 🍗*','*Vegan 🌱*','*Vegetariano 🥗*','*Pomodoro secco 🍅*','*Peperoncini sott’aceto 🔥*','*Sottaceti 🥒*','*Funghi sott’olio 🍄*','*Cipolle caramellate 🧅*','*Peperoni arrostiti 🌶️*','*Melanzane grigliate 🍆*',
  '*Zucchine grigliate 🥒*','*Pancetta affumicata 🍖*','*Prosciutto affumicato 🍖*','*Carne secca 🍖*','*Polpettine 🍖*','*Mozzarella affumicata 🧀*','*Caciocavallo 🧀*','*Formaggio di capra 🧀*','*Taleggio 🧀*','*Gorgonzola piccante 🧀*',
  '*Crema di tartufo 🌰*','*Pomodoro fresco 🍅*','*Peperoncino verde 🔥*','*Peperoncino rosso 🔥*','*Funghi misti 🍄*','*Zucchine julienne 🥒*','*Carote julienne 🥕*','*Radicchio 🥗*','*Cicoria 🥗*','*Porcini secchi 🍄*',
  '*Broccoli al vapore 🥗*','*Cipolle rosse 🧅*','*Peperoni piccanti 🔥*','*Basilico fresco 🌿*','*Origano fresco 🌿*','*Aglio tritato 🧄*','*Olio al tartufo 🌰*','*Peperoncino in polvere 🔥*','*Semi di sesamo 🌰*','*Spezie miste 🧂*',
  '*Zucchine gratinate 🥒*','*Melanzane gratinate 🍆*','*Rucola fresca 🥗*','*Pomodorini ciliegia 🍅*'
];

const pizzaRisposte = [
  "🍕 Pizza perfetta 😍",
  "🤢 Che schifo...",
  "😋 Mmm, deliziosa!",
  "🔥 Questa è piccante!",
  "🥗 Fresca e leggera!",
  "🍖 Super carnosa!",
  "🧀 Troppo formaggio!",
  "🍍 Ananas? Coraggioso!",
  "😮 Mai vista una pizza così!",
  "🎉 Pizza da urlo!",
  "😵 Una combinazione assurda!"
];

const playAgainButtons = () => [
  { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Ordina un\'altra pizza! 🍕', id: `.pizza` }) }
];

let handler = async (m, { conn, args }) => {
  let frasi = [
    `🍕 *Scegli i condimenti per la tua pizza!*`,
    `🔥 *Personalizza la tua pizza!*`,
    `🌟 *Crea la tua pizza ideale!*`,
    `🧂 *Scegli i tuoi condimenti preferiti!*`,
  ];

  if (global.pizzaGame?.[m.chat]) {
    return m.reply('⚠️ *C\'è già una partita attiva in questo gruppo!*');
  }

  const cooldownKey = `pizza_${m.chat}`;
  const lastGame = global.cooldowns?.[cooldownKey] || 0;
  const now = Date.now();
  const cooldownTime = 5000;
  if (now - lastGame < cooldownTime) {
    const remainingTime = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
    return m.reply(`⏳ *Aspetta ancora ${remainingTime} secondi prima di avviare un nuovo gioco!*`);
  }

  global.cooldowns = global.cooldowns || {};
  global.cooldowns[cooldownKey] = now;

  let frase = frasi[Math.floor(Math.random() * frasi.length)];
  let messaggio = '*Scegli i condimenti per la tua pizza:*' + '\n\n';
  pizzaCondimenti.forEach((condimento, index) => {
    messaggio += `${index + 1}. ${condimento}\n`;
  });
  messaggio += '\n*Rispondi con i numeri dei condimenti separati da virgola (es. 1, 2, 3)*\n*Scrivi "fine" per terminare la tua pizza*';

  try {
    let msg = await conn.sendMessage(m.chat, { text: messaggio, footer: '🍕 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 🍕' }, { quoted: m });
    global.pizzaGame = global.pizzaGame || {};
    global.pizzaGame[m.chat] = {
      id: msg.key.id,
      condimenti: [],
      utente: m.sender,
      timeout: setTimeout(async () => {
        if (global.pizzaGame?.[m.chat]) {
          const pizza = global.pizzaGame[m.chat].condimenti.join(', ');
          const utente = `@${global.pizzaGame[m.chat].utente.split('@')[0]}`;
          const rispostaBot = pizzaRisposte[Math.floor(Math.random() * pizzaRisposte.length)];
          await conn.sendMessage(m.chat, { text: `${rispostaBot}\n\n*PIZZA CREATA DA* ${utente}\n${pizza}`, footer: '🍕 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 🍕', interactiveButtons: playAgainButtons() }, { quoted: msg });
          delete global.pizzaGame[m.chat];
        }
      }, 120000)
    };
  } catch (error) {
    console.error('Errore nel gioco pizza:', error);
    m.reply('❌ *Si è verificato un errore durante l\'avvio del gioco*\n🔄 *Riprova tra qualche secondo*');
  }
};

handler.before = async (m, { conn }) => {
  const chat = m.chat;
  const game = global.pizzaGame?.[chat];
  if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe || m.sender !== game.utente) return;
  const scelte = m.text.trim().split(',').map(s => s.trim());
  for (const scelta of scelte) {
    if (pizzaCondimenti[parseInt(scelta) - 1]) {
      game.condimenti.push(pizzaCondimenti[parseInt(scelta) - 1]);
    } else if (scelta.toLowerCase() === 'fine') {
      clearTimeout(game.timeout);
      const pizza = game.condimenti.join(', ');
      const utente = `@${game.utente.split('@')[0]}`;
      const rispostaBot = pizzaRisposte[Math.floor(Math.random() * pizzaRisposte.length)];
      await conn.sendMessage(m.chat, { text: `${rispostaBot}\n\n*PIZZA CREATA DA* ${utente}\n${pizza}`, footer: '🍕 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 🍕', interactiveButtons: playAgainButtons() }, { quoted: m });
      delete global.pizzaGame[m.chat];
      return;
    } else {
      await conn.sendMessage(m.chat, { text: '*Scelta non valida. Riprova.*' });
      return;
    }
  }
  await conn.sendMessage(m.chat, { text: `*Hai scelto ${game.condimenti.join(', ')}.* *Vuoi aggiungere altro? (rispondi con i numeri dei condimenti separati da virgola o "fine")*` });
};

handler.help = ['pizza'];
handler.tags = ['giochi'];
handler.command = /^pizza$/i;
handler.group = true;
handler.register = true