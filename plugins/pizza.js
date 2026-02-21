let handler = async (m, { conn, args }) => {
  if (args[0] === 'pizza') {
    const pizzaCondimenti = ['formaggio', 'salsa', 'wurstel', 'patatine', 'salame', 'piccante', 'ananas', 'acciughe', 'mozzarella', 'pistacchio', 'bufala', 'mortadella'];
    let messaggio = 'Scegli i condimenti per la tua pizza:\n\n';
    pizzaCondimenti.forEach((condimento, index) => {
      messaggio += `${index + 1}. ${condimento}\n`;
    });
    messaggio += '\nRispondi con il numero del condimento (es. 1, 2, 3)';
    await conn.sendMessage(m.chat, { text: messaggio });
    let sceltaUtente = [];
    let sceltaCompleta = false;
    while (!sceltaCompleta) {
      const risposta = await conn.waitForMessage(m.chat, (message) => message.sender === m.sender);
      const scelta = risposta.text.trim();
      if (pizzaCondimenti[parseInt(scelta) - 1]) {
        sceltaUtente.push(pizzaCondimenti[parseInt(scelta) - 1]);
        await conn.sendMessage(m.chat, { text: `Hai scelto ${pizzaCondimenti[parseInt(scelta) - 1]}. Vuoi aggiungere altro? (rispondi con il numero del condimento o "fine")` });
      } else if (scelta.toLowerCase() === 'fine') {
        sceltaCompleta = true;
        const pizza = sceltaUtente.join(', ');
        await conn.sendMessage(m.chat, { text: `Questa è la pizza di @${m.sender.split('@')[0]}: ${pizza}` });
      } else {
        await conn.sendMessage(m.chat, { text: 'Scelta non valida. Riprova.' });
      }
    }
  }
};

handler.command = ['pizza'];
handler.tags = ['giochi'];
handler.help = ['pizza'];

export default handler;