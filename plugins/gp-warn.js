const handler = async (m, { conn, text, command, usedPrefix }) => {
    try {
        const target = getTargetUser(m, text);

        if (!target) {
            return m.reply(createUsageMessage(usedPrefix, command));
        }

        // Controllo se l'utente è nel gruppo
        const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : null;
        const groupMembers = groupMetadata ? groupMetadata.participants.map(p => p.id) : [];

        if (m.isGroup && !groupMembers.includes(target)) {
            return m.reply(`『 ❌ 』 *L'utente con il numero ${target.split('@')[0]} non è un membro di questo gruppo.*`);
        }

        const reason = getReason(m, text, target);

        if (target === conn.user.jid) {
            return m.reply('『 ‼️ 』 *Perché vorresti ammonire il bot?*');
        }

        if (global.owner.some(owner => owner[0] === target.split('@')[0])) {
            return m.reply('🤨 Non puoi ammonire il mio creatore!');
        }

        const user = getUserData(target);
        if (!user.warns) user.warns = {};
        if (typeof user.warns[m.chat] !== 'number') user.warns[m.chat] = 0;

        user.warns[m.chat] += 1;
        const remainingWarns = user.warns[m.chat];

        if (remainingWarns >= 3) {
            user.warns[m.chat] = 0;
            await handleRemoval(conn, m, target);
        } else {
            await handleWarnMessage(conn, m, target, remainingWarns, reason);
        }
    } catch (error) {
        console.error('Errore nell\'handler warn:', error);
        return m.reply(`Errore: ${error.message}`);
    }
};

function getTargetUser(m, text) {
    if (m.mentionedJid?.[0]) return m.mentionedJid[0];
    if (m.quoted?.sender) return m.quoted.sender;
    if (text?.trim()) {
        let number = text.replace(/[^0-9]/g, '');
        if (number.length > 5) {
            return `${number}@s.whatsapp.net`;
        }
    }
    return null;
}

function getReason(m, text, target) {
    const targetId = target.split('@')[0];
    // Rimuove il numero o la menzione dal testo per estrarre solo il motivo
    let reason = text.replace(targetId, '').replace(/@/g, '').trim();
    return reason || 'Non specificato';
}

function getUserData(userId) {
    if (!global.db.data.users[userId]) {
        global.db.data.users[userId] = { warns: {} };
    }
    return global.db.data.users[userId];
}

function createUsageMessage(usedPrefix, command) {
    return `
    ㅤㅤ⋆｡˚『 ╭ \`WARN\` ╯ 』˚｡⋆\n╭
│  『 📋 』 _*METODI DISPONIBILI:*_
│•  *\`Menziona:\`* *${usedPrefix + command} @utente*
│•  *\`Rispondi:\`* *Quotando un msg*
│•  *\`Numero:\`* *${usedPrefix + command} 39351XXXXX*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
}

async function handleWarnMessage(conn, m, target, remainingWarns, reason) {
    const username = target.split('@')[0];
    const emoji = remainingWarns === 1 ? '⚠️' : '🔔';

    const message = `『 ${emoji} 』 @${username}\n- _*Hai ricevuto un avvertimento*_
- *\`Motivo:\`* *${reason}*
- *\`Stato:\`* *${remainingWarns}/3*`;

    const fkontak = await createUserFkontak(conn, target);

    await conn.sendMessage(m.chat, { 
        text: message, 
        mentions: [target] 
    }, { quoted: fkontak });
}

async function handleRemoval(conn, m, target) {
    const username = target.split('@')[0];
    const message = `『 🚫 』 @${username} *ha raggiunto il limite di 3 avvertimenti e verrà rimosso.*`;

    const fkontak = await createUserFkontak(conn, target);

    await conn.sendMessage(m.chat, { 
        text: message, 
        mentions: [target] 
    }, { quoted: fkontak });

    await conn.groupParticipantsUpdate(m.chat, [target], 'remove');
}

async function createUserFkontak(conn, target) {
    try {
        let username = target.split('@')[0];
        return {
            key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'WarnSystem' },
            message: {
                contactMessage: {
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;User;;;\nFN:${username}\nitem1.TEL;waid=${username}:${username}\nEND:VCARD`
                }
            },
            participant: '0@s.whatsapp.net'
        };
    } catch { return null; }
}

handler.command = ['avverti', 'warn', 'avvertimento'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
