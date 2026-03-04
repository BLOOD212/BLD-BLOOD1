import { createCanvas, loadImage } from 'canvas'

// Configurazione Icone Slot
const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']
const fruitURLs = {
    '🍒': 'https://twemoji.maxcdn.com/v/latest/72x72/1f352.png',
    '🍋': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34b.png',
    '🍉': 'https://twemoji.maxcdn.com/v/latest/72x72/1f349.png',
    '🍇': 'https://twemoji.maxcdn.com/v/latest/72x72/1f347.png',
    '🍎': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34e.png',
    '🍓': 'https://twemoji.maxcdn.com/v/latest/72x72/1f353.png'
}

let handler = async (m, { conn, command, args, usedPrefix }) => {
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    let user = global.db.data.users[m.sender]
    
    if (user.fiches === undefined) user.fiches = 1000
    let groupName = m.isGroup ? (conn.chats[m.chat]?.subject || 'GUEST') : 'CASINÒ PRIVATO'

    // --- 1. MENU PRINCIPALE AGGIORNATO ---
    if (command === 'casino') {
        let intro = `*🎰 GRAND CASINÒ ${groupName.toUpperCase()} 🎰*\n\n`
        intro += `*UTENTE:* *@${m.sender.split('@')[0]}*\n*SALDO:* *${user.fiches} FICHES* 🪙\n\n`
        intro += `*SCEGLI UN TAVOLO DAL MENU QUI SOTTO:*`
        
        const buttons = [
            { buttonId: `${usedPrefix}infoslot`, buttonText: { displayText: '🎰 SLOT' }, type: 1 },
            { buttonId: `${usedPrefix}inforoulette`, buttonText: { displayText: '🎡 ROULETTE' }, type: 1 },
            { buttonId: `${usedPrefix}infogratta`, buttonText: { displayText: '🎟️ GRATTA & VINCI' }, type: 1 },
            { buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 BLACKJACK' }, type: 1 },
            { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: intro, buttons, mentions: [m.sender] }, { quoted: m })
    }

    // --- 2. NUOVE INFO E DESCRIZIONI ---
    if (command === 'inforoulette') {
        let desc = `*🎡 ROULETTE FRANCESE*\n\n*SCEGLI SE PUNTARE SUI NUMERI PARI O DISPARI PER RADDOPPIARE IL TUO BUDGET!*`
        const buttons = [
            { buttonId: `${usedPrefix}playroulette pari`, buttonText: { displayText: '2️⃣ PARI' }, type: 1 },
            { buttonId: `${usedPrefix}playroulette dispari`, buttonText: { displayText: '1️⃣ DISPARI' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: desc, buttons }, { quoted: m })
    }

    if (command === 'infogratta') {
        let desc = `*🎟️ GRATTA E VINCI*\n\n*COMPRA UN BIGLIETTO DA 200 FICHES E PROVA A VINCERE FINO A 5000!*`
        const buttons = [{ buttonId: `${usedPrefix}gratta`, buttonText: { displayText: '🎟️ ACQUISTA (200)' }, type: 1 }]
        return conn.sendMessage(m.chat, { text: desc, buttons }, { quoted: m })
    }

    // --- 3. LOGICA NUOVI GIOCHI ---

    // ROULETTE
    if (command === 'playroulette') {
        let scelta = args[0]
        if (user.fiches < 100) return m.reply('*❌ FICHES INSUFFICIENTI!*')
        let num = Math.floor(Math.random() * 37)
        let isPari = num !== 0 && num % 2 === 0
        let win = (scelta === 'pari' && isPari) || (scelta === 'dispari' && !isPari && num !== 0)
        
        user.fiches += win ? 100 : -100
        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#0a5d1e'; ctx.fillRect(0,0,600,300)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 80px Sans'; ctx.textAlign = 'center'
        ctx.fillText(num, 300, 150)
        ctx.font = '30px Sans'; ctx.fillText(win ? '💰 HAI VINTO!' : '💀 HAI PERSO!', 300, 230)
        
        const buttons = [{ buttonId: `${usedPrefix}inforoulette`, buttonText: { displayText: '🎡 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*NUMERO USCITO:* *${num}*\n*SALDO:* *${user.fiches}*`, buttons }, { quoted: m })
    }

    // GRATTA E VINCI
    if (command === 'gratta') {
        if (user.fiches < 200) return m.reply('*❌ NON HAI 200 FICHES!*')
        user.fiches -= 200
        let premi = [0, 0, 0, 100, 200, 500, 1000, 5000]
        let vinto = premi[Math.floor(Math.random() * premi.length)]
        user.fiches += vinto
        
        const canvas = createCanvas(600, 400); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#f1c40f'; ctx.fillRect(0,0,600,400)
        ctx.fillStyle = '#000'; ctx.font = 'bold 40px Sans'; ctx.textAlign = 'center'
        ctx.fillText('🎟️ GRATTA E VINCI 🎟️', 300, 80)
        ctx.font = 'bold 60px Sans'
        ctx.fillText(vinto > 0 ? `€ ${vinto}` : 'RITENTA', 300, 220)
        
        let cap = vinto > 0 ? `*🎊 COMPLIMENTI! HAI VINTO ${vinto} FICHES!*` : `*😢 BIGLIETTO PERDENTE... RITENTA!*`
        const buttons = [{ buttonId: `${usedPrefix}gratta`, buttonText: { displayText: '🎟️ COMPRA ANCORA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `${cap}\n*SALDO:* *${user.fiches}*`, buttons }, { quoted: m })
    }

    // --- LOGICHE PRECEDENTI (Slot, Blackjack, Corsa...) ---
    // [Inserire qui le sezioni di slot, blakjak e corsa cavalli fornite nei messaggi precedenti]
}

handler.help = ['casino', 'slot', 'roulette', 'gratta', 'blakjak', 'corsa']
handler.tags = ['giochi']
handler.command = /^(casino|infoslot|inforoulette|infogratta|infobj|infocorsa|slot|playroulette|gratta|blakjak|blackjack|puntacorsa)$/i
handler.group = true

export default handler
