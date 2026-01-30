import { MessageType } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
let text = `
╔═══════════╗
   👑 *OWNER* 👑
╚═══════════╝

📞 *WhatsApp*
👉 wa.me/19703033232

📸 *Instagram*
👉 @bloodvelith

💻 *GitHub*
👉 https://github.com/BLOOD212/BLD-BLOOD1

📧 *Email*
👉 blooddomina@gmail.com

━━━━━━━━━━━━━━━━━━━━━
⚡ *Powered by BLOOD* ⚡
😈 _No limits. No mercy._
━━━━━━━━━━━━━━━━━━━━━
`

await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
        externalAdReply: {
            title: "👑 OWNER INFO",
            body: "Blood domina il sistema",
            thumbnailUrl: "https://i.imgur.com/JP52fdP.jpeg",
            sourceUrl: "https://github.com/BLOOD212/BLD-BLOOD1",
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }
}, { quoted: m })
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner', 'creator', 'proprietario']

export default handler