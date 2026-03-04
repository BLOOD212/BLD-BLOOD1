import { createCanvas, loadImage } from 'canvas'

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

    // --- 1. MENU PRINCIPALE .CASINO ---
    if (command === 'casino') {
        let intro = `*🎰 BENVENUTO NEL CASINÒ DI ${groupName.toUpperCase()} 🎰*\n\n`
        intro += `*CIAO* *@${m.sender.split('@')[0]}!* *ENTRA NEL MONDO DEL RISCHIO E DELLA FORTUNA. ABBIAMO PREPARATO PER TE I MIGLIORI TAVOLI DA GIOCO DELLE SEZIONE.* \n\n`
        intro += `*💰 IL TUO PORTAFOGLIO:* *${user.fiches} 🪙 FICHES*\n\n`
        intro += `*SCEGLI UNA DELLE NOSTRE ATTRAZIONI PER INIZIARE:*`

        const buttons = [
            { buttonId: `${usedPrefix}infoslot`, buttonText: { displayText: '🎰 SLOT MACHINE' }, type: 1 },
            { buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 BLACKJACK' }, type: 1 },
            { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA CAVALLI' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: intro, footer: '*IL BANCO VINCE SEMPRE (O QUASI)*', buttons, mentions: [m.sender] }, { quoted: m })
    }

    // --- 2. DESCRIZIONI GIOCHI ---
    if (command === 'infoslot') {
        let desc = `*🎰 SLOT MACHINE - REGOLAMENTO*\n\n*PROVA A FARE ACCOPPIATA DI FRUTTA! SE ESCONO 3 SIMBOLI UGUALI IL JACKPOT È TUO.*\n\n*💰 COSTO GIOCATA: 100 FICHES*`
        const buttons = [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 TIRA LA LEVA' }, type: 1 }]
        return conn.sendMessage(m.chat, { text: desc, buttons }, { quoted: m })
    }

    if (command === 'infobj') {
        let desc = `*🃏 BLACKJACK - REGOLAMENTO*\n\n*BATTI IL PUNTEGGIO DEL BANCO SENZA SUPERARE 21. SE SUPERI 21 HAI SBALLATO E PERDI TUTTO!*\n\n*💰 PUNTATA: 100 FICHES*`
        const buttons = [{ buttonId: `${usedPrefix}blakjak 100`, buttonText: { displayText: '🃏 GIOCA ORA' }, type: 1 }]
        return conn.sendMessage(m.chat, { text: desc, buttons }, { quoted: m })
    }

    if (command === 'infocorsa') {
        let desc = `*🏇 CORSA DEI CAVALLI - REGOLAMENTO*\n\n*SCEGLI IL TUO DESTRIERO. SE ARRIVA PRIMO AL TRAGUARDO TRIPLICHI LA TUA POSTA!*\n\n*💰 PUNTATA: 100 FICHES*`
        const buttons = [{ buttonId: `${usedPrefix}corsa 100`, buttonText: { displayText: '🏇 INIZIA GARA' }, type: 1 }]
        return conn.sendMessage(m.chat, { text: desc, buttons }, { quoted: m })
    }

    // --- 3. LOGICA GIOCHI (SLOT, BLAKJAK, CORSA) ---
    if (command === 'slot') {
        if (user.fiches < 100) return m.reply('*❌ NON HAI ABBASTANZA FICHES!*')
        let r1 = fruits[Math.floor(Math.random() * fruits.length)]
        let r2 = fruits[Math.floor(Math.random() * fruits.length)]
        let r3 = fruits[Math.floor(Math.random() * fruits.length)]
        let win = (r1 === r2 || r2 === r3 || r1 === r3)
        user.fiches += win ? 200 : -100
        const canvas = createCanvas(600, 400); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,600,400)
        const img1 = await loadImage(fruitURLs[r1]); const img2 = await loadImage(fruitURLs[r2]); const img3 = await loadImage(fruitURLs[r3])
        ctx.drawImage(img1, 100, 120, 100, 100); ctx.drawImage(img2, 250, 120, 100, 100); ctx.drawImage(img3, 400, 120, 100, 100)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 30px Sans'; ctx.textAlign = 'center'
        ctx.fillText(win ? '✅ VITTORIA!' : '❌ SCONFITTA!', 300, 320)
        const buttons = [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*SALDO:* *${user.fiches}*`, buttons }, { quoted: m })
    }

    if (command === 'blakjak' || command === 'blackjack') {
        let bet = parseInt(args[0]) || 100
        if (user.fiches < bet) return m.reply('*❌ FICHES INSUFFICIENTI!*')
        let tu = Math.floor(Math.random() * 10) + 12
        let banco = Math.floor(Math.random() * 10) + 13
        let vinto = (tu <= 21 && (tu > banco || banco > 21))
        user.fiches += vinto ? bet : -bet
        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#0a5d1e'; ctx.fillRect(0, 0, 600, 300)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 40px Sans'; ctx.textAlign = 'center'
        ctx.fillText(`TU: ${tu}  VS  BANCO: ${banco}`, 300, 150)
        ctx.fillText(vinto ? '🏆 VINTO!' : '💀 PERSO!', 300, 230)
        const buttons = [{ buttonId: `${usedPrefix}blakjak ${bet}`, buttonText: { displayText: '🃏 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*SALDO:* *${user.fiches}*`, buttons }, { quoted: m })
    }

    if (command === 'corsa') {
        let bet = parseInt(args[0]) || 100
        if (user.fiches < bet) return m.reply('*❌ FICHES INSUFFICIENTI!*')
        let vIdx = Math.floor(Math.random() * 4)
        let vinto = vIdx === 0
        user.fiches += vinto ? bet * 2 : -bet
        const canvas = createCanvas(600, 350); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#5d4037'; ctx.fillRect(0, 0, 600, 350)
        for(let i=0; i<4; i++) ctx.fillText(i === 0 ? '🏇' : '🐎', (i === vIdx ? 450 : 100), 80 + (i * 70))
        const buttons = [{ buttonId: `${usedPrefix}corsa ${bet}`, buttonText: { displayText: '🏇 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*SALDO:* *${user.fiches}*`, buttons }, { quoted: m })
    }
}

handler.command = /^(casino|infoslot|infobj|infocorsa|slot|blakjak|blackjack|corsa)$/i
handler.group = true
export default handler
