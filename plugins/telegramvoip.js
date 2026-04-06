import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { NewMessage } from 'telegram/events/index.js'

// --- CONFIGURAZIONE ---
const apiId = 2040;
const apiHash = 'b18441a1ff607e10a989891a5462e627';
const targetBotUsername = "Number_Nest_Bot";
const sessionSaved = "1BAAOMTQ5LjE1NC4xNjcuOTEAUB9OQLQkNqxtxPwutWa2/cpTA8jxTWL1WgZojzgQL+RSVbiUMnVC71ydpMfscNdF5bCR9ijjwkkb3SD5/LRFNC+KGpPiJBDNr48MAT1TQZI9WA/Ld/RhjKu2/jThMk5pnJ3pSzDF3eWaD3KOjVqPNRQ5diSpO55KVHvkWp10albKXG1yXFOSOrcT7i8tg+hRNqfIWp334sXiYt6o+WP+JuSQXeheXMRvPIo17H/vVIbQN66hVsxOa/SKQgzzhQD9fXNeOIoSO6owjtJsmbwH1r9b/OB+hZ3J7Xd9o4gjv9clALS2SyB+A/Vs2/V4j/I/oKAFUpS7DbwoVD1oJ5Xh90A";

global.tgVoip = global.tgVoip || {
    client: null,
    conn: null,
    chatId: null,
    isListening: false,
    currentButtons: [] 
};

let handler = async (m, { conn, text }) => {
    if (m.isGroup) return;
    global.tgVoip.conn = conn;
    global.tgVoip.chatId = m.chat;

    try {
        if (!global.tgVoip.client || !global.tgVoip.client.connected) {
            global.tgVoip.client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, { connectionRetries: 5 });
            await global.tgVoip.client.connect();
        }

        if (!global.tgVoip.isListening) {
            global.tgVoip.client.addEventHandler(async (event) => {
                const message = event.message;
                if (!message) return;

                const sender = await message.getSender();
                const senderId = message.senderId?.toString();
                
                // Filtro: solo messaggi dal bot target
                if (sender?.username !== targetBotUsername && senderId !== targetBotUsername) return;

                let testoCorpo = message.message || "";
                let bottoniTrovati = [];
                let listaNumerata = "";

                // --- 1. RILEVAMENTO CODICI (OTP) ---
                // Cerca 6 cifre isolate (es: 123456)
                const otpMatch = testoCorpo.match(/\b\d{6}\b/);
                if (otpMatch) {
                    testoCorpo = `📩 *CODICE RICEVUTO:* \`${otpMatch[0]}\`\n\n` + testoCorpo;
                }

                // --- 2. GESTIONE PULSANTI (ReplyMarkup) ---
                if (message.replyMarkup) {
                    let count = 1;
                    const rows = message.replyMarkup.rows || [];
                    
                    for (const row of rows) {
                        for (const button of row.buttons) {
                            if (button.text) {
                                bottoniTrovati.push({ msg: message, btn: button });
                                // Creiamo la lista per WhatsApp
                                listaNumerata += `\n*${count}* - ${button.text}`;
                                count++;
                            }
                        }
                    }
                }

                global.tgVoip.currentButtons = bottoniTrovati;

                // --- 3. INVIO RISPOSTA A WHATSAPP ---
                let messaggioDaInviare = `🤖 *TG:* ${testoCorpo}`;
                if (listaNumerata) {
                    messaggioDaInviare += `\n\n🔘 *MENU:*${listaNumerata}`;
                }

                if (global.tgVoip.conn && global.tgVoip.chatId) {
                    await global.tgVoip.conn.sendMessage(global.tgVoip.chatId, { text: messaggioDaInviare });
                }

            }, new NewMessage({ incoming: true }));
            global.tgVoip.isListening = true;
        }

        // Comando iniziale
        await global.tgVoip.client.sendMessage(targetBotUsername, { message: text || "/start" });
        await m.react('📡');

    } catch (e) {
        console.error("Errore TG:", e);
    }
}

handler.before = async (m) => {
    if (m.isGroup || !m.text || m.text.startsWith('.') || !global.tgVoip?.client) return;
    if (m.chat !== global.tgVoip.chatId) return;

    const input = m.text.trim();
    const numeroScelto = parseInt(input);
    const bottoni = global.tgVoip.currentButtons || [];

    // Se l'utente risponde con un numero dei pulsanti
    if (!isNaN(numeroScelto) && bottoni.length > 0 && bottoni[numeroScelto - 1]) {
        try {
            const target = bottoni[numeroScelto - 1];
            await m.react('🔘');
            
            // Notifica su WhatsApp cosa stiamo cliccando
            await global.tgVoip.conn.sendMessage(m.chat, { text: `⏳ Clicco: ${target.btn.text}...` });
            
            // Esegue il click reale sul bot Telegram
            await target.msg.click(target.btn);
            return;
        } catch (err) {
            console.error("Errore Click:", err);
        }
    }

    // Inoltro testo normale
    try {
        await global.tgVoip.client.sendMessage(targetBotUsername, { message: m.text });
        await m.react('📤');
    } catch (e) {
        console.error(e);
    }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
