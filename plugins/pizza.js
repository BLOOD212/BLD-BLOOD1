const pizzaCondimenti = [
  '*Mozzarella 🧀*','*Salsa di pomodoro 🍅*','*Pomodorini 🍅*','*Bufala 🐃*','*Burrata 🧀*',
  '*Stracchino 🧀*','*Ricotta 🧀*','*Gorgonzola 🧀*','*Grana 🧀*','*Parmigiano 🧀*',
  '*Provola 🧀*','*Scamorza 🧀*','*Gruyère 🧀*','*Feta 🧀*','*Emmental 🧀*',
  '*Taleggio 🧀*','*Caciocavallo 🧀*','*Fontina 🧀*','*Asiago 🧀*','*Pecorino 🧀*',
  '*Prosciutto cotto 🍖*','*Prosciutto crudo 🍖*','*Prosciutto di Parma 🍖*','*Salame 🍖*',
  '*Salame piccante 🔥*','*Soppressata 🍖*','*Bresaola 🍖*','*Speck 🍖*',
  '*Mortadella 🍖*','*Pancetta 🍖*','*Guanciale 🍖*','*Wurstel 🌭*',
  '*Salsiccia 🍖*','*Salsiccia piccante 🔥*','*Salsiccia di maiale 🍖*',
  '*Salsiccia di pollo 🍗*','*Salsiccia di tacchino 🍗*','*Carne macinata 🍖*',
  '*Pollo 🍗*','*Kebab 🍖*','*Tonno 🐟*','*Acciughe 🐟*','*Salmone 🐟*',
  '*Gamberetti 🍤*','*Frutti di mare 🦑*','*Funghi 🍄*','*Funghi porcini 🍄*',
  '*Champignon 🍄*','*Olive nere 🫒*','*Olive verdi 🫒*','*Peperoni 🌶️*',
  '*Peperoncino 🔥*','*Jalapeño 🌶️*','*Melanzane 🍆*','*Zucchine 🥒*',
  '*Cipolla 🧅*','*Cipolla rossa 🧅*','*Aglio 🧄*','*Spinaci 🥬*','*Rucola 🥗*',
  '*Carciofi 🌿*','*Asparagi 🌿*','*Broccoli 🥦*','*Mais 🌽*',
  '*Pomodori secchi 🍅*','*Capperi 🫒*','*Pesto 🌿*','*Crema di pistacchio 🌰*',
  '*Pistacchio 🌰*','*Noci 🌰*','*Pinoli 🌰*','*Tartufo nero 🍄*',
  '*Tartufo bianco 🍄*','*Stracciatella 🧀*','*Mozzarella affumicata 🧀*',
  '*Salame Napoli 🍖*','*Spianata piccante 🔥*','*Salame Milano 🍖*',
  '*Coppa 🍖*','*Porchetta 🍖*','*Lardo 🍖*','*Speck affumicato 🍖*',
  '*Prosciutto affumicato 🍖*','*Bacon croccante 🥓*','*Salame calabrese 🔥*',
  '*Ricotta salata 🧀*','*Scamorza affumicata 🧀*','*Caciotta 🧀*',
  '*Crema di tartufo 🍄*','*Salsa BBQ 🍖*','*Salsa piccante 🔥*',
  '*Olio piccante 🌶️*','*Origano 🌿*','*Basilico 🌿*','*Ananas 🍍*'
];

const giudiziPizza = [
  '🍕 Pizza perfetta!',
  '🔥 Questa spacca!',
  '😋 Da leccarsi i baffi!',
  '🤩 Capolavoro!',
  '😭 Che schifo...',
  '💀 Pizza criminale!',
  '😎 Interessante scelta!'
];

const playAgainButtons = () => [{
  name: 'quick_reply',
  buttonParamsJson: JSON.stringify({
    display_text: 'Ordina un\'altra pizza! 🍕',
    id: `.pizza`
  })
}];

function calcolaPunteggio(condimenti) {
  let punti = condimenti.length;

  if (condimenti.includes('*Mozzarella 🧀*') && condimenti.includes('*Salsa di pomodoro 🍅*'))
    punti += 3;

  if (condimenti.includes('*Ananas 🍍*') && condimenti.includes('*Salame piccante 🔥*'))
    punti -= 2;

  if (condimenti.length >= 3 && condimenti.length <= 6)
    punti += 5;

  if (condimenti.length > 12)
    punti -= 3;

  return punti < 0 ? 0 : punti;
}

let handler = async (m, { conn }) => {

  if (global.pizzaGame?.[m.chat])
    return m.reply('⚠️ C\'è già una partita attiva!');

  let messaggio = '*SCEGLI I CONDIMENTI:*\n\n';
  pizzaCondimenti.forEach((c, i) => {
    messaggio += `${i + 1}. ${c}\n`;
  });

  messaggio += '\nRispondi con numeri separati da virgola\nScrivi *fine* per terminare';

  let msg = await conn.sendMessage(m.chat, { text: messaggio }, { quoted: m });

  global.pizzaGame = global.pizzaGame || {};
  global.pizzaGame[m.chat] = {
    id: msg.key.id,
    condimenti: [],
    utente: m.sender
  };
};

handler.before = async (m, { conn }) => {
  const game = global.pizzaGame?.[m.chat];
  if (!game || !m.quoted || m.quoted.id !== game.id || m.sender !== game.utente)
    return;

  if (m.text.toLowerCase() === 'fine') {

    const pizza = game.condimenti.join(', ');
    const punti = calcolaPunteggio(game.condimenti);
    const giudizio = giudiziPizza[Math.floor(Math.random() * giudiziPizza.length)];
    const utente = `@${m.sender.split('@')[0]}`;

    global.pizzaScore = global.pizzaScore || {};
    global.pizzaScore[m.chat] = global.pizzaScore[m.chat] || {};
    global.pizzaScore[m.chat][m.sender] =
      (global.pizzaScore[m.chat][m.sender] || 0) + punti;

    await conn.sendMessage(m.chat, {
      text:
`🍕 *PIZZA CREATA DA* ${utente}

${pizza}

🏆 Punteggio: ${punti} punti
${giudizio}`
    }, { quoted: m });

    delete global.pizzaGame[m.chat];
    return;
  }

  const scelte = m.text.split(',').map(x => x.trim());
  for (let s of scelte) {
    if (pizzaCondimenti[parseInt(s) - 1])
      game.condimenti.push(pizzaCondimenti[parseInt(s) - 1]);
  }

  await conn.sendMessage(m.chat, {
    text: `Hai scelto:\n${game.condimenti.join(', ')}\nScrivi *fine* per terminare`
  });
};

handler.command = /^pizza$/i;
handler.group = true;
handler.register = true;
export default handler;