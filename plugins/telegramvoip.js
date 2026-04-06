import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { NewMessage } from 'telegram/events/index.js'

// --- CONFIGURAZIONE FISSA ---
const apiId = 2040; 
const apiHash = 'b18441a1ff607e10a989891a5462e627'; 
const targetBot = 'Number_Nest_Bot'; 
const numeroTelefono = '+573215575562';

// --- TUA SESSIONE SALVATA (NON TOCCARE) ---
const sessionSaved = "1BAAOMTQ5LjE1NC4xNjcuOTEAUB9OQLQkNqxtxPwutWa2/cpTA8jxTWL1WgZojzgQL+RSVbiUMnVC71ydpMfscNdF5bCR9ijjwkkb3SD5/LRFNC+KGpPiJBDNr48MAT1TQZI9WA/Ld/RhjKu2/jThMk5pnJ3pSzDF3eWaD3KOjVqPNRQ5diSpO55KVHvkWp10albKXG1yXFOSOrcT7i8tg+hRNqfIWp334sXiYt6o+WP+JuSQXeheXMRvPIo17H/vVIbQN66hVsxOa/SKQgzzhQD9fXNeOIoSO6owjtJsmbwH1r9b/OB+hZ3J7Xd9o4gjv9clALS2SyB+A/Vs2/V4j/I/oKAFUpS7DbwoVD1oJ5Xh90A"; 

let client = null;

let handler = async (m, { conn, text }) => {
  if (m.isGroup) return; // Evitiamo spam nei gruppi

  try {
    // 1. Inizializzazione Client (se non già attivo)
    if (!client || !client.connected) {
      client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, {
        connectionRetries: 5,
      });

      await client.connect();
      console.log("✅ PONTE TELEGRAM CONNESSO CON SESSION_STRING");

      // 2. ASCOLTATORE EVENTI (Relay da Telegram a WhatsApp)
      client.addEventHandler(async (event) => {
        if (event && event.message) {
          const msg = event.message;
          try {
            const sender = await msg.getSender();
            // Verifichiamo se il messaggio viene dal bot VOIP
            if (sender && (sender.username === targetBot || sender.id?.toString().includes("5916"))) {
              
              await conn.sendMessage(m.chat, {
                text: `🤖 *RISPOSTA DA @${targetBot}*\n\n${msg.text || "[Media/File]"}`,
                contextInfo: {
                  forwardingScore: 999,
                  isForwarded: true,
                  externalAdReply: {
                    title: "✧ VOIP RELAY ATTIVO ✧",
                    body: "Messaggio ricevuto da Telegram",
                    thumbnailUrl: "https://telegra.ph/file/0c326071415053272d76c.jpg",
                    sourceUrl: "https://t.me/" + targetBot
                  }
                }
              });
            }
          } catch (e) { console.error("Errore Relay:", e) }
        }
      }, new NewMessage({}));
    }

    // 3. INVIO COMANDO (da WhatsApp a Telegram)
    // Se scrivi ".voip" invia /start, se scrivi ".voip 123" invia "123"
    let commandToSend = text ? text : "/start";
    await client.sendMessage(targetBot, { message: commandToSend });
    await m.react('📤');

  } catch (e) {
    console.error(e);
    m.reply(`❌ Errore Connessione: ${e.message}`);
  }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
