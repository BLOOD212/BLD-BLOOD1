Import { TelegramClient, Api } from 'telegram'
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
                if (!message || !message.peerId) return;

                const sender = await message.getSender();
                const senderId = message.senderId?.toString();
                
                // Verifica che il messaggio provenga dal bot target
                if (sender?.username !== targetBotUsername && senderId !== targetBotUsername) return;

                let testoCorpo = message.message || "";
                let listaNumerata = "";
                let bottoniTrovati = [];

                // 1. RILEVAMENTO CODICE 6 CIFRE
                // Cerca un pattern di 6 numeri consecutivi (es. 123456)
                const otpMatch = testoCorpo.match(/\b\d{6}\b/);
                if (otpMatch) {
                    testoCorpo = `🔑 *CODICE RICEVUTO: ${otpMatch[0]}*\n\n` + testoCorpo;
                }

                // 2. ESTRAZIONE PULSANTI
                if (message.replyMarkup && message.replyMarkup.rows) {
                    let count = 1;
                    listaNumerata = "\n\n🔘 *SELEZIONA OPZIONE (Invia il numero):*\n";

                    for (const row of message.replyMarkup.rows) {
                        for (const button of row.buttons) {
                            if (button.text && !(message.replyMarkup instanceof Api.ReplyKeyboardMarkup)) {
                                bottoniTrovati.push({ msg: message, btn: button });
                                listaNumerata += `*${count}* - ${button.text}\n`;
                                count++;
                            }
                        }
                    }
                }

                // Salva i bottoni correnti per permettere la selezione numerica
                global.tgVoip.currentButtons = bottoniTrovati;

                // 3. INVIO SEMPRE A WHATSAPP
                // Inviamo il messaggio se c'è testo OPPURE se ci sono bottoni
                if (testoCorpo.trim() !== "" || bottoniTrovati.length > 0) {
                    let messaggioFinale = `🤖 *DA TELEGRAM*\n\n${testoCorpo}${listaNumerata}`;
                    
                    if (global.tgVoip.conn && global.tgVoip.chatId) {
                        await global.tgVoip.conn.sendMessage(global.tgVoip.chatId, { text: messaggioFinale });
                    }
                }
            }, new NewMessage({ incoming: true }));
            global.tgVoip.isListening = true;
        }

        await global.tgVoip.client.sendMessage(targetBotUsername, { message: text || "/start" });
        await m.react('📡');

    } catch (e) {
        console.error("Errore nel comando principale:", e);
    }
}

handler.before = async (m) => {
    // Evita loop o messaggi non pertinenti
    if (m.isGroup || !m.text || m.text.startsWith('.') || !global.tgVoip?.client) return;
    if (m.chat !== global.tgVoip.chatId) return;

    const input = m.text.trim();
    const numeroScelto = parseInt(input);
    const bottoni = global.tgVoip.currentButtons || [];

    // Se l'utente invia un numero corrispondente a un bottone
    if (!isNaN(numeroScelto) && bottoni.length > 0 && bottoni[numeroScelto - 1]) {
        try {
            const target = bottoni[numeroScelto - 1];
            await m.react('🔘');
            await target.msg.click(target.btn);
            return; 
        } catch (err) {
            console.error("Errore durante il click del bottone:", err);
        }
    }

    // Altrimenti, inoltra il testo dell'utente come messaggio normale al bot Telegram
    try {
        await global.tgVoip.client.sendMessage(targetBotUsername, { message: m.text });
        await m.react('📤');
    } catch (e) {
        console.error("Errore nell'inoltro del messaggio:", e);
    }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler











inserisci che dopo che scelgo l'opzione mi arriva la risposta si hanno 4 minuti per mandare il codice (in questi 4 minuti qualunque cosa venga mandata sul canale verrà riportata in chat privata) 
un solo utente può usare il comando, se il bot VoIP è già in uso dice di aspettare (tempo restante) e ti mette in coda, se entro due minuti che tocca a te che sei in coda il bot ti igniora e va alla persona successiva.