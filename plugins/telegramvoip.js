import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import input from 'input'

// --- CONFIGURAZIONE ---
const apiId = 2040; 
const apiHash = 'b18441a1ff607e10a989891a5462e627'; 
const targetBot = 'Number_Nest_Bot'; 
const numeroTelefono = '+573215575562';
let sessionSaved = ""; // Incolla qui la tua stringa dopo il primo login

let client = null;

let handler = async (m, { conn, text, command }) => {
  if (m.isGroup) return m.reply('❌ Solo in Chat Privata.')

  try {
    // 1. Inizializzazione Client
    if (!client || !client.connected) {
      client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, { connectionRetries: 5 });
      await client.start({
        phoneNumber: async () => numeroTelefono,
        password: async () => await input.text("2FA Password: "),
        phoneCode: async () => await input.text("Codice Telegram: "),
        onError: (err) => console.log(err),
      });
      console.log("✅ SESSION_STRING:", client.session.save());

      // --- ASCOLTATORE EVENTI TELEGRAM ---
      client.addEventHandler(async (event) => {
        if (event && event.message) {
          const msg = event.message;
          const sender = await msg.getSender();
          if (sender && sender.username === targetBot) {
            
            let extraInfo = "";
            let buttons = [];

            // Estrazione Bottoni da Telegram (se presenti)
            if (msg.replyMarkup && msg.replyMarkup.rows) {
              msg.replyMarkup.rows.forEach(row => {
                row.buttons.forEach(btn => {
                  buttons.push({
                    buttonId: `tgbtn ${btn.text}`, // Prefisso per riconoscerlo
                    buttonText: { displayText: btn.text },
                    type: 1
                  });
                  extraInfo += `\n🔘 [${btn.text}]`;
                });
              });
            }

            const cleanText = `🤖 *DA @${targetBot}*\n\n${msg.text || "[Media]"}${extraInfo}`;

            // Invio su WhatsApp (Se la tua versione supporta i bottoni, altrimenti manda testo)
            if (buttons.length > 0) {
              await conn.sendMessage(m.chat, {
                text: cleanText,
                buttons: buttons,
                headerType: 1,
                viewOnce: true
              });
            } else {
              await conn.sendMessage(m.chat, { text: cleanText });
            }
          }
        }
      });
    }

    // 2. LOGICA DI INVIO DA WHATSAPP A TELEGRAM
    // Se il comando è .voip senza testo, manda /start
    // Se scrivi qualcosa dopo .voip, lo manda al bot
    let messaggioDaInviare = text ? text : "/start";
    
    await client.sendMessage(targetBot, { message: messaggioDaInviare });
    await m.react('📤')

  } catch (e) {
    console.error(e)
    m.reply(`❌ Errore: ${e.message}`)
  }
}

// --- GESTORE RISPOSTE (Per far funzionare i bottoni cliccati) ---
handler.before = async (m, { conn }) => {
  if (!m.text || !client || !client.connected) return;
  
  // Se l'utente clicca un bottone generato sopra o risponde in chat
  if (m.quoted && m.quoted.text && m.quoted.text.includes(`@${targetBot}`)) {
    await client.sendMessage(targetBot, { message: m.text });
    await m.react('📨');
  }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
