// plug-in di blood - Gestione Moderatori con Bypass
let handler = async (m, { conn, text, command, usedPrefix, isOwner }) => {
    if (!isOwner) return m.reply("❌ Questo comando è riservato al proprietario del bot.");

    let chatId = m.chat;
    if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {};
    if (!global.db.data.chats[chatId].moderatori) global.db.data.chats[chatId].moderatori = [];

    let mods = global.db.data.chats[chatId].moderatori;

    if (command === 'addmod') {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;
        if (!who) return m.reply(`Tagga qualcuno!`);
        if (mods.includes(who)) return m.reply("Già moderatore.");
        mods.push(who);
        return m.reply(`✅ @${who.split('@')[0]} ora ha i permessi admin.`, null, { mentions: [who] });
    }

    if (command === 'delmod') {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;
        if (!who) return m.reply(`Tagga qualcuno!`);
        global.db.data.chats[chatId].moderatori = mods.filter(jid => jid !== who);
        return m.reply(`🗑️ Privilegi rimossi.`);
    }

    if (command === 'listanera') {
        if (mods.length === 0) return m.reply("Nessun moderatore.");
        let lista = `📋 *MODERATORI DEL GRUPPO:*\n` + mods.map((v, i) => `${i + 1}. @${v.split('@')[0]}`).join('\n');
        return conn.sendMessage(chatId, { text: lista, mentions: mods }, { quoted: m });
    }
};

// --- QUESTA PARTE È CRUCIALE ---
handler.before = async function (m, { conn, isOwner }) {
    if (!m.isGroup || !global.db.data.chats[m.chat]?.moderatori) return;
    
    let mods = global.db.data.chats[m.chat].moderatori;
    
    // Se l'utente è un mod, forziamo il bot a considerarlo Admin
    if (mods.includes(m.sender)) {
        // Sovrascriviamo le proprietà di controllo che usano i plugin
        m.isAdmin = true; 
        
        // Se il tuo bot usa il sistema 'participants' per controllare:
        if (m.mtype) {
            // Alcuni bot usano questa proprietà per i permessi veloci
            m.isMod = true; 
        }
    }
};

handler.help = ['addmod', 'delmod', 'listanera'];
handler.tags = ['owner'];
handler.command = /^(addmod|delmod|listanera)$/i;
handler.group = true;

export default handler;
