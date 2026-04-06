import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import input from 'input'

const apiId = 2040; 
const apiHash = 'b18441a1ff607e10a989891a5462e627'; 
const targetBot = 'Number_Nest_Bot'; 
const numeroTelefono = '+573215575562';

// FONDAMENTALE: Una volta loggato, incolla qui la stringa lunga che esce in console
let sessionSaved = ""; 

let client = null;

let handler = async (m, { conn }) => {
  if (m.isGroup) return m.reply('❌ Solo in Chat Privata.')

  try {
    if (!client || !client.connected) {
      client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, {
        connectionRetries: 5,
      });

      await client.start({
        phoneNumber: async () => numeroTelefono,
        password: async () => await input.text("Password 2FA: "),
        phoneCode: async () => await input.text("Codice Telegram: "),
        onError: (err) => console.log("Errore login:", err),
      });

      console.log("✅ LOGIN OK! SESSION_STRING:");
      console.log(client.session.save());

      // Ascolto messaggi con sistema di sicurezza
      client.addEventHandler(async (event) => {
        if (event && event.message) {
            const message = event.message;
            try {
                // Recuperiamo il mittente in modo più robusto
                const sender = await message.getSender();
                const username = sender ? sender.username : null;

                if (username === targetBot) {
                    await conn.sendMessage(m.chat, {
                        text: `🤖 *RISPOSTA DA @${targetBot}*\n\n${message.text || '[Media]'}`,
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363232743845068@newsletter',
                                newsletterName: "✧ 𝙱𝙻𝙳-𝙱𝙾𝚃 𝚅𝙾𝙸𝙿 𝚁𝙴𝙻𝙰𝚈 ✧"
                            }
                        }
                    });
                }
            } catch (e) {
                // Silenziamo errori interni di parsing
            }
        }
      });
    }

    // Invia /start
    await client.sendMessage(targetBot, { message: '/start' });
    await m.react('📡')

  } catch (e) {
    console.error(e)
    if (e.message.includes('FLOOD')) {
        m.reply(`⚠️ *TELEGRAM FLOOD:* Troppi tentativi. Devi aspettare ancora qualche minuto prima di riprovare.`)
    } else {
        m.reply(`❌ *ERRORE:* ${e.message}`)
    }
  }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
