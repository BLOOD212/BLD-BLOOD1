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
    isListening: false
};

let handler = async (m, { conn, text }) => {
    if (m.isGroup) return;

    global.tgVoip.conn = conn;
    global.tgVoip.chatId = m.chat;

    try {
        if (!global.tgVoip.client || !global.tgVoip.client.connected) {
            global.tgVoip.client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, {
                connectionRetries: 5,
            });
            await global.tgVoip.client.connect();
        }

        if (!global.tgVoip.isListening) {
            global.tgVoip.client.addEventHandler(async (event) => {
                const message = event.message;
                if (!message) return;

                let testata = "🤖 *RISPOSTA DA TELEGRAM*\n\n";
                let corpo = message.message || "";
                
                // --- RECUPERO BOTTONI ---
                let pulsantiTesto = "";
                if (message.replyMarkup && message.replyMarkup.rows) {
                    pulsantiTesto = "\n\n🔘 *OPZIONI DISPONIBILI:*\n";
                    for (const row of message.replyMarkup.rows) {
                        for (const button of row.buttons) {
                            // Estraiamo il testo di ogni pulsante
                            pulsantiTesto += `• ${button.text}\n`;
                        }
                    }
                }

                if (global.tgVoip.conn && global.tgVoip.chatId) {
                    await global.tgVoip.conn.sendMessage(global.tgVoip.chatId, { 
                        text: testata + corpo + pulsantiTesto 
                    });
                }
            }, new NewMessage({ incoming: true }));
            global.tgVoip.isListening = true;
        }

        const toSend = text ? text : "/start";
        await global.tgVoip.client.sendMessage(targetBotUsername, { message: toSend });
        await m.react('📡');

    } catch (e) {
        console.error(e);
        m.reply("❌ Errore connessione.");
    }
}

handler.before = async (m) => {
    if (m.isGroup || !m.text || m.text.startsWith('.') || !global.tgVoip.client) return;
    if (m.chat === global.tgVoip.chatId) {
        try {
            // Inviamo il testo scritto su WhatsApp direttamente al bot
            await global.tgVoip.client.sendMessage(targetBotUsername, { message: m.text });
            await m.react('📤');
        } catch (e) {
            console.error(e);
        }
    }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
