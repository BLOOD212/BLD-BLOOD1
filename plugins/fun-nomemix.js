let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Controllo se il testo esiste
    if (!text) throw `🫣 Devi inserire due nomi!\n\nEsempio: *${usedPrefix + command} Mario Luigia*`;

    // Divide il testo in base agli spazi e rimuove eventuali spazi vuoti
    let args = text.trim().split(/ +/);
    
    if (args.length < 2) throw `🫣 Servono DUE nomi! \nEsempio: *${usedPrefix + command} Mario Luigia*`;

    let nome1 = args[0];
    let nome2 = args[1];

    // Gestione Cooldown (3 secondi)
    const cooldownKey = `nonemix_${m.chat}`;
    const now = Date.now();
    const lastUse = global.cooldowns?.[cooldownKey] || 0;
    const cooldownTime = 3000;

    if (now - lastUse < cooldownTime) return; // Salta se in cooldown
    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    // Logica del Mix: Metà del primo + Metà del secondo
    const meta1 = nome1.slice(0, Math.ceil(nome1.length / 2));
    const meta2 = nome2.slice(Math.floor(nome2.length / 2));
    const nomeMixato = (meta1 + meta2).toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

    let response = `✨ *NAME MIXER* ✨\n\n`;
    response += `👤 *Nome 1:* ${nome1}\n`;
    response += `👤 *Nome 2:* ${nome2}\n\n`;
    response += `👉 *Risultato:* *${nomeMixato}*\n\n`;
    response += `> Mix eseguito con successo!`;

    await conn.reply(m.chat, response, m);
};

handler.help = ['nonemix'];
handler.tags = ['fun'];
handler.command = /^(nomemix)$/i; 

export default handler;
