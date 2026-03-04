global.navale = global.navale || {}

let handler = async (m, { conn, text, command }) => {
    let chat = m.chat
    let user = m.sender

    // --- COMANDO INIZIALE: .battaglia @user ---
    if (command === 'battaglia') {
        if (global.navale[chat]) return m.reply('*⚠️ C\'è già una sfida in sospeso o una partita in corso. Usa .endgame per forzare la chiusura.*')
        
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*Devi menzionare l\'avversario che desideri sfidare!*')
        if (target === user) return m.reply('*Non puoi sfidare te stesso.*')

        global.navale[chat] = {
            p1: user,
            p2: target,
            status: 'WAITING',
            turno: user,
            board1: generateBoard(),
            board2: generateBoard(),
            hits1: [],
            hits2: []
        }

        let intro = `*⚓ BATTAGLIA NAVALE: SFIDA LANCIATA! ⚓*\n`
        intro += `──────────────────────\n`
        intro += `*SFIDANTE:* @${user.split('@')[0]}\n`
        intro += `*AVVERSARIO:* @${target.split('@')[0]}\n\n`
        intro += `*📜 REGOLE:*\n`
        intro += `*1.* Griglia di gioco *5x5*.\n`
        intro += `*2.* Ogni flotta ha *3 Navi* [ 🚢 ].\n`
        intro += `*3.* Si attacca col comando *.fuoco [coordinate]* (es: .fuoco A1).\n\n`
        intro += `*@${target.split('@')[0]}, accetti la sfida?*`

        const buttons = [
            { buttonId: `.accetta`, buttonText: { displayText: 'ACCETTA ✅' }, type: 1 },
            { buttonId: `.rifiuta`, buttonText: { displayText: 'RIFIUTA ❌' }, type: 1 }
        ]

        const buttonMessage = {
            text: intro,
            footer: 'Usa .endgame per annullare in qualsiasi momento',
            buttons: buttons,
            headerType: 1,
            mentions: [user, target]
        }

        return conn.sendMessage(chat, buttonMessage, { quoted: m })
    }

    // --- COMANDO PER TERMINARE LA PARTITA: .endgame ---
    if (command === 'endgame' || command === 'fine') {
        if (!global.navale[chat]) return m.reply('*Non ci sono partite attive da terminare.*')
        delete global.navale[chat]
        return m.reply('*🏁 La partita è stata terminata forzatamente. La chat è ora libera.*')
    }

    // --- LOGICA ACCETTA ---
    if (command === 'accetta') {
        let game = global.navale[chat]
        if (!game || game.status !== 'WAITING') return
        if (user !== game.p2) return m.reply('*Solo l\'utente sfidato può accettare la partita.*')

        game.status = 'PLAYING'
        return conn.reply(chat, `*🚢 PARTITA INIZIATA!*\n\n*Inizia @${game.p1.split('@')[0]}*\nUsa il comando *.fuoco [A-E][1-5]*`, m, { mentions: [game.p1] })
    }

    // --- LOGICA RIFIUTA ---
    if (command === 'rifiuta') {
        let game = global.navale[chat]
        if (!game || game.status !== 'WAITING') return
        if (user !== game.p2) return m.reply('*Non puoi rifiutare una sfida non diretta a te.*')

        delete global.navale[chat]
        return conn.reply(chat, `*SFIDA ANNULLATA! @${user.split('@')[0]} ha rifiutato.*`, m, { mentions: [user] })
    }

    // --- COMANDO DI ATTACCO: .fuoco ---
    if (command === 'fuoco') {
        let game = global.navale[chat]
        if (!game || game.status !== 'PLAYING') return m.reply('*Nessuna battaglia attiva.*')
        if (user !== game.turno) return m.reply('*Non è il tuo turno!*')

        let coord = text.toUpperCase().trim()
        if (!/^[A-E][1-5]$/.test(coord)) return m.reply('*Coordinate errate! Inserisci un valore da A1 a E5.*')

        let isP1 = user === game.p1
        let opponentBoard = isP1 ? game.board2 : game.board1
        let hits = isP1 ? game.hits2 : game.hits1

        if (hits.includes(coord)) return m.reply('*Hai già colpito questa posizione!*')
        hits.push(coord)

        let isHit = opponentBoard.includes(coord)
        let win = opponentBoard.every(ship => hits.includes(ship))

        if (win) {
            let vincitore = user
            delete global.navale[chat]
            return conn.reply(chat, `*💥 VITTORIA! TUTTE LE NAVI NEMICHE SONO STATE AFFONDATE!* \n\n*Vincitore:* @${vincitore.split('@')[0]} 🏆`, m, { mentions: [vincitore] })
        }

        game.turno = isP1 ? game.p2 : game.p1
        let esito = isHit ? `*🔥 COLPITO!*` : `*💦 ACQUA!*`
        let grid = renderGrid(hits, opponentBoard)
        
        return conn.reply(chat, `${esito}\n\n${grid}\n*Prossimo turno: @${game.turno.split('@')[0]}*`, m, { mentions: [game.turno] })
    }
}

function generateBoard() {
    let coords = []
    let letters = ['A', 'B', 'C', 'D', 'E']
    while (coords.length < 3) {
        let c = letters[Math.floor(Math.random() * 5)] + (Math.floor(Math.random() * 5) + 1)
        if (!coords.includes(c)) coords.push(c)
    }
    return coords
}

function renderGrid(hits, ships) {
    let letters = ['A', 'B', 'C', 'D', 'E']
    let grid = '    1   2   3   4   5\n'
    for (let l of letters) {
        grid += l + ' '
        for (let i = 1; i <= 5; i++) {
            let c = l + i
            if (hits.includes(c)) {
                grid += ships.includes(c) ? ' 💥' : ' 🌊'
            } else {
                grid += ' ⬛'
            }
        }
        grid += '\n'
    }
    return '```' + grid + '```'
}

handler.command = /^(battaglia|accetta|rifiuta|fuoco|endgame|fine)$/i
handler.group = true
export default handler
