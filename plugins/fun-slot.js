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

    // --- 1. MENU PRINCIPALE ---
    if (command === 'casino') {
        let intro = `*🎰 GRAND CASINÒ 🎰*\n*💰 SALDO:* *${user.fiches} FICHES*\n\n*SCEGLI UN TAVOLO:*`
        const buttons = [
            { buttonId: `${usedPrefix}infoslot`, buttonText: { displayText: '🎰 SLOT' }, type: 1 },
            { buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 BLACKJACK' }, type: 1 },
            { buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGORI' }, type: 1 },
            { buttonId: `${usedPrefix}inforoulette`, buttonText: { displayText: '🎡 ROULETTE' }, type: 1 },
            { buttonId: `${usedPrefix}infogratta`, buttonText: { displayText: '🎟️ GRATTA&VINCI' }, type: 1 },
            { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: intro, buttons }, { quoted: m })
    }

    // --- GESTIONE INFO (Senza variazioni) ---
    if (command === 'infoslot') return conn.sendMessage(m.chat, { text: `*🎰 SLOT*\nCosto: 100`, buttons: [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 TIRA' }, type: 1 }] })
    if (command === 'infobj') return conn.sendMessage(m.chat, { text: `*🃏 BLACKJACK*\nPunta 100`, buttons: [{ buttonId: `${usedPrefix}blackjack`, buttonText: { displayText: '🃏 GIOCA' }, type: 1 }] })
    if (command === 'inforigore') return conn.sendMessage(m.chat, { text: `*⚽ RIGORI*\nScegli dove tirare:`, buttons: [{ buttonId: `${usedPrefix}rigore sx`, buttonText: { displayText: '⬅️ SX' }, type: 1 }, { buttonId: `${usedPrefix}rigore cx`, buttonText: { displayText: '⬆️ CX' }, type: 1 }, { buttonId: `${usedPrefix}rigore dx`, buttonText: { displayText: '➡️ DX' }, type: 1 }] })
    if (command === 'infocorsa') return conn.sendMessage(m.chat, { text: `*🏇 CORSA CAVALLI*\nPunta 100 sul vincitore (Paga X3):`, buttons: cavalliConfig.map(c => ({ buttonId: `${usedPrefix}puntacorsa ${c.nome}`, buttonText: { displayText: `${c.emoji} ${c.nome}` }, type: 1 })) })

    // --- 🏇 LOGICA CORSA CAVALLI (GRIGLIA SISTEMATA) ---
    if (command === 'puntacorsa') {
        let scelta = args[0]?.toUpperCase()
        if (!scelta) return m.reply('Scegli un cavallo!')
        if (user.fiches < 100) return m.reply('❌ Fiches insufficienti!')

        let vincitoreIdx = Math.floor(Math.random() * 4)
        let win = scelta === cavalliConfig[vincitoreIdx].nome
        user.fiches += win ? 200 : -100

        const canvas = createCanvas(700, 450)
        const ctx = canvas.getContext('2d')

        // Sfondo Ippodromo (Terra battuta)
        ctx.fillStyle = '#8d6e63'; ctx.fillRect(0, 0, 700, 450)

        // Disegno Griglia e Corsie
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3
        for (let i = 0; i <= 4; i++) {
            let y = 50 + (i * 90)
            ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(650, y); ctx.stroke() // Linee orizzontali
        }

        // Linea di Partenza e Traguardo
        ctx.lineWidth = 5
        ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(100, 50); ctx.lineTo(100, 410); ctx.stroke() // Partenza
        
        // Traguardo a scacchi
        ctx.fillStyle = '#111'
        for (let i = 50; i < 410; i += 20) {
            ctx.fillRect(600, i, 20, 10); ctx.fillRect(620, i + 10, 20, 10)
        }

        // Disegno Cavalli nelle corsie
        ctx.font = '50px Sans'; ctx.textAlign = 'center'
        cavalliConfig.forEach((c, i) => {
            let yPos = 110 + (i * 90)
            // Se è il vincitore lo mettiamo oltre il traguardo, gli altri restano indietro
            let xPos = (i === vincitoreIdx) ? 630 : Math.floor(Math.random() * 200) + 150
            
            // Colore della corsia (opaco)
            ctx.fillStyle = c.color + '33'; ctx.fillRect(50, 53 + (i * 90), 600, 84)
            
            // Icona Cavallo
            ctx.fillText('🏇', xPos, yPos)
            // Etichetta Nome
            ctx.font = 'bold 15px Sans'; ctx.fillStyle = '#fff'
            ctx.fillText(c.nome, 60, yPos - 10)
        })

        let cap = `*🏇 RISULTATO CORSA*\n\n*VINCE:* ${cavalliConfig[vincitoreIdx].emoji} *${cavalliConfig[vincitoreIdx].nome}*\n\n${win ? '✅ COMPLIMENTI! HAI VINTO 300!' : '❌ PECCATO, HAI PERSO 100.'}\n*SALDO:* ${user.fiches}`
        const buttons = [{ buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: cap, buttons }, { quoted: m })
    }

    // --- ⚽ LOGICA RIGORI (RESTA COME PRIMA) ---
    if (command === 'rigore') {
        let parata = ['sx', 'cx', 'dx'][Math.floor(Math.random() * 3)]
        let tiro = args[0], win = tiro !== parata
        user.fiches += win ? 150 : -100
        const canvas = createCanvas(600, 350); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#2e7d32'; ctx.fillRect(0, 0, 600, 350)
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.strokeRect(100, 50, 400, 250)
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.4)'
        for(let i=100; i<=500; i+=15) { ctx.beginPath(); ctx.moveTo(i, 50); ctx.lineTo(i, 300); ctx.stroke() }
        for(let i=50; i<=300; i+=15) { ctx.beginPath(); ctx.moveTo(100, i); ctx.lineTo(500, i); ctx.stroke() }
        let pos = { sx: 180, cx: 300, dx: 420 }; ctx.font = '60px Sans'; ctx.textAlign = 'center'
        ctx.fillText('🧤', pos[parata], 180); ctx.fillText('⚽', pos[tiro], win ? 140 : 170)
        const buttons = [{ buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: win ? '*GOOOL!*' : '*PARATA!*', buttons })
    }

    // --- Altre logiche (Slot, BJ, Roulette, Gratta) ---
    // (Mantenere le logiche precedenti senza rimuoverle)
}

handler.command = /^(casino|infoslot|infobj|infogratta|inforoulette|inforigore|infocorsa|slot|blackjack|blakjak|gratta|playroulette|rigore|puntacorsa)$/i
export default handler
