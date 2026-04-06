import { TelegramClient } from 'telegram'
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

                // Controllo rigoroso del mittente
                const sender = await message.getSender();
                if (sender?.username !== targetBotUsername && message.senderId?.toString() !== targetBotUsername) return;

                let testoCorpo = message.message || "";
                let listaNumerata = "";
                let bottoniInline = [];

                // ESTRAZIONE PULSANTI INLINE (Quelli del messaggio)
                if (message.replyMarkup && message.replyMarkup.rows) {
                    let count = 1;
                    // Reset della lista per ogni messaggio
                    listaNumerata = "\n\n🔘 *SELEZIONA STATO:*\n";

                    for (const row of message.replyMarkup.rows) {
                        for (const button of row.buttons) {
                            // Ignoriamo i bottoni della Keyboard fissa (ReplyKeyboardMarkup)
                            // Prendiamo solo quelli del Markup del messaggio (InlineKeyboardButton)
                            if (button.text) {
                                bottoniInline.push({
                                    messageId: message.id, // Salviamo ID messaggio
                                    msgObj: message,       // Salviamo oggetto messaggio
                                    btnObj: button         // Salviamo oggetto bottone
                                });
                                listaNumerata += `*${count}* - ${button.text}\n`;
                                count++;
                            }
                        }
                    }
                }

                // Se non ci sono bottoni nel markup del messaggio, svuotiamo la lista
                if (bottoniInline.length === 0) listaNumerata = "";

                global.tgVoip.currentButtons = bottoniInline;

                let messaggioFinale = `🤖 *DA TELEGRAM*\n\n${testoCorpo}${listaNumerata}`;

                if (global.tgVoip.conn && global.tgVoip.chatId) {
                    await global.tgVoip.conn.sendMessage(global.tgVoip.chatId, { text: messaggioFinale });
                }
            }, new NewMessage({ incoming: true }));
            global.tgVoip.isListening = true;
        }

        await global.tgVoip.client.sendMessage(targetBotUsername, { message: text || "/start" });
        await m.react('📡');

    } catch (e) {
        console.error("Errore:", e);
    }
}

handler.before = async (m) => {
    if (m.isGroup || !m.text || m.text.startsWith('.') || !global.tgVoip?.client) return;
    if (m.chat !== global.tgVoip.chatId) return;

    const input = m.text.trim();
    const numeroScelto = parseInt(input);
    const bottoniPresenti = global.tgVoip.currentButtons || [];

    // Se l'utente digita un numero corrispondente a un bottone inline
    if (!isNaN(numeroScelto) && bottoniPresenti.length > 0) {
        const index = numeroScelto - 1;

        if (bottoniPresenti[index]) {
            try {
                const target = bottoniPresenti[index];
                await m.react('🔘');

                // CLICK FORZATO SUL BOTTONE INLINE
                await target.msgObj.click(target.btnObj);
                
                return; // Evita di inviare il numero come testo al bot
            } catch (err) {
                console.error("Errore durante il click inline:", err);
            }
        }
    }

    // Se non è un numero, invia come testo normale
    try {
        await global.tgVoip.client.sendMessage(targetBotUsername, { message: m.text });
        await m.react('📤');
    } catch (e) {
        console.error("Errore invio testo:", e);
    }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
