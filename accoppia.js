let handler = async (m, { conn, text, usedPrefix, command }) => {

    // Determina il target: risposta a messaggio o menzione
    let target = m.quoted ? m.quoted.sender : m.mentionedJid?.[0];

    if (!target) return m.reply(
        `⭔ \`Tagga qualcuno o rispondi a un messaggio\`\n\n*Esempio:* ${usedPrefix + command} @utente`
    );

    let nome1 = await conn.getName(m.sender);
    let nome2 = await conn.getName(target);

    // Mostra chi è stato scelto
    let infoTarget = m.quoted 
        ? `Hai risposto a: @${target.split('@')[0]}` 
        : `Hai menzionato: @${target.split('@')[0]}`;

    // 🔥 Mix totalmente casuale dei due nomi
    let unione = (nome1 + nome2).replace(/\s+/g, '');
    let lettere = unione.split('');
    for (let i = lettere.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [lettere[i], lettere[j]] = [lettere[j], lettere[i]];
    }

    // Lunghezza random nome fuso
    let lunghezza = Math.floor(Math.random() * 5) + 4;
    let nomeFuso = lettere.join('').slice(0, lunghezza);

    // Compatibilità casuale
    let percentuale = Math.floor(Math.random() * 101);
    let risultato = '';
    if (percentuale <= 30) risultato = '💀 Destinati al fallimento...';
    else if (percentuale <= 60) risultato = '😅 Potrebbe funzionare...';
    else if (percentuale <= 85) risultato = '😍 Ottima ship!';
    else risultato = '💍 MATRIMONIO imminente!';

    // Testo finale
    let testo = `
💘 *ACCOPPIAMENTO RANDOM*

${infoTarget}

👤 @${m.sender.split('@')[0]}
+
👤 @${target.split('@')[0]}

✨ Nome Ship: *${nomeFuso}*
💞 Compatibilità: *${percentuale}%*

${risultato}
    `.trim();

    await conn.sendMessage(m.chat, {
        text: testo,
        mentions: [m.sender, target]
    }, { quoted: m });

};

handler.help = ['accoppia @utente'];
handler.tags = ['giochi'];
handler.command = /^accoppia$/i;
handler.register = true;

export default handler;
