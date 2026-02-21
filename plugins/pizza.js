let handler = async (m, { conn, args }) => {
  if (args[0] === 'pizza') {
    const pizzaCondimenti = ['formaggio', 'salsa', 'wurstel', 'patatine', 'salame', 'piccante', 'ananas', 'acciughe', 'mozzarella', 'pistacchio', 'bufala', 'mortadella'];
    const buttons = pizzaCondimenti.map((condimento) => ({
      buttonId: `pizza ${condimento}`,
      buttonText: { displayText: condimento },
      type: 1,
    }));
    await conn.sendMessage(m.chat, { text: 'Vuoi la tua pizza?', buttons, headerType: 1 });
  } else if (args[0] === 'pizza' && args[1]) {
    const condimento = args[1];
    const user = m.sender;
    const scelta = [condimento];
    await conn.sendMessage(m.chat, { text: `Hai scelto ${condimento}. Vuoi aggiungere altro?`, buttons: [
      { buttonId: `pizza si`, buttonText: { displayText: 'Sì' }, type: 1 },
      { buttonId: `pizza no`, buttonText: { displayText: 'No' }, type: 1 },
    ] });
    let sceltaUtente = [];
    sceltaUtente.push(condimento);
    let sceltaCompleta = false;
    while (!sceltaCompleta) {
      const risposta = await conn.waitForMessage(m.chat, (message) => message.sender === user);
      if (risposta.text === 'si') {
        const buttons = pizzaCondimenti.map((condimento) => ({
          buttonId: `pizza ${condimento}`,
          buttonText: { displayText: condimento },
          type: 1,
        }));
        await conn.sendMessage(m.chat, { text: 'Scegli un altro condimento', buttons, headerType: 1 });
        const rispostaCondimento = await conn.waitForMessage(m.chat, (message) => message.sender === user);
        sceltaUtente.push(rispostaCondimento.text);
      } else if (risposta.text === 'no') {
        sceltaCompleta = true;
        const pizza = sceltaUtente.join(', ');
        await conn.sendMessage(m.chat, { text: `Questa è la pizza di @${user.split('@')[0]}: ${pizza}`, buttons: [
          { buttonId: `pizza buona`, buttonText: { displayText: 'Buona' }, type: 1 },
          { buttonId: `pizza fa schifo`, buttonText: { displayText: 'Fa schifo' }, type: 1 },
          { buttonId: `pizza decente`, buttonText: { displayText: 'Decente' }, type: 1 },
        ] });
      }
    }
  }
};

handler.command = ['pizza'];
handler.tags = ['giochi'];
handler.help = ['pizza'];

export default handler;