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
    { nome: 'ROSSO', color: '#ff4d4d' },
    { nome: 'BLU', color: '#4d94ff' },
    { nome: 'VERDE', color: '#4dff88' },
    { nome: 'GIALLO', color: '#ffff4d' }
]

const footer = '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'

let handler = async (m, { conn, command, args, usedPrefix }) => {
    // Inizializzazione Database Utente (Sistema Euro)
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    let user = global.db.data.users[m.sender]
    if (user.euro === undefined) user.euro = 50 // Saldo iniziale se nuovo
    if (user.exp === undefined) user.exp = 0

    const checkMoney = (amount) => {
        if (user.euro < amount) {
            m.reply(`⚠️ *Saldo insufficiente!* Hai solo *${user.euro}€*.`)
            return false
        }
        return true
    }

    // --- 1. MENU PRINCIPALE ---
    if (command === 'casino') {
        let intro = `ㅤ⋆｡˚『 ╭ \`🎰 GRAND CASINÒ 🎰\` ╯ 』˚｡⋆\n╭\n`
        intro += `│ 『 💰 』 \`Il tuo Saldo:\` *${user.euro}€*\n`
        intro += `│ 『 🆙 』 \`Livello Exp:\` *${user.exp}*\n`
        intro += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*\n\n`
        intro += `*Seleziona un gioco per puntare:*`

        const buttons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎰 SLOT', id: `${usedPrefix}infoslot` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🃏 BLACKJACK', id: `${usedPrefix}infobj` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⚽ RIGORI', id: `${usedPrefix}inforigore` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎟️ GRATTA&VINCI', id: `${usedPrefix}infogratta` }) }
        ]
        
        return conn.sendMessage(m.chat, { text: intro, footer, interactiveButtons: buttons }, { quoted: m })
    }

    // --- 2. GESTIONE INFO TASTI ---
    if (command === 'infoslot') return m.reply(`*🎰 SLOT*\nPunta *20€* per girare!\nUsa: \`${usedPrefix}slot\``)
    if (command === 'infobj') return m.reply(`*🃏 BLACKJACK*\nPunta *50€*!\nUsa: \`${usedPrefix}blackjack\``)
    if (command === 'infogratta') return m.reply(`*🎟️ GRATTA & VINCI*\nCosto biglietto: *100€*!\nUsa: \`${usedPrefix}gratta\``)
    if (command === 'inforigore') return m.reply(`*⚽ RIGORI*\nPunta *30€*!\nUsa: \`${usedPrefix}rigore sx/cx/dx\``)

    // --- 3. LOGICHE GIOCHI ---

    // ⚽ RIGORI
    if (command === 'rigore') {
        if (!checkMoney(30)) return
        let parata = ['sx', 'cx', 'dx'][Math.floor(Math.random() * 3)]
        let tiro = args[0] ? args[0].toLowerCase() : 'cx'
        let win = tiro !== parata
        
        user.euro += win ? 40 : -30
        user.exp += 10

        const canvas = createCanvas(600, 350); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#2e7d32'; ctx.fillRect(0, 0, 600, 350)
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.strokeRect(100, 50, 400, 250)
        let pos = { sx: 160, cx: 300, dx: 440 }
        ctx.fillStyle = '#111'; ctx.fillRect(pos[parata]-40, 160, 80, 20)
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(pos[tiro] || 300, win ? 140 : 170, 15, 0, Math.PI*2); ctx.fill()

        let cap = `ㅤ⋆｡˚『 ╭ \`${win ? '⚽ GOOOL!' : '🧤 PARATA!'}\` ╯ 』˚｡⋆\n╭\n`
        cap += `│ 『 💰 』 \`Esito:\` *${win ? '+40€' : '-30€'}*\n`
        cap += `│ 『 👛 』 \`Saldo Attuale:\` *${user.euro}€*\n`
        cap += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: cap, footer }, { quoted: m })
    }

    // 🎰 SLOT
    if (command === 'slot') {
        if (!checkMoney(20)) return
        let r = [fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)]]
        let win = (r[0] === r[1] && r[1] === r[2]) // Jackpot 3 uguali
        let semiWin = (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) // 2 uguali
        
        let premio = win ? 200 : (semiWin ? 40 : -20)
        user.euro += premio
        user.exp += 5

        const canvas = createCanvas(600, 250); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#111'; ctx.fillRect(0,0,600,250)
        try {
            const i1 = await loadImage(fruitURLs[r[0]]), i2 = await loadImage(fruitURLs[r[1]]), i3 = await loadImage(fruitURLs[r[2]])
            ctx.drawImage(i1, 100, 50, 100, 100); ctx.drawImage(i2, 250, 50, 100, 100); ctx.drawImage(i3, 400, 50, 100, 100)
        } catch (e) {}

        let cap = `ㅤ⋆｡˚『 ╭ \`🎰 SLOT MACHINE 🎰\` ╯ 』˚｡⋆\n╭\n`
        cap += `│ 『 🎰 』 \`Risultato:\` [ ${r[0]} | ${r[1]} | ${r[2]} ]\n`
        cap += `│ 『 💰 』 \`Vincita:\` *${premio}€*\n`
        cap += `│ 『 👛 』 \`Saldo:\` *${user.euro}€*\n`
        cap += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: cap, footer }, { quoted: m })
    }

    // 🎟️ GRATTA & VINCI
    if (command === 'gratta') {
        if (!checkMoney(100)) return
        let v = [0, 0, 150, 0, 300, 0, 1000, 0][Math.floor(Math.random() * 8)]
        user.euro += (v - 100)
        user.exp += 20

        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#d4af37'; ctx.fillRect(0,0,600,300)
        ctx.fillStyle = '#000'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'
        ctx.fillText(v > 0 ? `HAI VINTO ${v}€!` : 'NON HAI VINTO', 300, 160)

        let cap = `ㅤ⋆｡˚『 ╭ \`🎟️ GRATTA E VINCI 🎟️\` ╯ 』˚｡⋆\n╭\n`
        cap += `│ 『 💰 』 \`Esito:\` *${v > 0 ? 'FORTUNATO!' : 'PERDENTE'}*\n`
        cap += `│ 『 💹 』 \`Netto:\` *${v - 100}€*\n`
        cap += `│ 『 👛 』 \`Saldo:\` *${user.euro}€*\n`
        cap += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: cap, footer }, { quoted: m })
    }

    // 🃏 BLACKJACK (Semplificato)
    if (command === 'blackjack' || command === 'blakjak') {
        if (!checkMoney(50)) return
        let tu = Math.floor(Math.random() * 11) + 11
        let banco = Math.floor(Math.random() * 10) + 12
        let win = (tu <= 21 && (tu > banco || banco > 21))
        
        user.euro += win ? 50 : -50
        user.exp += 15

        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#1b5e20'; ctx.fillRect(0,0,600,300)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'
        ctx.fillText(`TU: ${tu} | BANCO: ${banco}`, 300, 130); ctx.fillText(win ? 'VITTORIA!' : 'SCONFITTA!', 300, 220)

        let cap = `ㅤ⋆｡˚『 ╭ \`🃏 BLACKJACK 🃏\` ╯ 』˚｡⋆\n╭\n`
        cap += `│ 『 👤 』 \`Il tuo punteggio:\` *${tu}*\n`
        cap += `│ 『 🏦 』 \`Banco:\` *${banco}*\n`
        cap += `│ 『 💰 』 \`Esito:\` *${win ? '+50€' : '-50€'}*\n`
        cap += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: cap, footer }, { quoted: m })
    }
}

handler.help = ['casino']
handler.tags = ['giochi']
handler.command = /^(casino|infoslot|infobj|infogratta|inforigore|slot|blackjack|blakjak|gratta|rigore)$/i
handler.group = true
handler.register = true

export default handler
