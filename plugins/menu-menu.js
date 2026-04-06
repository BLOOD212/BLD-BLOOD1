import { promises } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'

const emojicategoria = {
  info: '⁉️',
  main: '🦋',
  sicurezza: '🛡️'
}

let tags = {
  'main': '╭ *`𝐌𝐀𝐈𝐍`* ╯',
  'sicurezza': '╭ *`𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘`* ╯',
  'info': '╭ *`𝐈𝐍𝐅𝐎`* ╯'
}

const defaultMenu = {
  before: `╭⭒─ׄ─⊱ *𝐌𝐄𝐍𝐔 - 𝐁𝐎𝐓* ⊰
✦ 👤 \`Utente:\` *%name*
✧ 🪐 \`Attivo da:\` *%uptime*
✦ 💫 \`Utenti:\` *%totalreg*
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒\n
`.trimStart(),
  header: '      ⋆｡˚『 %category 』˚｡⋆\n╭',
  body: '*│ ➤* 『%emoji』%cmd',
  footer: '*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*\n',
  after: ``,
}

const swag = 'https://i.ibb.co/hJW7WwxV/varebot.jpg';

// --- SISTEMA DI RILEVAMENTO DISPOSITIVO (IDENTICO AL TUO) ---
function detectDevice(msgID) {
  if (!msgID) return 'unknown'; 
  if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) return 'bot';
  if (msgID.startsWith('false_') || msgID.startsWith('true_')) return 'web';
  if (msgID.startsWith('3EB0') && /^[A-Z0-9]+$/.test(msgID)) return 'web';
  if (msgID.includes(':')) return 'desktop';
  if (/^[A-F0-9]{32}$/i.test(msgID)) return 'android';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)) return 'ios';
  if (/^[A-Z0-9]{20,25}$/i.test(msgID) && !msgID.startsWith('3EB0')) return 'ios';
  return 'unknown';
}

function getRandomMenus(_p) {
  const allMenus = [
    { title: "🛡️ Menu Sicurezza", command: "attiva" },
    { title: "🎮 Menu Giochi", command: "menugiochi" },
    { title: "🤖 Menu IA", command: "menuia" },
    { title: "👥 Menu Gruppo", command: "menugruppo" },
    { title: "📥 Menu Download", command: "menudownload" },
    { title: "🛠️ Menu Strumenti", command: "menustrumenti" },
    { title: "⭐ Menu Premium", command: "menupremium" },
    { title: "👨‍💻 Menu Creatore", command: "menucreatore" }
  ];
  const shuffled = allMenus.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5); // iOS supporta bene fino a 5 bottoni quick_reply
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    let name = await conn.getName(m.sender) || 'Utente';
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);
    let totalreg = Object.keys(global.db.data.users).length;

    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.tags) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
      };
    });

    let menuTags = Object.keys(tags);
    let _text = [
      defaultMenu.before,
      ...menuTags.map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return defaultMenu.body
                .replace(/%cmd/g, menu.prefix ? help : _p + help)
                .replace(/%emoji/g, emojicategoria[tag] || '❔')
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
    
    const msgID = m.id || m.key?.id;
    const deviceType = detectDevice(msgID);
    const isGroup = m.chat.endsWith('@g.us');

    // --- LOGICA IPHONE (IOS) ---
    if (deviceType === 'ios') {
      const randomMenus = getRandomMenus(_p);
      const buttons = randomMenus.map(menu => ({
        buttonId: _p + menu.command,
        buttonText: { displayText: menu.title },
        type: 1
      }));

      await conn.sendMessage(m.chat, {
        image: { url: swag },
        caption: text.trim(),
        footer: "𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙",
        buttons: buttons,
        headerType: 4
      }, { quoted: m });

    } else {
      // --- LOGICA ANDROID / GRUPPI (NATIVE FLOW) ---
      if (isGroup) {
        let thumbnailBuffer;
        try {
          const response = await fetch(swag);
          thumbnailBuffer = Buffer.from(await response.arrayBuffer());
        } catch {
          thumbnailBuffer = Buffer.alloc(0);
        }

        await conn.sendMessage(m.chat, {
          interactiveButtons: [{
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "💠 SELEZIONA MODULO",
              sections: [{
                title: "🛡️ PROTEZIONE & GIOCHI",
                rows: [
                  { id: _p + "attiva", title: "🛡️ Menu Sicurezza", description: "Protezione Gruppo" },
                  { id: _p + "menugiochi", title: "🎮 Menu Giochi", description: "Games & Leveling" }
                ]
              }, {
                title: "📂 TUTTI I MODULI",
                rows: [
                  { id: _p + "menuia", title: "🤖 Menu IA", description: "Intelligenza Artificiale" },
                  { id: _p + "menugruppo", title: "👥 Menu Gruppo", description: "Gestione membri" },
                  { id: _p + "menudownload", title: "📥 Menu Download", description: "Scarica contenuti" },
                  { id: _p + "menustrumenti", title: "🛠️ Menu Strumenti", description: "Utilità e Tools" },
                  { id: _p + "menupremium", title: "⭐ Menu Premium", description: "Funzioni Exclusive" },
                  { id: _p + "menucreatore", title: "👨‍💻 Menu Creatore", description: "Pannello Owner" }
                ]
              }]
            })
          }],
          text: text.trim(),
          footer: "𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙",
          media: { image: thumbnailBuffer }
        }, { quoted: m });
      } else {
        // --- LOGICA PRIVATA (LISTE STANDARD) ---
        const sections = [
          {
            title: "🛡️ SISTEMA",
            rows: [
              { title: "🛡️ Menu Sicurezza", rowId: _p + "attiva" },
              { title: "🎮 Menu Giochi", rowId: _p + "menugiochi" }
            ]
          },
          {
            title: "📂 CATEGORIE",
            rows: [
              { title: "🤖 Menu IA", rowId: _p + "menuia" },
              { title: "👥 Menu Gruppo", rowId: _p + "menugruppo" },
              { title: "📥 Menu Download", rowId: _p + "menudownload" },
              { title: "🛠️ Menu Strumenti", rowId: _p + "menustrumenti" },
              { title: "⭐ Menu Premium", rowId: _p + "menupremium" },
              { title: "👨‍💻 Menu Creatore", rowId: _p + "menucreatore" }
            ]
          }
        ];

        await conn.sendMessage(m.chat, {
          text: text.trim(),
          footer: "𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙",
          buttonText: "💠 SCEGLI MENU",
          sections
        }, { quoted: m });
      }
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Errore: ${e.message}`, m)
  }
};

handler.help = ['menu'];
handler.command = ['menu', 'help', 'comandi', 'funzioni'];
export default handler;

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
