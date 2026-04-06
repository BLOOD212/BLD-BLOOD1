import { promises } from 'fs'
import { join } from 'path'
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
 
 *Pannello di Controllo Interattivo:*
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

    let replace = {
      '%': '%',
      p: _p,
      uptime: uptime,
      name: name,
      totalreg: totalreg,
    };

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name]);

    // --- CONFIGURAZIONE TASTI (Divisi in due blocchi per bypassare il limite di 3) ---
    
    // Blocco 1: Sicurezza e Divertimento
    const buttons1 = [
      { buttonId: _p + 'attiva', buttonText: { displayText: '🛡️ SICUREZZA' }, type: 1 },
      { buttonId: _p + 'menugiochi', buttonText: { displayText: '🎮 GIOCHI' }, type: 1 },
      { buttonId: _p + 'menugruppo', buttonText: { displayText: '👥 GRUPPO' }, type: 1 }
    ]

    // Blocco 2: Utility e IA
    const buttons2 = [
      { buttonId: _p + 'menuia', buttonText: { displayText: '🤖 INTELLIGENZA IA' }, type: 1 },
      { buttonId: _p + 'menudownload', buttonText: { displayText: '📥 DOWNLOAD' }, type: 1 },
      { buttonId: _p + 'menustrumenti', buttonText: { displayText: '🛠️ STRUMENTI' }, type: 1 }
    ]

    // Invio primo messaggio con Immagine e primi 3 tasti
    await conn.sendMessage(m.chat, {
        image: { url: MENU_IMAGE_URL },
        caption: text.trim(),
        footer: "SISTEMA DI PROTEZIONE E GIOCHI",
        buttons: buttons1,
        headerType: 4,
        viewOnce: true
    }, { quoted: m })

    // Invio secondo messaggio (solo tasti) per le altre categorie
    await conn.sendMessage(m.chat, {
        text: "📂 *ALTRE CATEGORIE DISPONIBILI:*",
        footer: "STRUMENTI E INTELLIGENZA ARTIFICIALE",
        buttons: buttons2,
        headerType: 1,
        viewOnce: true
    }, { quoted: m })
    
    await m.react('💠')

  } catch (e) {
    console.error(e)
  }
}

handler.help = ['menu']
handler.command = ['menu', 'help']
export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
