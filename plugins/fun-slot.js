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

    // --- 1. MENU PRINCIPALE ---
    if (command === 'casino') {
        let intro = `*🎰 CASINÒ ${groupName.toUpperCase()} 🎰*\n*💰 SALDO:* *${user.fiches} FICHES*`
        const buttons = [
            { buttonId: `${usedPrefix}infoslot`, buttonText: { displayText: '🎰 SLOT' }, type: 1 },
            { buttonId: `${usedPrefix}inforoulette`, buttonText: { displayText: '🎡 ROULETTE' }, type: 1 },
            { buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGORI' }, type: 1 },
            { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: intro, buttons }, { quoted: m })
    }

    // --- 2. INFO GIOCHI ---
    if (command === 'inforoulette') {
        const buttons = [
            { buttonId: `${usedPrefix}playroulette pari`, buttonText: { displayText: '2️⃣ PARI' }, type: 1 },
            { buttonId: `${usedPrefix}playroulette dispari`, buttonText: { displayText: '1️⃣ DISPARI' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: `*🎡 ROULETTE FRANCESE*\nPunta 100 fiches su PARI o DISPARI.\nIl numero 0 vince sempre per il banco!`, buttons })
    }

    if (command === 'inforigore') {
        const buttons = [
            { buttonId: `${usedPrefix}rigore sx`, buttonText: { displayText: '⬅️ SX' }, type: 1 },
            { buttonId: `${usedPrefix}rigore cx`, buttonText: { displayText: '⬆️ CX' }, type: 1 },
            { buttonId: `${usedPrefix}rigore dx`, buttonText: { displayText: '➡️ DX' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: `*⚽ SFIDA AI RIGORI*\nScegli dove tirare. Se segni vinci 150!`, buttons })
    }

    if (command === 'infoslot') return conn.sendMessage(m.chat, { text: `*🎰 SLOT*\nCosto: 100`, buttons: [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 GIOCA' }, type: 1 }] })
    if (command === 'infocorsa') {
        const buttons = cavalliConfig.map(c => ({ buttonId: `${usedPrefix}puntacorsa ${c.nome}`, buttonText: { displayText: `${c.emoji} ${c.nome}` }, type: 1 }))
        return conn.sendMessage(m.chat, { text: `*🏇 CORSA*\nScegli un cavallo (X3):`, buttons })
    }

    // --- 3. LOGICHE CON IMMAGINI ---

    // 🎡 ROULETTE (REINTEGRATA)
    if (command === 'playroulette') {
        if (user.fiches < 100) return m.reply('❌ Fiches insufficienti!')
        let scelta = args[0]
        let num = Math.floor(Math.random() * 37)
        let isPari = num !== 0 && num % 2 === 0
        let win = (scelta === 'pari' && isPari) || (scelta === 'dispari' && !isPari && num !== 0)
        user.fiches += win ? 100 : -100

        const canvas = createCanvas(600, 300)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#064e3b'; ctx.fillRect(0, 0, 600, 300) // Verde Roulette
        
        // Cerchio numero
        ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 10; ctx.strokeRect(200, 50, 200, 150)
        ctx.fillStyle = num === 0 ? '#10b981' : (isPari ? '#ef4444' : '#111827')
        ctx.fillRect(205, 55, 190, 140)
        
        ctx.fillStyle = '#fff'; ctx.font = 'bold 80px Sans'; ctx.textAlign = 'center'
        ctx.fillText(num, 300, 155)
        ctx.font = 'bold 30px Sans'; ctx.fillText(win ? '💰 VINTO!' : '💀 PERSO!', 300, 260)

        const buttons = [{ buttonId: `${usedPrefix}inforoulette`, buttonText: { displayText: '🎡 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*SALDO:* ${user.fiches}`, buttons }, { quoted: m })
    }

    // ⚽ RIGORI (PORTA SISTEMATA)
    if (command === 'rigore') {
        if (user.fiches < 100) return m.reply('❌ Fiches insufficienti!')
        let parata = ['sx', 'cx', 'dx'][Math.floor(Math.random() * 3)]
        let tiro = args[0], win = tiro !== parata
        user.fiches += win ? 150 : -100

        const canvas = createCanvas(600, 350)
        const ctx = canvas.getContext('2d')
        // Erba
        ctx.fillStyle = '#22c55e'; ctx.fillRect(0, 0, 600, 350)
        // Disegno Porta
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 8
        ctx.strokeRect(100, 50, 400, 250) // Pali e traversa
        // Rete
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        for(let i=100; i<500; i+=20) { ctx.beginPath(); ctx.moveTo(i, 50); ctx.lineTo(i, 300); ctx.stroke() }
        for(let i=50; i<300; i+=20) { ctx.beginPath(); ctx.moveTo(100, i); ctx.lineTo(500, i); ctx.stroke() }

        ctx.font = '60px Sans'; ctx.textAlign = 'center'
        // Portiere
        let pPos = parata === 'sx' ? 160 : parata === 'dx' ? 440 : 300
        ctx.fillText('🧤', pPos, 180)
        // Palla
        let bPos = win ? (tiro === 'sx' ? 160 : tiro === 'dx' ? 440 : 300) : pPos
        ctx.fillText('⚽', bPos, win ? 150 : 170)

        const buttons = [{ buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: win ? '⚽ *GOOOL!*' : '🧤 *PARATA!*', buttons }, { quoted: m })
    }

    // 🎰 SLOT
    if (command === 'slot') {
        if (user.fiches < 100) return m.reply('❌ Fiches insufficienti!')
        let r = [fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)]]
        let win = (r[0] === r[1] || r[1] === r[2] || r[0] === r[2])
        user.fiches += win ? 200 : -100
        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#111'; ctx.fillRect(0, 0, 600, 300)
        try {
            const i1 = await loadImage(fruitURLs[r[0]]), i2 = await loadImage(fruitURLs[r[1]]), i3 = await loadImage(fruitURLs[r[2]])
            ctx.drawImage(i1, 100, 80, 100, 100); ctx.drawImage(i2, 250, 80, 100, 100); ctx.drawImage(i3, 400, 80, 100, 100)
        } catch (e) {}
        ctx.fillStyle = '#fff'; ctx.font = 'bold 30px Sans'; ctx.textAlign = 'center'; ctx.fillText(win ? '✅ VINTO!' : '❌ PERSO!', 300, 250)
        const buttons = [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*SALDO:* ${user.fiches}`, buttons }, { quoted: m })
    }

    // 🏇 CORSA
    if (command === 'puntacorsa') {
        let scelta = args[0]?.toUpperCase(), vIdx = Math.floor(Math.random() * 4)
        let vinto = scelta === cavalliConfig[vIdx].nome
        user.fiches += vinto ? 300 : -100
        const canvas = createCanvas(600, 400); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#78350f'; ctx.fillRect(0, 0, 600, 400)
        cavalliConfig.forEach((c, i) => {
            ctx.fillText(i === vIdx ? '🏇' : '🐎', (i === vIdx ? 450 : 100), 80 + (i * 80))
        })
        const buttons = [{ buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: vinto ? '✅ VINTO!' : '❌ PERSO!', buttons }, { quoted: m })
    }
}

handler.command = /^(casino|infoslot|infocorsa|inforigore|inforoulette|slot|puntacorsa|rigore|playroulette)$/i
export default handler
