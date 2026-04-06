import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { NewMessage } from 'telegram/events/index.js'

// --- CONFIGURAZIONE ---
const apiId = 2040;
const apiHash = 'b18441a1ff607e10a989891a5462e627';
const targetBotUsername = "Number_Nest_Bot";
const sessionSaved = "1BAAOMTQ5LjE1NC4xNjcuOTEAUB9OQLQkNqxtxPwutWa2/cpTA8jxTWL1WgZojzgQL+RSVbiUMnVC71ydpMfscNdF5bCR9ijjwkkb3SD5/LRFNC+KGpPiJBDNr48MAT1TQZI9WA/Ld/RhjKu2/jThMk5pnJ3pSzDF3eWaD3KOjVqPNRQ5diSpO55KVHvkWp10albKXG1yXFOSOrcT7i8tg+hRNqfIWp334sXiYt6o+WP+JuSQXeheXMRvPIo17H/vVIbQN66hVsxOa/SKQgzzhQD9fXNeOIoSO6owjtJsmbwH1r9b/OB+hZ3J7Xd9o4gjv9clALS2SyB+A/Vs2/V4j/I/oKAFUpS7DbwoVD1oJ5Xh90A";

// Inizializzazione globale
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

                // Verifica che il messaggio sia del bot target
                const sender = await message.getSender();
                const senderUser = sender?.username || "";
                if (!senderUser.includes(targetBotUsername) && message.senderId?.toString() !== targetBotUsername) return;

                let testoCorpo = message.message || "";
                let listaNumerata = "";
                let nuoviBottoni = [];

                // CONTROLLO PULSANTI (Inline e Reply)
                const markup = message.replyMarkup;
                if (markup && markup.rows) {
                    let count = 1;
                    listaNumerata = "\n\n🔘 *OPZIONI DISPONIBILI (Scrivi il numero):*\n";

                    for (const row of markup.rows) {
                        for (const button of row.buttons) {
                            if (button.text) {
                                nuoviBottoni.push({
                                    msg: message,
                                    btn: button
                                });
                                listaNumerata += `*${count}* - ${button.text}\n`;
                                count++;
                            }
                        }
                    }
                }

                // Salvataggio dei bottoni nell'oggetto globale
                global.tgVoip.currentButtons = nuoviBottoni;

                // Se non ci sono bottoni, non aggiungere la lista vuota
                let messaggioFinale = `🤖 *DA TELEGRAM:*\n\n${testoCorpo}${listaNumerata}`;

                if (global.tgVoip.conn && global.tgVoip.chatId) {
                    await global.tgVoip.conn.sendMessage(global.tgVoip.chatId, { text: messaggioFinale });
                }
            }, new NewMessage({ incoming: true }));
            global.tgVoip.isListening = true;
        }

        // Invia comando o testo
        await global.tgVoip.client.sendMessage(targetBotUsername, { message: text || "/start" });
        await m.react('📡');

    } catch (e) {
        console.error("Errore sessione:", e);
    }
}

handler.before = async (m) => {
    if (m.isGroup || !m.text || m.text.startsWith('.') || !global.tgVoip?.client) return;
    if (m.chat !== global.tgVoip.chatId) return;

    const input = m.text.trim();
    const numeroScelto = parseInt(input);
    const bottoniDisponibili = global.tgVoip.currentButtons || [];

    // Se l'utente invia un numero e abbiamo bottoni salvati
    if (!isNaN(numeroScelto) && numeroScelto > 0 && bottoniDisponibili.length > 0) {
        const index = numeroScelto - 1;

        if (bottoniDisponibili[index]) {
            try {
                const target = bottoniDisponibili[index];
                await m.react('🔘');
                
                // AZIONE: Clicca il pulsante corrispondente al numero
                await target.msg.click(target.btn);
                return; // Esce per evitare di inviare il numero come testo
            } catch (err) {
                console.error("Errore nel click:", err);
            }
        }
    }

    // Se non è un numero o non ci sono bottoni, invia come testo libero
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
