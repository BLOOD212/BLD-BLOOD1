import { promises } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'
import moment from 'moment-timezone'

const emojicategoria = {
  info: 'ℹ️',
  main: '💠',
  sicurezza: '🛡️'
}

let tags = {
  'main': '╭ *`SYSTEM MAIN`* ╯',
  'sicurezza': '╭ *`SECURITY SYSTEM`* ╯',
  'info': '╭ *`DATABASE INFO`* ╯'
}

const defaultMenu = {
  before: `
┏━━━━━━━━━━━━━━━━━━━━┓
   💠  *B L D  -  B O T* 💠
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 👤 *User:* %name
 │ 🕒 *Uptime:* %uptime
 │ 👥 *Total Users:* %totalreg
 └───────────────────
 
 *Seleziona un modulo operativo:*
`.trimStart(),
  header: '      ⋆｡˚『 %category 』˚｡⋆\n╭',
  body: '*│ ➢* 『%emoji』 %cmd',
  footer: '*╰━━━━━━━──────━━━━━━━*\n',
  after: `_Powered by BLD-BOT Interface_`,
}

const MENU_IMAGE_URL = 'https://i.ibb.co/hJW7WwxV/varebot.jpg';

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    let name = await conn.getName(m.sender) || 'User';
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);
    let totalreg = Object.keys(global.db.data.users).length;

    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
      };
    });

    let menuTags = Object.keys(tags);
    let _text = [
      defaultMenu.before,
      ...menuTags.map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help[0]).map(menu => {
            return menu.help.map(help => {
              return defaultMenu.body
                .replace(/%cmd/g, menu.prefix ? help : _p + help)
                .replace(/%emoji/g, emojicategoria[tag] || '🔹')
                .trim();
            }).join('\n');
          }),
          defaultMenu.footer
        ].join('\n');
      }),
      defaultMenu.after
    ].join('\n');

    let replace = { '%': '%', p: _p, uptime, name, totalreg };
    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name]);

    // PREPARAZIONE DEI BOTTONI NATIVI (FUNZIONANO SU TUTTI)
    const buttons = [
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({
          title: "📂 SELEZIONA MENU",
          sections: [
            {
              title: "⭐ MODULI PRINCIPALI",
              rows: [
                { title: "🛡️ SICUREZZA", id: _p + "attiva", description: "Protezione e Antilink" },
                { title: "🎮 GIOCHI", id: _p + "menugiochi", description: "Divertimento e Livelli" },
                { title: "🤖 IA", id: _p + "menuia", description: "Intelligenza Artificiale" },
                { title: "👥 GRUPPO", id: _p + "menugruppo", description: "Gestione Membri" }
              ]
            },
            {
              title: "🛠️ UTILITY & ALTRO",
              rows: [
                { title: "📥 DOWNLOAD", id: _p + "menudownload", description: "Scarica Media" },
                { title: "🛠️ STRUMENTI", id: _p + "menustrumenti", description: "Utility Varie" },
                { title: "⭐ PREMIUM", id: _p + "menupremium", description: "Funzioni Pro" },
                { title: "👨‍💻 CREATORE", id: _p + "menucreatore", description: "Comandi Owner" }
              ]
            }
          ]
        })
      }
    ];

    // COSTRUZIONE MESSAGGIO INTERATTIVO
    await conn.sendMessage(m.chat, {
      image: { url: MENU_IMAGE_URL },
      caption: text.trim(),
      footer: "B L D - B O T  S Y S T E M",
      buttons: buttons,
      headerType: 4
    }, { quoted: m });

    await m.react('💠');

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, "Errore tecnico nell'invio dei bottoni.", m);
  }
};

handler.help = ['menu'];
handler.command = ['menu', 'help'];
export default handler;

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
