import { createCanvas, loadImage } from 'canvas'

// --- CONFIGURAZIONI ---
const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']
const fruitURLs = {
    '🍒': 'https://twemoji.maxcdn.com/v/latest/72x72/1f352.png',
    '🍋': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34b.png',
    '🍉': 'https://twemoji.maxcdn.com/v/latest/72x72/1f349.png',
    '🍇': 'https://twemoji.maxcdn.com/v/latest/72x72/1f347.png',
    '🍎': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34e.png',
    '🍓': 'https://twemoji.maxcdn.com/v/latest/72x72/1f353.png'
}
const cavalliConfig = [
    { nome: 'ROSSO', emoji: '🔴', color: '#ff0000' },
    { nome: 'BLU', emoji: '🔵', color: '#0000ff' },
    { nome: 'VERDE', emoji: '🟢', color: '#00ff00' },
    { nome: 'GIALLO', emoji: '🟡', color: '#ffff00' }
]

let handler = async (m, { conn, command, args, usedPrefix }) => {
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    let user = global.db.data.users[m.sender]
    if (user.fiches === undefined) user.fiches = 1000
    let groupName = m.isGroup ? (conn.chats[m.chat]?.subject || 'GUEST') : 'CASINÒ'

    // --- 1. MENU PRINCIPALE (TUTTI I TASTI) ---
    if (command === 'casino') {
        let intro = `*🎰 BENVENUTO NEL CASINÒ DI ${groupName.toUpperCase()} 🎰*\n\n`
        intro += `*SALDO ATTUALE:* *${user.fiches} FICHES* 🪙\n\n`
        intro += `*SCEGLI IL TUO GIOCO:*`
        
        const buttons = [
            { buttonId: `${usedPrefix}infoslot`, buttonText: { displayText: '🎰 SLOT' }, type: 1 },
            { buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 BLACKJACK' }, type: 1 },
            { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA' }, type: 1 },
            { buttonId: `${usedPrefix}inforoulette`, buttonText: { displayText: '🎡 ROULETTE' }, type: 1 },
            { buttonId: `${usedPrefix}infogratta`, buttonText: { displayText: '🎟️ GRATTA & VINCI' }, type: 1 },
            { buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGORI' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: intro, buttons, mentions: [m.sender] }, { quoted: m })
    }

    // --- 2. GESTIONE DESCRIZIONI E SOTTO-BOTTONI ---
    if (command === 'infoslot') {
        return conn.sendMessage(m.chat, { text: `*🎰 SLOT MACHINE*\nAllinea 3 frutti per il Jackpot!\nCosto: 100`, buttons: [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 TIRA LA LEVA' }, type: 1 }] })
    }
    if (command === 'infobj') {
        return conn.sendMessage(m.chat, { text: `*🃏 BLACKJACK*\nBatti il banco senza superare 21.\nPuntata: 100`, buttons: [{ buttonId: `${usedPrefix}blakjak 100`, buttonText: { displayText: '🃏 GIOCA' }, type: 1 }] })
    }
    if (command === 'infocorsa') {
        const buttons = cavalliConfig.map(c => ({ buttonId: `${usedPrefix}puntacorsa ${c.nome}`, buttonText: { displayText: `${c.emoji} ${c.nome}` }, type: 1 }))
        return conn.sendMessage(m.chat, { text: `*🏇 CORSA CAVALLI*\nScegli il colore del vincitore (X3)!`, buttons })
    }
    if (command === 'inforoulette') {
        const buttons = [{ buttonId: `${usedPrefix}playroulette pari`, buttonText: { displayText: 'PARI' }, type: 1 }, { buttonId: `${usedPrefix}playroulette dispari`, buttonText: { displayText: 'DISPARI' }, type: 1 }]
        return conn.sendMessage(m.chat, { text: `*🎡 ROULETTE*\nPunta su Pari o Dispari!`, buttons })
    }
    if (command === 'infogratta') {
        return conn.sendMessage(m.chat, { text: `*🎟️ GRATTA & VINCI*\nCosto ticket: 200. Vinci fino a 5000!`, buttons: [{ buttonId: `${usedPrefix}gratta`, buttonText: { displayText: '🎟️ COMPRA BIGLIETTO' }, type: 1 }] })
    }
    if (command === 'inforigore') {
        const buttons = [{ buttonId: `${usedPrefix}rigore sx`, buttonText: { displayText: '⬅️ SINISTRA' }, type: 1 }, { buttonId: `${usedPrefix}rigore cx`, buttonText: { displayText: '⬆️ CENTRO' }, type: 1 }, { buttonId: `${usedPrefix}rigore dx`, buttonText: { displayText: '➡️ DESTRA' }, type: 1 }]
        return conn.sendMessage(m.chat, { text: `*⚽ SFIDA AI RIGORI*\nScegli dove tirare e batti il portiere!`, buttons })
    }

    // --- 3. LOGICHE GIOCHI ---

    // ⚽ RIGORI (NUOVO)
    if (command === 'rigore') {
        if (user.fiches < 100) return m.reply('❌ Fiches insufficienti!')
        let parata = ['sx', 'cx', 'dx'][Math.floor(Math.random() * 3)]
        let tiro = args[0], win = tiro !== parata
        user.fiches += win ? 150 : -100
        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(0,0,600,300); // Erba
        ctx.fillStyle = '#fff'; ctx.fillRect(100, 50, 400, 10); // Traversa
        ctx.fillStyle = win ? '#000' : '#fff'; ctx.font = '50px Sans'; ctx.fillText('⚽', 300, 150)
        ctx.fillText('🧤', parata === 'sx' ? 120 : parata === 'dx' ? 480 : 300, 100)
        let cap = win ? '*⚽ GOOOOOL! HAI VINTO!*' : '*🧤 PARATA! IL PORTIERE TI HA BEFFATO.*'
        const buttons = [{ buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `${cap}\n*SALDO:* *${user.fiches}*`, buttons })
    }

    // 🎰 SLOT
    if (command === 'slot') {
        if (user.fiches < 100) return m.reply('❌ Fiches insufficienti!')
        let r = [fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)]]
        let win = (r[0] === r[1] || r[1] === r[2] || r[0] === r[2])
        user.fiches += win ? 200 : -100
        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,600,300)
        const buttons = [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { text: `🎰 *SLOT* 🎰\n\n| ${r[0]} | ${r[1]} | ${r[2]} |\n\n${win ? '*VITTORIA!*' : '*SCONFITTA!*'}\n*SALDO:* ${user.fiches}`, buttons })
    }

    // 🃏 BLACKJACK (FAST)
    if (command === 'blakjak' || command === 'blackjack') {
        let bet = 100
        let tu = Math.floor(Math.random() * 11) + 11, banco = Math.floor(Math.random() * 10) + 12
        let win = (tu <= 21 && (tu > banco || banco > 21))
        user.fiches += win ? bet : -bet
        const buttons = [{ buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return m.reply(`*🃏 BLACKJACK*\n\n*TU:* ${tu}\n*BANCO:* ${banco}\n\n${win ? '*HAI VINTO!*' : '*HAI PERSO!*'}\n*SALDO:* ${user.fiches}`, null, { buttons })
    }

    // 🎟️ GRATTA & VINCI
    if (command === 'gratta') {
        if (user.fiches < 200) return m.reply('❌ Fiches insufficienti!')
        let premi = [0, 0, 500, 1000, 0, 200, 0, 5000], vinto = premi[Math.floor(Math.random() * 8)]
        user.fiches += (vinto - 200)
        const buttons = [{ buttonId: `${usedPrefix}infogratta`, buttonText: { displayText: '🎟️ RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return m.reply(`*🎟️ GRATTA E VINCI*\n\n${vinto > 0 ? `🎊 HAI VINTO *${vinto}* FICHES!` : '💀 NON HAI VINTO NULLA.'}\n*SALDO:* ${user.fiches}`, null, { buttons })
    }

    // 🏇 CORSA CAVALLI
    if (command === 'puntacorsa') {
        let scelta = args[0]?.toUpperCase(), vIdx = Math.floor(Math.random() * 4)
        let vinto = scelta === cavalliConfig[vIdx].nome
        user.fiches += vinto ? 300 : -100
        let cap = `*🏇 CORSA FINITA!*\n\n*VINCE:* ${cavalliConfig[vIdx].emoji} *${cavalliConfig[vIdx].nome}*\n\n${vinto ? '*🎉 VITTORIA!*' : '*💀 PERSO!*'}\n*SALDO:* ${user.fiches}`
        const buttons = [{ buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return m.reply(cap, null, { buttons })
    }
}

handler.help = ['casino', 'slot', 'blakjak', 'corsa', 'gratta', 'rigore']
handler.tags = ['giochi']
handler.command = /^(casino|infoslot|infobj|infocorsa|inforoulette|infogratta|inforigore|slot|blakjak|blackjack|puntacorsa|playroulette|gratta|rigore)$/i
handler.group = true

export default handler
