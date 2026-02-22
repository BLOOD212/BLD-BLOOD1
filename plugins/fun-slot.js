import { createCanvas, loadImage } from 'canvas'

let cooldowns = {}
const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']

// URL Twemoji per ogni frutto
const fruitURLs = {
    '🍒': 'https://twemoji.maxcdn.com/v/latest/72x72/1f352.png',
    '🍋': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34b.png',
    '🍉': 'https://twemoji.maxcdn.com/v/latest/72x72/1f349.png',
    '🍇': 'https://twemoji.maxcdn.com/v/latest/72x72/1f347.png',
    '🍎': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34e.png',
    '🍓': 'https://twemoji.maxcdn.com/v/latest/72x72/1f353.png'
}

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]

    // ⏳ Cooldown 5 minuti
    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < 300000) {
        let timeLeft = cooldowns[m.sender] + 300000 - Date.now()
        let min = Math.floor(timeLeft / 60000)
        let sec = Math.floor((timeLeft % 60000) / 1000)
        return conn.reply(
            m.chat,
            `⏳ 𝗖𝗢𝗢𝗟𝗗𝗢𝗪𝗡\n⏱️ 𝗔𝘀𝗽𝗲𝘁𝘁𝗮 ${min}𝗺 ${sec}𝘀`,
            m
        )
    }

    // 🎰 Estrazione simboli
    let r1 = fruits[Math.floor(Math.random() * fruits.length)]
    let r2 = fruits[Math.floor(Math.random() * fruits.length)]
    let r3 = fruits[Math.floor(Math.random() * fruits.length)]

    let win = (r1 === r2 || r2 === r3 || r1 === r3)

    user.limit = Number(user.limit) || 0
    user.exp = Number(user.exp) || 0
    user.level = Number(user.level) || 1

    let { min: minXP, xp: levelXP } = xpRange(user.level, global.multiplier || 1)
    let currentLevelXP = user.exp - minXP

    // Aggiornamento saldo e XP
    if (win) {
        user.limit += 500
        user.exp += 100
    } else {
        user.limit = Math.max(0, user.limit - 100)
        user.exp = Math.max(0, user.exp - 50)
    }

    cooldowns[m.sender] = Date.now()

    // 🌟 Creazione Canvas
    const canvas = createCanvas(600, 400)
    const ctx = canvas.getContext('2d')

    // Sfondo
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Titolo
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 36px Sans'
    ctx.textAlign = 'center'
    ctx.fillText(' SLOT MACHINE ', canvas.width / 2, 50)

    // Caricamento immagini frutta da Twemoji
    const img1 = await loadImage(fruitURLs[r1])
    const img2 = await loadImage(fruitURLs[r2])
    const img3 = await loadImage(fruitURLs[r3])

    // Disegna frutta
    ctx.drawImage(img1, 100, 120, 100, 100)
    ctx.drawImage(img2, 250, 120, 100, 100)
    ctx.drawImage(img3, 400, 120, 100, 100)

    // Esito
    ctx.font = 'bold 28px Sans'
    ctx.fillStyle = win ? '#00ff00' : '#ff3333'
    ctx.fillText(win ? ' VITTORIA!' : ' SCONFITTA!', canvas.width / 2, 300)

    // Saldo e XP
    ctx.font = '20px Sans'
    ctx.fillStyle = '#fff'
    ctx.fillText(` Euro: ${user.limit}    XP: ${user.exp}`, canvas.width / 2, 340)
    ctx.fillText(` Livello ${user.level}   Progresso: ${currentLevelXP}/${levelXP} XP`, canvas.width / 2, 370)

    // Invio immagine su WhatsApp
    await new Promise(r => setTimeout(r, 1500))
    await conn.sendMessage(
        m.chat,
        { image: canvas.toBuffer(), caption: '🎰 Slot Machine' },
        { quoted: m }
    )
}

handler.help = ['slot',];
handler.tags = ['giochi'];
handler.command = /^(slot)$/i;
handler.group = true;
handler.botAdmin = false;
handler.fail = null;
export default handler;

function xpRange(level, multiplier = 1) {
    if (level < 0) level = 0
    let min = level === 0 ? 0 : Math.pow(level, 2) * 20
    let max = Math.pow(level + 1, 2) * 20
    let xp = Math.floor((max - min) * multiplier)
    return { min, xp, max }
}