global.db = global.db || {}
global.db.data = global.db.data || {}
global.db.data.users = global.db.data.users || {}

let handler = async (m, { conn, text, command }) => {
    let chat = m.chat
    let user = m.sender
    let users = global.db.data.users

    const checkUser = (id) => {
        if (!id) return
        if (!users[id]) users[id] = {}
        if (!Array.isArray(users[id].p)) users[id].p = []
        if (users[id].c === undefined) users[id].c = null
        if (users[id].s === undefined) users[id].s = null
    }

    checkUser(user)

    // --- 1. COMANDO FAMIGLIA (SOLO COMANDI) ---
    if (command === 'famiglia') {
        let menu = `*🌳 SISTEMA GENEALOGICO REALE 🌳*\n\n`
        menu += `*ECCO I COMANDI DISPONIBILI:*\n\n`
        menu += `*👉 .unione @tag* - *CHIEDI DI UNIRTI A UN PARTNER*\n`
        menu += `*👉 .accettaunione* - *CONFERMA L'UNIONE RICEVUTA*\n`
        menu += `*👉 .adotta @tag* - *ADOTTA UN UTENTE COME FIGLIO*\n`
        menu += `*👉 .famigliamia* - *VISUALIZZA IL TUO ALBERO VERO*\n`
        menu += `*👉 .albero @tag* - *GUARDA L'ALBERO DI UN ALTRO*\n`
        menu += `*👉 .sciogli* - *TERMINA L'UNIONE ATTUALE*\n`
        menu += `*👉 .disereda @tag* - *RIMUOVI UN FIGLIO*\n\n`
        menu += `*⚠️ NOTA: NON PUOI ADOTTARE IL TUO PARTNER O I TUOI GENITORI!*`
        return m.reply(menu)
    }

    // --- 2. LOGICA UNIONE ---
    if (command === 'unione') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target || target === user) return m.reply('*⚠️ ERRORE: TAGGA UN PARTNER VALIDO!*')
        checkUser(target)
        if (users[user].s === target || users[target].s === user) return m.reply('*⚠️ AZIONE BLOCCATA: NO INCESTO!*')
        if (users[user].c) return m.reply('*⚠️ ERRORE: SEI GIÀ UNITO!*')
        
        users[user].proposta = target
        return conn.sendMessage(chat, { 
            text: `*💍 RICHIESTA DI UNIONE*\n\n*@${user.split('@')[0]} VUOLE UNIRSI A @${target.split('@')[0]}*\n\n*SCRIVI .ACCETTAUNIONE PER CONFERMARE!*`, 
            mentions: [user, target] 
        })
    }

    // --- 3. LOGICA ADOTTA ---
    if (command === 'adotta') {
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*⚠️ ERRORE: CHI VUOI ADOTTARE?*')
        checkUser(target)
        if (users[user].c === target || users[user].s === target || users[target].s) return m.reply('*⚠️ AZIONE NON VALIDA O REALE!*')

        users[user].p.push(target)
        users[target].s = user
        return m.reply(`*👶 ADOZIONE COMPLETATA PER @${target.split('@')[0]}*`, null, { mentions: [target] })
    }

    // --- 4. VISUALIZZAZIONE ALBERO (FAMIGLIAMIA / ALBERO) ---
    if (command === 'famigliamia' || command === 'albero') {
        let target = (command === 'famigliamia') ? user : (m.mentionedJid[0] || (m.quoted ? m.quoted.sender : user))
        checkUser(target)
        
        let u = users[target]
        let fmt = (id) => id ? `*@${id.split('@')[0]}*` : '*???*'

        let partner = u.c
        let padre = u.s
        let madre = padre ? users[padre]?.c : null
        let nonno = padre ? users[padre]?.s : null
        let nonna = nonno ? users[nonno]?.c : null
        let fratelli = padre ? users[padre].p.filter(id => id !== target) : []

        let tree = `*🌳 ALBERO DI ${fmt(target).toUpperCase()} 🌳*\n\n`
        tree += `       [👵 ${fmt(nonna)}] *♾️* [👴 ${fmt(nonno)}]\n`
        tree += `               ┃\n`
        tree += `       [👩 ${fmt(madre)}] *♾️* [👨 ${fmt(padre)}]\n`
        tree += `               ┃\n`
        
        if (fratelli.length > 0) {
            tree += `  ${fratelli.map(f => `[👫 ${fmt(f)}]`).join(' *━* ')} *━ ┓*\n`
            tree += `                       ┃\n`
        }

        if (partner) {
            tree += `      [👤 ${fmt(target)}] *💍* [💍 ${fmt(partner)}]\n`
        } else {
            tree += `               [👤 ${fmt(target)}]\n`
        }

        if (u.p && u.p.length > 0) {
            tree += `               *┣━━━━━━━━━━━━━━┓*\n`
            u.p.forEach((figlio, i) => {
                let rano = (i === u.p.length - 1) ? '*┗*' : '*┣*'
                tree += `               ${rano}*━━* [👶 ${fmt(figlio)}]\n`
                let nipoti = users[figlio]?.p || []
                nipoti.forEach((nipote, ni) => {
                    let subRano = (ni === nipoti.length - 1) ? '*┗*' : '*┣*'
                    let spazio = (i === u.p.length - 1) ? ' ' : '┃'
                    tree += `               ${spazio}       ${subRano}*━━* [🍼 ${fmt(nipote)}]\n`
                })
            })
        } else {
            tree += `               ┃\n`
            tree += `        *[🍃 NESSUN EREDE]*\n`
        }

        return conn.sendMessage(chat, { text: tree, mentions: [target, partner, padre, madre, nonno, nonna, ...fratelli, ...(u.p || [])].filter(Boolean) }, { quoted: m })
    }
}

handler.command = /^(unione|accettaunione|adotta|albero|famiglia|famigliamia|sciogli)$/i
handler.group = true
export default handler
