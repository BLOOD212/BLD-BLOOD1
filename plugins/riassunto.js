import { GoogleGenerativeAI } from "@google/generative-ai";

// Prendi la tua chiave gratis qui: https://aistudio.google.com/
const GEN_AI_KEY = "IL_TUO_API_KEY_QUI";
const genAI = new GoogleGenerativeAI(GEN_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let handler = async (m, { conn, store, participants }) => {
    const chatId = m.chat;
    // Recupera il numero dell'owner dal file global.js (formato BloodBot)
    const ownerNumber = global.owner[0][0] + '@s.whatsapp.net';

    if (!store || !store.messages[chatId]) {
        throw "*❌ Errore:* Non riesco a leggere la cronologia. Assicurati che lo store sia attivo.";
    }

    // Analizziamo gli ultimi 100 messaggi per un report completo
    let msgs = store.messages[chatId].array.slice(-100); 
    
    let stats = {
        totalMsgs: msgs.length,
        tags: 0,
        ownerTags: 0,
        links: 0,
        removedCount: 0,
        mediaCount: 0
    };

    let chatText = [];

    for (let msg of msgs) {
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        const mType = Object.keys(msg.message || {})[0];

        // 1. Conteggio Link
        if (/https?:\/\/[^\s]+/.test(text)) stats.links++;

        // 2. Conteggio Tag e Tag all'Owner
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            let mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid;
            stats.tags += mentioned.length;
            if (mentioned.includes(ownerNumber)) stats.ownerTags++;
        }

        // 3. Conteggio Media (Foto, Video, Sticker, Audio)
        if (['imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage'].includes(mType)) {
            stats.mediaCount++;
        }

        // 4. Conteggio Utenti Rimossi (StubType 28 = Kick, 32 = Uscita/Kick)
        if (msg.messageStubType === 28 || msg.messageStubType === 32) {
            stats.removedCount++;
        }

        // Preparazione testo per l'IA
        if (text) {
            let name = msg.pushName || 'Utente';
            chatText.push(`${name}: ${text}`);
        }
    }

    await conn.reply(chatId, `🩸 *BloodBot sta analizzando i dati...*`, m);

    try {
        const prompt = `Sei l'intelligenza di BloodBot. Riassumi brevemente l'atmosfera e i discorsi di questa chat in poche righe d'impatto e un po' "dark":\n\n${chatText.join('\n')}`;
        
        const result = await model.generateContent(prompt);
        const aiSummary = result.response.text();

        // Template del Report Finale
        let report = `📊 *REPORT ATTIVITÀ BLOODBOT*\n`;
        report += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        report += `📝 *Sintesi IA:*\n${aiSummary}\n\n`;
        report += `📈 *Dati Tecnici (Ultimi 100 messaggi):*\n`;
        report += `┌  💬 Messaggi totali: ${stats.totalMsgs}\n`;
        report += `│  🔗 Link rilevati: ${stats.links}\n`;
        report += `│  🖼️ File Multimediali: ${stats.mediaCount}\n`;
        report += `│  🏷️ Tag totali: ${stats.tags}\n`;
        report += `│  👑 Tag all'Owner: ${stats.ownerTags}\n`;
        report += `└  🚫 Utenti eliminati: ${stats.removedCount}\n\n`;
        report += `🩸 _BloodBot Power - Monitoraggio Attivo_`;

        await conn.reply(chatId, report, m);

    } catch (e) {
        console.error(e);
        throw `*❌ Errore:* L'IA non risponde. Controlla la tua API Key gratuita.`;
    }
};

handler.help = ['riassunto'];
handler.tags = ['ai', 'info'];
handler.command = /^(riassunto|recap)$/i;
handler.group = true;
handler.register = true;

export default handler;
