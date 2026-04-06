import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import input from 'input'

// --- CONFIGURAZIONE UNIVERSALE (Telegram Desktop) ---
const apiId = 2040; 
const apiHash = 'b18441a1ff607e10a989891a5462e627'; 
const targetBot = 'Number_Nest_Bot'; 
const numeroTelefono = '+573215575562';

// --- SESSIONE SALVATA ---
// Incolla qui la stringa lunga dopo il primo login riuscito per non ripetere il login
const sessionSaved = ""; 

let client = null;

let handler = async (m, { conn }) => {
  // Blocco per soli messaggi privati
  if (m.isGroup) return m.reply('❌ Questo comando funziona solo in *Chat Privata*.')

  // Evita doppie connessioni
  if (client) return m.reply('📡 Il ponte VOIP è già attivo e in ascolto.')

  try {
    await m.react('⏳')
    
    // Inizializzazione Client
    client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, {
      connectionRetries: 5,
    });

    // Avvio della sessione
    await client.start({
      phoneNumber: async () => numeroTelefono,
      password: async () => await input.text("Inserisci Password 2FA (se attiva): "),
      phoneCode: async () => await input.text("Inserisci il codice ricevuto su Telegram: "),
      onError: (err) => console.log(err),
    });

    // Una volta loggato, invia /start al bot target
    await client.sendMessage(targetBot, { message: '/start' });

    // Messaggio di log per salvare la sessione
    console.log("✅ LOGIN TELEGRAM RIUSCITO!");
    console.log("---------------------------------------------------------");
    console.log("COPIA QUESTA STRINGA NELLA VARIABILE 'sessionSaved':");
    console.log(client.session.save());
    console.log("---------------------------------------------------------");

    await m.react('📡')
    await conn.sendMessage(m.chat, {
      text: `✅ *VOIP BRIDGE ATTIVATO*\n\nAccount: \`${numeroTelefono}\` \nHo inviato \`/start\` a *@${targetBot}*.\n\nI messaggi del bot verranno riportati qui in tempo reale.`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "✧ 𝙱𝙻𝙳-𝙱𝙾𝚃 𝚅𝙾𝙸𝙿 𝚁𝙴𝙻𝙰𝚈 ✧"
        }
      }
    }, { quoted: m })

    // --- LOGICA DI ASCOLTO (RELAY) ---
    client.addEventHandler(async (event) => {
      const message = event.message;
      
      try {
        const sender = await message.getSender();
        
        // Se il messaggio arriva dal bot specifico
        if (sender && sender.username === targetBot) {
          let contenuto = message.message || " [Contenuto Multimediale] ";

          // Invia il messaggio alla tua chat privata di WhatsApp
          await conn.sendMessage(m.chat, {
            text: `🤖 *MESSAGGIO DA @${targetBot}*\n\n${contenuto}`,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363232743845068@newsletter',
                newsletterName: "✧ 𝙱𝙻𝙳-𝙱𝙾𝚃 𝚅𝙾𝙸𝙿 𝚁𝙴𝙻𝙰𝚈 ✧"
              }
            }
          })
        }
      } catch (err) {
        console.error("Errore durante il relay:", err)
      }
    });

  } catch (e) {
    client = null;
    console.error(e)
    m.reply(`❌ *ERRORE:* ${e.message}\nControlla il terminale per inserire il codice correttamente.`)
  }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
