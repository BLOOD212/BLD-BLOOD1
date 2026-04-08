import fetch from 'node-fetch'
import { createCanvas, loadImage } from 'canvas'

// Funzione per disegnare il cuore (usata in I Love)
function drawHeart(ctx, x, y, width, height) {
    const topCurveHeight = height * 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height);
    ctx.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
}

// Generatore immagine "I LOVE NAME"
async function createILoveImage(name) {
    const width = 1080;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    const fontFace = 'sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const firstLineY = height * 0.35;
    const heartSize = 350;
    ctx.fillStyle = 'black';
    ctx.font = `bold 300px ${fontFace}`;
    const iWidth = ctx.measureText('I').width;
    const iX = width / 2 - iWidth / 2 - heartSize / 1.5;
    ctx.fillText('I', iX, firstLineY);
    const heartX = iX + iWidth + heartSize / 1.5;
    const heartY = firstLineY - heartSize / 2;
    drawHeart(ctx, heartX, heartY, heartSize, heartSize);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.fillStyle = 'black';
    let fontSize = 280;
    ctx.font = `bold ${fontSize}px ${fontFace}`;
    const maxTextWidth = width * 0.9;
    while (ctx.measureText(name.toUpperCase()).width > maxTextWidth && fontSize > 40) {
        fontSize -= 10;
        ctx.font = `bold ${fontSize}px ${fontFace}`;
    }
    ctx.fillText(name.toUpperCase(), width / 2, height * 0.75);
    return canvas.toBuffer('image/jpeg');
}

// Funzione principale per applicare gli effetti (Gay, Trans, Sborra)
const applicaEffetto = async (m, conn, tipoEffetto, usedPrefix, command) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid?.[0] ? m.mentionedJid[0] : m.sender
    
    try {
        let bufferImmagine
        // 1. Gestione Immagine Quotata
        if (m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.mtype === 'viewOnceMessage')) {
            bufferImmagine = await m.quoted.download()
        } 
        // 2. Gestione Foto Profilo
        else {
            let pp = await conn.profilePictureUrl(who, 'image').catch(() => null)
            if (!pp) return m.reply('❌ L\'utente non ha una foto profilo pubblica o l\'immagine non è accessibile.')
            let res = await fetch(pp)
            bufferImmagine = await res.arrayBuffer()
        }

        if (!bufferImmagine) throw new Error('Errore nel recupero dell\'immagine.')

        let nomeUtente = await conn.getName(who)
        let bufferFinale = await applicaEffettiCanvas(bufferImmagine, tipoEffetto)
        
        const messaggi = { 
            gay: [`${nomeUtente} è diventato gay! 🏳️‍🌈`],
            trans: [`${nomeUtente} ha cambiato genere! 🏳️‍⚧️`],
            sborra: [`${nomeUtente} è stato ricoperto di... gloria. 💦`]
        }
        
        let msg = messaggi[tipoEffetto][Math.floor(Math.random() * messaggi[tipoEffetto].length)]
        await conn.sendFile(m.chat, bufferFinale, 'effetto.jpg', `*\`${msg}\`*`, m, false, { mentions: [who] })
        
    } catch (e) {
        console.error(e)
        m.reply('❌ Si è verificato un errore nel processare l\'immagine.')
    }
}

// Rendering Canvas per gli effetti
async function applicaEffettiCanvas(buffer, tipo) {
    let img = await loadImage(Buffer.from(buffer))
    let canvas = createCanvas(img.width, img.height)
    let ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    if (tipo === 'sborra') {
        // Logica specifica per schizzi densi e bianchi
        let num = 15 + Math.floor(Math.random() * 10)
        for (let i = 0; i < num; i++) {
            let x = Math.random() * img.width
            let y = Math.random() * img.height
            let size = (img.width * 0.05) + Math.random() * 30
            disegnaSchizzo(ctx, x, y, size)
        }
    } else {
        // Effetti Pride (Overlay colorato)
        const pride = {
            gay: ['#E40303', '#FF8C00', '#FFED00', '#008563', '#409CFF', '#955ABE'],
            trans: ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA']
        }
        let colors = pride[tipo]
        ctx.globalAlpha = 0.4
        let grad = ctx.createLinearGradient(0, 0, 0, img.height)
        colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c))
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, img.width, img.height)
    }
    return canvas.toBuffer('image/jpeg')
}

// Funzione specifica per l'effetto richiesto (Sborra)
function disegnaSchizzo(ctx, x, y, size) {
    ctx.save()
    ctx.translate(x, y)
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = 'rgba(0,0,0,0.1)'
    ctx.shadowBlur = 5

    // Nucleo principale
    ctx.beginPath()
    ctx.arc(0, 0, size, 0, Math.PI * 2)
    ctx.fill()

    // Micro gocce intorno
    for (let i = 0; i < 5; i++) {
        let ang = Math.random() * Math.PI * 2
        let dist = size * (1.2 + Math.random())
        ctx.beginPath()
        ctx.arc(Math.cos(ang) * dist, Math.sin(ang) * dist, size * 0.3, 0, Math.PI * 2)
        ctx.fill()
    }

    // Colatura lucida
    if (Math.random() > 0.3) {
        ctx.beginPath()
        ctx.rect(-size/2, 0, size, size * 3)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(0, size * 3, size/2, 0, Math.PI * 2)
        ctx.fill()
    }
    ctx.restore()
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const cmd = command.toLowerCase()
    if (cmd === 'il' || cmd === 'ilove') {
        let name = m.mentionedJid?.[0] ? await conn.getName(m.mentionedJid[0]) : text
        if (!name) return m.reply(`Esempio: ${usedPrefix + command} Nome`)
        let buf = await createILoveImage(name)
        await conn.sendFile(m.chat, buf, 'love.jpg', '', m)
    } else {
        await applicaEffetto(m, conn, cmd, usedPrefix, command)
    }
}

handler.command = /^(gay|trans|sborra|il|ilove)$/i
export default handler
