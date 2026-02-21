const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const fs = require('fs');

const pizzaCondimenti = [
  '*Formaggio 🧀*','*Mozzarella 🧀*','*Bufala 🐃*','*Ricotta 🧀*','*Stracchino 🧀*','*Feta 🧀*','*Gorgonzola 🧀*','*Gruyère 🧀*','*Scamorza 🧀*','*Burrata 🧀*',
  '*Pomodoro 🍅*','*Salsa 🍅*','*Passata di pomodoro 🍅*','*Pesto 🥗*','*Aglio 🧄*','*Cipolla 🧅*','*Porro 🧅*','*Peperoni 🔥*','*Jalapeño 🔥*','*Peperoncino 🔥*',
  '*Salame 🍖*','*Wurstel 🍖*','*Prosciutto 🍖*','*Prosciutto crudo 🍖*','*Prosciutto di Parma 🍖*','*Soppressata 🍖*','*Pancetta 🍖*','*Bacon 🍖*','*Salsiccia 🍖*','*Salsiccia piccante 🔥*',
  '*Salsiccia di pollo 🍖*','*Salsiccia di tacchino 🍖*','*Salsiccia di vitello 🍖*','*Pollo 🍗*','*Carne macinata 🍖*','*Tonno 🐟*','*Acciughe 🐟*','*Funghi 🍄*','*Champignon 🍄*','*Porcini 🍄',
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

let pizzaGame = {}; // memorizza le partite attive

// ─────────── funzione principale ───────────
const handlePizzaCommand = async (m, conn) => {
  if (pizzaGame[m.chat]) {
    return conn.sendMessage(m.chat, { text: '⚠️ *C\'è già una partita attiva in questo gruppo!*' });
  }

  let messaggio = '*Scegli i condimenti per la tua pizza:*\n\n';
  pizzaCondimenti.forEach((c, i) => {
    messaggio += `${i + 1}. ${c}\n`;
  });
  messaggio += '\n*Rispondi con i numeri separati da virgola o spazio (es. 1,2,3 o 1 2 3)*\n*Scrivi "fine" per terminare*';

  const msg = await conn.sendMessage(m.chat, { text: messaggio });

  const timeout = setTimeout(async () => {
    if (pizzaGame[m.chat]) {
      const pizza = pizzaGame[m.chat].condimenti.join(', ');
      const rispostaBot = pizzaRisposte[Math.floor(Math.random() * pizzaRisposte.length)];
      await conn.sendMessage(m.chat, { text: `${rispostaBot}\n\n*PIZZA CREATA DA* @${pizzaGame[m.chat].utente.split('@')[0]}\n${pizza}` });
      delete pizzaGame[m.chat];
    }
  }, 120000); // 2 minuti

  // reminder a metà tempo
  const reminder = setTimeout(async () => {
    if (pizzaGame[m.chat]) {
      await conn.sendMessage(m.chat, { text: `⏰ @${m.sender.split('@')[0]}, hai ancora tempo per scegliere i condimenti!` });
    }
  }, 60000); // 1 minuto

  pizzaGame[m.chat] = {
    utente: m.sender,
    condimenti: [],
    msgId: msg.key.id,
    timeout,
    reminder
  };
};

// ─────────── gestione messaggi ───────────
const handleMessage = async (m, conn) => {
  const text = m.message?.conversation || m.message?.extendedTextMessage?.text;
  if (!text) return;

  // avvia pizza
  if (/^pizza$/i.test(text)) {
    return handlePizzaCommand(m, conn);
  }

  // gestione scelta condimenti
  const game = pizzaGame[m.chat];
  if (!game || m.sender !== game.utente) return;

  const choices = text.split(/[\s,]+/).map(s => s.trim());
  for (const scelta of choices) {
    if (scelta.toLowerCase() === 'fine') {
      clearTimeout(game.timeout);
      clearTimeout(game.reminder);
      const pizza = game.condimenti.join(', ');
      const rispostaBot = pizzaRisposte[Math.floor(Math.random() * pizzaRisposte.length)];
      await conn.sendMessage(m.chat, { text: `${rispostaBot}\n\n*PIZZA CREATA DA* @${game.utente.split('@')[0]}\n${pizza}` });
      delete pizzaGame[m.chat];
      return;
    }
    const index = parseInt(scelta) - 1;
    if (!isNaN(index) && pizzaCondimenti[index]) {
      if (game.condimenti.length < 10) {
        game.condimenti.push(pizzaCondimenti[index]);
      } else {
        await conn.sendMessage(m.chat, { text: '*Hai raggiunto il limite di 10 condimenti!*' });
        break;
      }
    }
  }

  await conn.sendMessage(m.chat, { text: `*Hai scelto: ${game.condimenti.join(', ')}*\n*Vuoi aggiungere altro o scrivi "fine"?*` });
};

module.exports = { handleMessage };