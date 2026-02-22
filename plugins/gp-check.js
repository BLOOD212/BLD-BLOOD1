import { createCanvas, loadImage } from 'canvas'

let handler = async (m, { conn }) => {
    if (!m.quoted) return m.reply('❗ Rispondi a un messaggio per analizzare il dispositivo usato')

    const msgID = m.quoted.id || m.quoted.key?.id
    const senderJid = m.quoted.sender || 'sconosciuto'
    const tagUtente = senderJid.replace(/@.+/, '')

    let device = 'Dispositivo sconosciuto'
    let deviceEmoji = '🕵️‍♂️'

    // Identificazione dispositivo
    if (!msgID) {
        device = '⚠️ Impossibile rilevare il dispositivo'
        deviceEmoji = '⚠️'
    } else if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) {
        device = 'Messaggio da bot'
        deviceEmoji = '🤖'
    } else if (msgID.startsWith('false_') || msgID.startsWith('true_')) {
        device = 'WhatsApp Web'
        deviceEmoji = '💻'
    } else if (
        msgID.startsWith('3EB0') &&
        /^[A-Z0-9]+$/.test(msgID)
    ) {
        device = 'WhatsApp Web o bot'
        deviceEmoji = '💻'
    } else if (msgID.includes(':')) {
        device = 'WhatsApp Desktop'
        deviceEmoji = '🖥️'
    } else if (/^[A-F0-9]{32}$/i.test(msgID)) {
        device = 'Android'
        deviceEmoji = '📱'
    } else if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)
    ) {
        device = 'iOS'
        deviceEmoji = '🍏'
    } else if (
        /^[A-Z0-9]{20,25}$/i.test(msgID) &&
        !msgID.startsWith('3EB0')
    ) {
        device = 'iOS'
        deviceEmoji = '🍏'
    } else if (msgID.startsWith('3EB0')) {
        device = 'Android (vecchio schema)'
        deviceEmoji = '🤖'
    } else {
        console.log('[ANALISI] Nuovo ID non riconosciuto:', msgID)
    }

    // 🌟 Canvas
    const canvas = createCanvas(600, 300)
    const ctx = canvas.getContext('2d')

    // Sfondo
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Titolo
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 32px Sans'
    ctx.textAlign = 'center'
    ctx.fillText('🔍 ANALISI UTENTE 🔍', canvas.width / 2, 50)

    // Caricamento immagine dispositivo da Twemoji
    const deviceImages = {
        '🕵️‍♂️': 'https://twemoji.maxcdn.com/v/latest/72x72/1f575.png',
        '⚠️': 'https://twemoji.maxcdn.com/v/latest/72x72/26a0.png',
        '🤖': 'https://twemoji.maxcdn.com/v/latest/72x72/1f916.png',
        '💻': 'https://twemoji.maxcdn.com/v/latest/72x72/1f4bb.png',
        '🖥️': 'https://twemoji.maxcdn.com/v/latest/72x72/1f5a5.png',
        '📱': 'https://twemoji.maxcdn.com/v/latest/72x72/1f4f1.png',
        '🍏': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34f.png'
    }

    const deviceImg = await loadImage(deviceImages[deviceEmoji] || deviceImages['🕵️‍♂️'])
    ctx.drawImage(deviceImg, 50, 100, 100, 100)

    // Emoji utente
    ctx.font = 'bold 50px Sans'
    ctx.fillText('👤', 450, 150)

    // Testo utente e dispositivo
    ctx.font = '24px Sans'
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'left'
    ctx.fillText(`Utente: @${tagUtente}`, 180, 140)
    ctx.fillText(`Dispositivo: ${device}`, 180, 180)

    // Linea di separazione
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(50, 220)
    ctx.lineTo(550, 220)
    ctx.stroke()

    // Invio immagine su WhatsApp
    await conn.sendMessage(
        m.chat,
        { image: canvas.toBuffer(), caption: '🔍 Analisi completata', mentions: [senderJid] },
        { quoted: m }
    )
}

handler.command = /^(check|device|dispositivo)$/i
handler.group = true
handler.admin = true
handler.botAdmin = false

export default handler