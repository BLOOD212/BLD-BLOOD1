const playAgainButtons = (prefix) => [
    {
        buttonId: `${prefix}nonemix`,
        buttonText: { displayText: '🔀 Mixane altri' },
        type: 1
    }
];

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Gestione Cooldown (3 secondi)
    const cooldownKey = `nonemix_${m.chat}`;
    const now = Date.now();
    const lastUse = global.cooldowns?.[cooldownKey] || 0;
    const cooldownTime = 3000;

    if (now - lastUse < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - (now - lastUse)) / 1000);
        return m.reply(`⏳ Aspetta ${remaining}s prima di mixare ancora!`);
    }

    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    // Controllo input: servono due nomi
    let [nome1, nome2] = text.split(' ');
    if (!nome1 || !nome2) throw `🫣 Devi inserire due nomi! \n\nEsempio: *${usedPrefix + command} Mario Luigia*`;

    // Logica del Mix
    const mix1 = nome1.slice(0, Math.ceil(nome1.length / 2));
    const mix2 = nome2.slice(Math.floor(nome2.length / 2));
    const nomeMixato = (mix1 + mix2).toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

    const messaggiRandom = [
        "Ecco il nome perfetto per la coppia! 💖",
        "Il risultato dell'esperimento genetico è... ✨",
        "Si chiameranno così per sempre! 🔥",
        "Unione completata con successo! 🧪"
    ];

    const randomMsg = messaggiRandom[Math.floor(Math.random() * messaggiRandom.length)];

    await conn.sendMessage(m.chat, {
        text: `✨ *NAME MIXER* ✨\n\n👤 *Nome 1:* ${nome1}\n👤 *Nome 2:* ${nome2}\n\n👉 *Risultato:* **${nomeMixato}**\n\n> ${randomMsg}`,
        buttons: playAgainButtons(usedPrefix),
        headerType: 1
    }, { quoted: m });
};

handler.help = ['nonemix <nome1> <nome2>'];
handler.tags = ['divertimento'];
handler.command = /^(nonemix|mixnome)$/i;

export default handler;
