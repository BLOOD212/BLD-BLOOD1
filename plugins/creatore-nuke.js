let handler = async (m, { conn, text, isBotAdmin, participants }) => {
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // --- LOGICA CHAT PRIVATA ---
    if (!m.isGroup) {
        // Se l'utente non specifica un ID, mostra la lista
        if (!text) {
            let groups = Object.values(await conn.groupFetchAllParticipating());
            let adminGroups = [];

            for (let group of groups) {
                let bot = group.participants.find(p => p.id === botId);
                if (bot && (bot.admin === 'admin' || bot.admin === 'superadmin')) {
                    adminGroups.push(group);
                }
            }

            if (adminGroups.length === 0) return m.reply("❌ Non sono admin in nessun gruppo.");

            let txt = "🩸 *𝐋𝐈𝐒𝐓𝐀 𝐁𝐄𝐑𝐒𝐀𝐆𝐋𝐈 𝐁𝐋𝐎𝐎𝐃* 🩸\n\n";
            txt += "Copia l'ID e usa: `.pugnala <ID>` per svuotarlo da qui.\n\n";
            adminGroups.forEach((g, i) => {
                txt += `*${i + 1}.* ${g.subject}\nID: \`${g.id}\`\n\n`;
            });
            return m.reply(txt);
        }

        // Se l'utente ha inserito un ID (es. .pugnala 12345@g.us)
        let targetGroup = text.includes('@g.us') ? text.trim() : null;
        if (!targetGroup) return m.reply("❌ ID non valido. Copia l'ID dalla lista (es: `123456789@g.us`) e riprova.");

        try {
            let meta = await conn.groupMetadata(targetGroup);
            let targetParticipants = meta.participants;
            
            // Esegui il devasto nel gruppo target
            await executeDevasto(conn, targetGroup, targetParticipants, botId, ownerJids);
            return m.reply(`✅ Operazione avviata nel gruppo: *${meta.subject}*`);
        } catch (e) {
            return m.reply("❌ Impossibile accedere al gruppo. Assicurati che l'ID sia corretto e che io sia dentro.");
        }
    }

    // --- LOGICA SE USATO DIRETTAMENTE IN GRUPPO ---
    if (!isBotAdmin) return m.reply("❌ Devo essere admin.");
    await executeDevasto(conn, m.chat, participants, botId, ownerJids);
};

// Funzione universale per il devasto
async function executeDevasto(conn, chatId, participants, botId, ownerJids) {
    try {
        // 1. Cambio Nome
        let metadata = await conn.groupMetadata(chatId);
        await conn.groupUpdateSubject(chatId, `${metadata.subject} | 𝚂𝚅𝚃 𝙱𝚢  𝐁𝐋𝐎𝐎𝐃`);

        // 2. Filtro utenti da rimuovere
        let usersToRemove = participants
            .map(p => p.id || p.jid)
            .filter(jid => jid && jid !== botId && !ownerJids.includes(jid));

        let allJids = participants.map(p => p.id || p.jid);

        // 3. Messaggi di addio
        await conn.sendMessage(chatId, {
            text: "𝐁𝐥𝐨𝐨𝐝 𝐞̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨 𝐢𝐧 𝐜𝐢𝐫𝐜𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞, 𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐬𝐢𝐠𝐧𝐢𝐟𝐢𝐜𝐚 𝐬𝐨𝐥𝐨 𝐮𝐧𝐚 𝐜𝐨𝐬𝐚, 𝐃𝐄𝐕𝐀𝐒𝐓𝐎."
        });

        await conn.sendMessage(chatId, {
            text: "𝐀𝐯𝐞𝐭𝐞 𝐚𝐯𝐮𝐭𝐨 𝐥' 𝐨𝐧𝐨𝐫𝐞 𝐝𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐬𝐭𝐚𝐭𝐢 𝐩𝐮𝐠𝐧𝐚𝐥𝐚𝐭𝐢 𝐝𝐚 𝐁𝐥𝐨𝐨𝐝, 𝐯𝐢 𝐚𝐬𝐩𝐞𝐭𝐭𝐢𝐚𝐦𝐨 𝐭𝐮𝐭𝐭𝐢 𝐪𝐮𝐚:\n\nhttps://chat.whatsapp.com/HsPqgzLHm25LBVcEd7Ldri",
            mentions: allJids
        });

        // 4. Rimozione forzata
        await conn.groupParticipantsUpdate(chatId, usersToRemove, 'remove');
    } catch (e) {
        console.error('Errore durante il devasto:', e);
    }
}

handler.command = ['pugnala'];
handler.owner = true;

export default handler;
