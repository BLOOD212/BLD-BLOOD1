let handler = async (m, { conn, text }) => {
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    // Otteniamo il numero pulito del bot (senza :1 o altri suffissi)
    const botNumber = conn.user.id.split(':')[0];

    // --- LOGICA PRIVATA ---
    if (!m.isGroup) {
        if (!text) {
            await m.reply("⏳ *Scansione totale in corso...*");
            
            let groups = await conn.groupFetchAllParticipating();
            let adminGroups = [];

            for (let id in groups) {
                try {
                    let meta = await conn.groupMetadata(id);
                    // Cerchiamo nella lista partecipanti qualcuno che abbia il numero del bot e sia admin
                    let isBotAdminInGroup = meta.participants.some(p => 
                        p.id.startsWith(botNumber) && (p.admin === 'admin' || p.admin === 'superadmin')
                    );

                    if (isBotAdminInGroup) {
                        adminGroups.push({ id, subject: meta.subject });
                    }
                } catch (e) { continue; }
            }

            if (adminGroups.length === 0) {
                return m.reply("❌ Non ho trovato gruppi dove sono admin.\n\n*Verifica:* Assicurati che io sia admin e che il gruppo non sia una 'Community'.");
            }

            let txt = "🩸 *𝐋𝐈𝐒𝐓𝐀 𝐁𝐄𝐑𝐒𝐀𝐆𝐋𝐈 𝐁𝐋𝐎𝐎𝐃* 🩸\n\n";
            adminGroups.forEach((g, i) => {
                txt += `*${i + 1}.* ${g.subject}\nID: \`${g.id}\`\n\n`;
            });
            txt += "Copia l'ID e scrivi: `.pugnala <ID>`";
            return m.reply(txt);
        }

        // Esecuzione via ID
        let targetId = text.trim();
        try {
            let meta = await conn.groupMetadata(targetId);
            await m.reply(`⚔️ *TARGET:* ${meta.subject}\nAvvio devasto remoto...`);
            await executeDevasto(conn, targetId, meta.participants, botNumber, ownerJids);
            return m.reply("✅ Operazione conclusa.");
        } catch (e) {
            return m.reply("❌ Errore: ID non trovato.");
        }
    }

    // --- LOGICA GRUPPO ---
    let meta = await conn.groupMetadata(m.chat);
    let isBotAdmin = meta.participants.some(p => p.id.startsWith(botNumber) && p.admin);
    
    if (!isBotAdmin) return m.reply("❌ Devo essere admin per colpire.");
    await executeDevasto(conn, m.chat, meta.participants, botNumber, ownerJids);
};

async function executeDevasto(conn, chatId, participants, botNumber, ownerJids) {
    try {
        // 1. Cambio Nome
        await conn.groupUpdateSubject(chatId, `𝚂𝚅𝚃 𝙱𝚢 𝐁𝐋𝐎𝐎𝐃`).catch(() => {});

        // 2. Messaggi
        let allJids = participants.map(p => p.id);
        await conn.sendMessage(chatId, { 
            text: "𝐁𝐥𝐨𝐨𝐝 𝐞̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨... 𝐃𝐄𝐕𝐀𝐒𝐓𝐎.\n\nhttps://chat.whatsapp.com/HsPqgzLHm25LBVcEd7Ldri",
            mentions: allJids
        });

        // 3. Filtro ed eliminazione mirata
        // Escludiamo chiunque inizi con il numero del bot o sia in ownerJids
        let toRemove = allJids.filter(jid => 
            !jid.startsWith(botNumber) && 
            !ownerJids.some(owner => jid.startsWith(owner.split('@')[0]))
        );

        for (let user of toRemove) {
            await conn.groupParticipantsUpdate(chatId, [user], 'remove').catch(() => {});
            await new Promise(r => setTimeout(r, 300)); // Evita ban
        }
    } catch (e) {
        console.error("Errore:", e);
    }
}

handler.command = ['pugnala'];
handler.owner = true;

export default handler;
