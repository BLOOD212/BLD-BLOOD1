import { createCanvas, loadImage } from 'canvas'

let handler = async (m, { conn, command, args, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (!user) user = global.db.data.users[m.sender] = { fiches: 1000, exp: 0, level: 1 }
    let groupName = m.isGroup ? m.metadata.subject : 'Gemini Casino'

    // --- 1. BLACKJACK VISIVO ---
    if (command === 'blackjack' || command === 'blakjak') {
        let bet = parseInt(args[0])
        if (!bet || bet <= 0) return m.reply(`*⚠️ USA: ${usedPrefix}${command} <quantità>*`)
        if (user.fiches < bet) return m.reply('*❌ FICHES INSUFFICIENTI!*')

        user.fiches -= bet
        let tu = Math.floor(Math.random() * 10) + 12
        let banco = Math.floor(Math.random() * 10) + 13
        let vinto = (tu <= 21 && (tu > banco || banco > 21))

        const canvas = createCanvas(600, 400)
        const ctx = canvas.getContext('2d')

        // Sfondo Tavolo Verde
        ctx.fillStyle = '#0a5d1e'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 5
        ctx.strokeRect(20, 20, 560, 360)

        // Testo
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.font = 'bold 40px Sans'
        ctx.fillText('🃏 BLACKJACK 🃏', canvas.width / 2, 70)

        // Punteggi
        ctx.font = '30px Sans'
        ctx.fillText(`TU: ${tu}`, 150, 200)
        ctx.fillText(`BANCO: ${banco}`, 450, 200)

        // Esito
        ctx.font = 'bold 50px Sans'
        ctx.fillStyle = vinto ? '#2ecc71' : '#e74c3c'
        ctx.fillText(vinto ? 'HAI VINTO!' : 'HAI PERSO!', canvas.width / 2, 320)

        if (vinto) user.fiches += bet * 2
        
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*🃏 TAVOLO DA GIOCO DI ${m.pushName.toUpperCase()}*\n*SALDO ATTUALE:* *${user.fiches} FICHES*` }, { quoted: m })
    }

    // --- 2. ROULETTE VISIVA ---
    if (command === 'roulette') {
        let bet = parseInt(args[0])
        let scelta = args[1]?.toLowerCase()
        if (!bet || !['rosso', 'nero'].includes(scelta)) return m.reply(`*⚠️ USA: ${usedPrefix}roulette <quantità> rosso/nero*`)
        if (user.fiches < bet) return m.reply('*❌ FICHES INSUFFICIENTI!*')

        user.fiches -= bet
        let vincente = Math.random() > 0.5 ? 'rosso' : 'nero'
        let vinto = scelta === vincente

        const canvas = createCanvas(600, 400)
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Disegno Disco Roulette
        ctx.beginPath()
        ctx.arc(300, 200, 100, 0, Math.PI, false)
        ctx.fillStyle = '#e74c3c' // Rosso
        ctx.fill()
        ctx.beginPath()
        ctx.arc(300, 200, 100, Math.PI, Math.PI * 2, false)
        ctx.fillStyle = '#2c3e50' // Nero (Blu scuro/Nero)
        ctx.fill()

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 40px Sans'
        ctx.textAlign = 'center'
        ctx.fillText(`PALLINA SU: ${vincente.toUpperCase()}`, canvas.width / 2, 80)
        
        ctx.font = 'bold 50px Sans'
        ctx.fillStyle = vinto ? '#2ecc71' : '#e74c3c'
        ctx.fillText(vinto ? 'VITTORIA!' : 'SCONFITTA!', canvas.width / 2, 350)

        if (vinto) user.fiches += bet * 2
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*🎡 LA ROULETTE DI ${groupName.toUpperCase()}*\n*RISULTATO:* *${vincente.toUpperCase()}*` }, { quoted: m })
    }

    // --- 3. CORSA CAVALLI VISIVA ---
    if (command === 'corsa') {
        let bet = parseInt(args[0])
        if (!bet) return m.reply(`*⚠️ USA: ${usedPrefix}corsa <quantità>*`)
        
        const canvas = createCanvas(600, 400)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#5d4037' // Terra della pista
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        let cavalli = ['🐎', '🏇', '🐎', '🏇']
        let vincitoreIdx = Math.floor(Math.random() * 4)

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 30px Sans'
        ctx.fillText('🏁 TRAGUARDO 🏁', 450, 50)

        cavalli.forEach((c, i) => {
            let x = (i === vincitoreIdx) ? 480 : Math.floor(Math.random() * 300) + 50
            ctx.font = '50px Sans'
            ctx.fillText(c, x, 100 + (i * 80))
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 2
            ctx.strokeRect(10, 80 + (i * 80), 580, 2)
        })

        if (vincitoreIdx === 0) { // Esempio logica vittoria
            user.fiches += bet * 2
            m.reply('*🏆 IL TUO CAVALLO HA VINTO!*')
        } else {
            user.fiches -= bet
            m.reply('*💀 IL TUO CAVALLO È ARRIVATO ULTIMO!*')
        }

        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*🏇 GRAN PREMIO DI ${groupName.toUpperCase()}*` }, { quoted: m })
    }
}

handler.command = /^(blackjack|blakjak|roulette|corsa)$/i
handler.group = true
export default handler
