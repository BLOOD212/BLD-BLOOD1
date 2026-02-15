import { sticker } from '../lib/sticker.js';

const mixNomi = (nome1, nome2) => {
    // Dividi in blocchi di 2-3 lettere
    const blocchi = [];
    const splitNome = (n) => {
        let i = 0;
        while (i < n.length) {
            let l = Math.floor(Math.random() * 2) + 2; // blocco 2-3 lettere
            blocchi.push(n.slice(i, i + l));
            i += l;
        }
    };
    splitNome(nome1);
    splitNome(nome2);

    // Mischia i blocchi
    for (let i = blocchi.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [blocchi[i], blocchi[j]] = [blocchi[j], blocchi[i]];
    }

    // Prendi primi 4-8 blocchi per il nome finale
    let lunghezza = Math.min(blocchi.length, Math.floor(Math.random() * 5) + 4);
    return blocchi.slice(0, lunghezza).join('');
};

let handler = async (m, { conn, text, usedPrefix, command }) => {

    // Determina target
    let target = m.quoted ? m.quoted.sender : m.mentionedJid?.[0];
    if (!target) return m.reply(
        `『 💡 』- \`Tagga qualcuno o rispondi a un messaggio\`\n> 『 💡 』- \`Esempio:\` ${usedPrefix + command} @utente`
    );

    // Nomi reali
    let nome1 = await conn.getName(m.sender);
    let nome2 = await conn.getName(target);

    // Mix dei nomi
    let nomeFuso = mixNomi(nome1, nome2);

    // Compatibilità casuale
    let percentuale = Math.floor(Math.random() * 101);
    let risultato = '';
    if (percentuale <= 30) risultato = '💀 Destinati al fallimento...';
    else if (percentuale <= 60) risultato = '😅 Potrebbe funzionare...';
    else if (percentuale <= 85) risultato = '😍 Ottima ship!';
    else risultato = '💍 MATRIMONIO imminente!';

    // Testo finale
    let testo = `
『 💘 』*NOMIMIX*

👤 @${m.sender.split('@')[0]}
+
👤 @${target.split('@')[0]}

✨ Nome Mixato: *${nomeFuso}*
💞 Compatibilità: *${percentuale}%*

${risultato}
    `.trim();

    await conn.sendMessage(m.chat, {
        text: testo,
        mentions: [m.sender, target]
    }, { quoted: m });
};

handler.help = ['nomimix @utente'];
handler.tags = ['giochi'];
handler.command = ['nomimix'];
handler.register = true;

export default handler;
