import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';

const DEFAULT_AVATAR_URL = 'https://i.ibb.co/jH0VpAv/default-avatar-profile-icon-of-social-media-user-vector.jpg';

// Helper per testo neon
function drawNeonText(ctx, text, x, y, fontSize, color, align = 'center') {
    ctx.save();
    ctx.font = `bold ${fontSize}px Impact, sans-serif`;
    ctx.textAlign = align;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeText(text, x, y);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, x, y);
    ctx.restore();
}

// Sfondo Cyberpunk
function generateCyberBackground(ctx, width, height, colors) {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0a0c');
    bgGrad.addColorStop(1, colors[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = `${colors[0]}22`;
    ctx.lineWidth = 2;
    for (let i = 0; i < width; i += 60) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
}

// DISEGNO DINAMICO DEL MEMBRO (Spostato per spazio a lato)
function drawMembro(ctx, x, y, size) {
    const baseSize = 55;
    const length = Math.max(40, size * 14); 
    
    ctx.save();
    ctx.translate(x, y);
    
    // Palle
    ctx.fillStyle = '#FFB6C1';
    ctx.shadowColor = 'rgba(255, 105, 180, 0.4)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-baseSize / 1.5, 0, baseSize, 0, Math.PI * 2);
    ctx.arc(baseSize / 1.5, 0, baseSize, 0, Math.PI * 2);
    ctx.fill();

    // Asta
    ctx.fillRect(-baseSize / 1.2, -length, baseSize * 1.6, length);

    // Cappella
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(0, -length, baseSize * 1.1, Math.PI, 0);
    ctx.fill();
    
    ctx.restore();
}

async function generateMeterImage({ title, percentage, avatarUrl, description, themeColors, isCazzo }) {
    const width = 1080;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    generateCyberBackground(ctx, width, height, themeColors);
    const avatar = await loadImage(avatarUrl).catch(() => loadImage(DEFAULT_AVATAR_URL));

    // Pannello principale
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.roundRect(50, 50, width - 100, height - 100, 60);
    ctx.fill();
    ctx.restore();

    drawNeonText(ctx, title, width / 2, 160, 130, themeColors[0]);

    // Avatar ridimensionato
    const avatarSize = 280;
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, 380, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, width / 2 - avatarSize / 2, 380 - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();

    if (isCazzo) {
        // RENDERING: Membro a sinistra, Numero a destra
        const drawX = width / 2 - 120; // Spostiamo l'asset a sinistra
        const drawY = 880;
        drawMembro(ctx, drawX, drawY, percentage); 
        
        // Numero accanto (allineato all'asta)
        drawNeonText(ctx, `${percentage}`, drawX + 220, drawY - (percentage * 7), 160, themeColors[0], 'left');
        drawNeonText(ctx, `CM`, drawX + 220, drawY - (percentage * 7) + 80, 60, themeColors[0], 'left');
    } else {
        // Progress Bar standard per gli altri
        const barW = 800;
        const barX = (width - barW) / 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.roundRect(barX, 750, barW, 60, 30); ctx.fill();
        
        const pWidth = (barW * percentage) / 100;
        ctx.fillStyle = themeColors[0];
        ctx.roundRect(barX, 750, pWidth, 60, 30); ctx.fill();
        
        drawNeonText(ctx, `${percentage}%`, width / 2, 920, 110, themeColors[0]);
    }

    // Descrizione in basso
    ctx.font = 'italic 42px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(description, width / 2, 1020);

    return canvas.toBuffer('image/jpeg');
}

const commandConfig = {
    gaymetro: { title: 'GAY-SCAN', themeColors: ['#FF00FF', '#4a004a'], getDescription: p => p > 70 ? "Livelli di glitter fuori scala!" : "Scansione neutra." },
    lesbiometro: { title: 'LESBO-SCAN', themeColors: ['#FF1493', '#4B0082'], getDescription: p => "Sistema di rilevamento attivo." },
    masturbometro: { title: 'FAP-METER', themeColors: ['#FF4500', '#2F4F4F'], getDescription: p => "Attenzione: rischio surriscaldamento!" },
    fortunometro: { title: 'LUCK-SCAN', themeColors: ['#00FF00', '#004400'], getDescription: p => "Analisi probabilità completata." },
    intelligiometro: { title: 'BRAIN-SCAN', themeColors: ['#00FFFF', '#00008B'], getDescription: p => "QI calcolato con successo." },
    bellometro: { title: 'BEAUTY-CHECK', themeColors: ['#FFD700', '#8B4513'], getDescription: p => "Bellezza rilevata nel database." },
    sottomessometro: { title: 'SUB-SCANNER', themeColors: ['#C0C0C0', '#2C3E50'], getDescription: p => "Ubbidienza: " + (p > 50 ? "Alta" : "Scarsa") },
    cazzo: { title: 'DICK-SIZE', themeColors: ['#FFB6C1', '#C71585'], getDescription: p => p > 22 ? "Una bestia leggendaria!" : p < 12 ? "Piccolo ma coraggioso." : "Standard di sicurezza approvato." }
};

const handler = async (m, { conn, command, text }) => {
    const config = commandConfig[command];
    if (!config) return;

    const targetUser = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
    const targetName = text.trim() || conn.getName(targetUser);

    try {
        await conn.reply(m.chat, `🔍 *Analisi biometrica per ${targetName}...*`, m);
        const avatar = await conn.profilePictureUrl(targetUser, 'image').catch(() => DEFAULT_AVATAR_URL);
        
        const isCazzo = command === 'cazzo';
        const percentage = isCazzo ? Math.floor(Math.random() * 32) + 3 : Math.floor(Math.random() * 101);

        const imageBuffer = await generateMeterImage({
            title: config.title,
            percentage,
            avatarUrl: avatar,
            description: config.getDescription(percentage),
            themeColors: config.themeColors,
            isCazzo
        });

        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: `✅ *Analisi finita per ${targetName}!*`,
            mentions: [targetUser]
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, `❌ Errore sistema.`, m);
    }
};

handler.command = Object.keys(commandConfig);
export default handler;
