let handler = async (m, { conn, text, command, usedPrefix, isOwner }) => {
    // Controllo permessi: solo l'Owner del bot può usare questi comandi
    if (!isOwner) return m.reply("❌ Questo comando è riservato al proprietario del bot.");

    let chatId = m.chat;
    if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {};
    if (!global.db.data.chats[chatId].moderatori) global.db.data.chats[chatId].moderatori = [];

    let mods = global.db.data.chats[chatId].moderatori;

    // --- COMANDO .ADDMOD ---
    if (command === 'addmod') {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;
        
        if (!who) return m.reply(`Tagga qualcuno o rispondi a un messaggio per aggiungerlo come moderatore.\nEsempio: ${usedPrefix + command} @utente`);
        if (mods.includes(who)) return m.reply("⚠️ Questo utente è già nella lista moderatori.");

        mods.push(who);
        return m.reply(`✅ @${who.split('@')[0]} è ora un moderatore di questo gruppo.`, null, { mentions: [who] });
    }

    // --- COMANDO .DELMOD ---
    if (command === 'delmod') {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;
        
        if (!who) return m.reply(`Tagga qualcuno o rispondi a un messaggio per rimuoverlo.\nEsempio: ${usedPrefix + command} @utente`);
        if (!mods.includes(who)) return m.reply("⚠️ Questo utente non è un moderatore.");

        global.db.data.chats[chatId].moderatori = mods.filter(jid => jid !== who);
        return m.reply(`🗑️ Privilegi rimossi per @${who.split('@')[0]}.`, null, { mentions: [who] });
    }

    // --- COMANDO .LISTANERA ---
    if (command === 'listanera') {
        if (mods.length === 0) return m.reply("📋 Non ci sono moderatori registrati in questo gruppo.");

        let lista = `📋 *ELENCO MODERATORI DEL GRUPPO*\n`;
        lista += `──────────────────\n\n`;
        mods.forEach((jid, i) => {
            lista += `${i + 1}. @${jid.split('@')[0]}\n`;
        });
        lista += `\n──────────────────\n_Questi utenti possono usare i comandi admin._`;

        return conn.sendMessage(chatId, { text: lista, mentions: mods }, { quoted: m });
    }
};

// --- LOGICA DI INTERCETTAZIONE ---
// Questo pezzo serve a far sì che il bot riconosca i moderatori come admin
handler.before = async function (m) {
    if (!m.isGroup || !global.db.data.chats[m.chat]?.moderatori) return;
    
    let mods = global.db.data.chats[m.chat].moderatori;
    
    // Se l'utente è nella lista mod, gli "iniettiamo" il permesso isAdmin per la sessione corrente
    if (mods.includes(m.sender)) {
        m.isAdmin = true; 
    }
};

handler.help = ['addmod', 'delmod', 'listanera'];
handler.tags = ['owner', 'group'];
handler.command = /^(addmod|delmod|listanera)$/i;
handler.group = true;

export default handler;
