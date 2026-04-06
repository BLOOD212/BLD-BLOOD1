import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import input from 'input'

// --- CONFIGURAZIONE ---
const apiId = 2040; 
const apiHash = 'b18441a1ff607e10a989891a5462e627'; 
const targetBot = 'Number_Nest_Bot'; 
const numeroTelefono = '+573215575562';

// SE HAI UNA SESSION_STRING FUNZIONANTE METTILA QUI, ALTRIMENTI LASCIALE VUOTE ""
let sessionSaved = ""; 

let client = null;
let isLoggingIn = false; // Evita il doppio login contemporaneo

let handler = async (m, { conn, text }) => {
  if (m.isGroup) return m.reply('❌ Solo in Chat Privata.')

  try {
    if (isLoggingIn) return m.reply('⏳ Sto già gestendo un tentativo di login. Guarda il terminale.')

    if (!client || !client.connected) {
      isLoggingIn = true;
      client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, {
        connectionRetries: 5,
      });

      await client.start({
        phoneNumber: async () => numeroTelefono,
        password: async () => await input.text("Inserisci Password 2FA (se attiva): "),
        phoneCode: async () => await input.text("Inserisci il codice ricevuto su Telegram: "),
        onError: (err) => console.log("Errore login:", err),
      });

      isLoggingIn = false;
      console.log("✅ LOGIN RIUSCITO!");
      console.log("COPIA QUESTA STRINGA E SALVALA:");
      console.log(client.session.save());

      // GESTORE MESSAGGI IN ARRIVO (RELAY)
      client.addEventHandler(async (event) => {
        if (event && event.message) {
          const msg = event.message;
          try {
            const sender = await msg.getSender();
            const username = sender ? sender.username : null;

            if (username === targetBot) {
              // Estrazione bottoni se presenti
              let buttons = [];
              if (msg.replyMarkup && msg.replyMarkup.rows) {
                msg.replyMarkup.rows.forEach(row => {
                  row.buttons.forEach(btn => {
                    buttons.push({ buttonId: `btn ${btn.text}`, buttonText: { displayText: btn.text }, type: 1 });
                  });
                });
              }

              const relayText = `🤖 *DA @${targetBot}*\n\n${msg.text || "[Media]"}`;
              
              if (buttons.length > 0) {
                await conn.sendMessage(m.chat, { text: relayText, buttons: buttons, headerType: 1 });
              } else {
                await conn.sendMessage(m.chat, { text: relayText });
              }
            }
          } catch (e) { /* Errore silenzioso per messaggi di sistema */ }
        }
      });
    }

    // Invia il messaggio (o /start di default)
    let toSend = text ? text : "/start";
    await client.sendMessage(targetBot, { message: toSend });
    await m.react('📡');

  } catch (e) {
    isLoggingIn = false;
    console.error(e);
    if (e.message.includes('401')) {
      client = null;
      m.reply('❌ Sessione non valida. Riprova tra un minuto.');
    } else {
      m.reply(`❌ Errore: ${e.message}`);
    }
  }
}

handler.before = async (m, { client: tgClient }) => {
    if (!m.quoted || !m.text || !client) return;
    if (m.quoted.text && m.quoted.text.includes(`@${targetBot}`)) {
        await client.sendMessage(targetBot, { message: m.text });
        await m.react('📨');
    }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
