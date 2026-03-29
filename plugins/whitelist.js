// Gestore Whitelist Antinuke - Struttura by Sam
import fs from 'fs'

const handler = async (m, { conn, text, command, usedPrefix }) => {
    // Inizializza l'utente nel database se non esiste
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    
    let who;
    if (m.isGroup) {
        who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;
    } else {
        who = m.chat;
    }

    if (!who && command !== 'listwhitelist') {
        return m.reply(`『 ⚠️ 』- \`Esempio: ${usedPrefix + command} @tag\``)
    }

    // Assicurati che l'utente bersaglio esista nel database
    if (who && !global.db.data.users[who]) global.db.data.users[who] = { whitelist: false }

    switch (command) {
        case 'addwhitelist':
            if (global.db.data.users[who].whitelist) return m.reply('『 ✨ 』- `L\'utente è già autorizzato!`')
            global.db.data.users[who].whitelist = true
            await conn.sendMessage(m.chat, {
                text: `
  ⋆｡˚『 ╭ \`WHITELIST AGGIUNTA\` ╯ 』˚｡⋆
╭
┃ 『 👤 』 \`Utente:\` @${who.split('@')[0]}
┃ 『 ✅ 』 \`Stato:\` *Autorizzato Antinuke*
┃
┃ ➤  \`Ora può gestire il gruppo senza blocchi.\`
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`,
                contextInfo: { mentionedJid: [who] }
            }, { quoted: m })
            break

        case 'delwhitelist':
            if (!global.db.data.users[who].whitelist) return m.reply('『 ❌ 』- `L\'utente non era in lista.`')
            global.db.data.users[who].whitelist = false
            m.reply(`『 🗑️ 』- \`@${who.split('@')[0]} rimosso dalla protezione.\``, null, { mentions: [who] })
            break

        case 'listwhitelist':
            let list = Object.entries(global.db.data.users)
                .filter(([jid, user]) => user.whitelist === true)
                .map(([jid]) => `┃ ➤ @${jid.split('@')[0]}`)
                .join('\n')
            
            let caption = `
  ⋆｡˚『 ╭ \`UTENTI AUTORIZZATI\` ╯ 』˚｡⋆
╭
${list ? list : '┃ 『 ⚠️ 』 \`Nessun utente in lista\`'}
┃
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`
            m.reply(caption, null, { mentions: conn.parseMention(list) })
            break
    }
}

// Handler before per eventuale logica silenziosa (opzionale)
handler.before = async (m, { conn }) => {
    // Qui puoi aggiungere logica che gira ad ogni messaggio se necessario
    return
}

handler.help = ['addwhitelist', 'delwhitelist', 'listwhitelist']
handler.tags = ['owner']
handler.command = ['addwhitelist', 'delwhitelist', 'listwhitelist']
handler.rowner = true // Solo il creatore può gestire la lista
handler.group = true

export default handler
