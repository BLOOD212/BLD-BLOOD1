import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn }) => {
  const fotoPath = path.join(__dirname, '../media/velith.jpeg')

  if (!fs.existsSync(fotoPath)) {
    return m.reply('❌ Foto non trovata: media/velith.jpeg')
  }

  const text = `
╭───────────────╮
│ 🩸 𝐌𝐨𝐠𝐥𝐢𝐞 𝐝𝐢 𝕭𝖑𝖔𝖔𝖉 🩸
╰───────────────╯

𝐍𝐨𝐧 è 𝐬𝐨𝐥𝐨 𝐕𝐞𝐥𝐢𝐭𝐡.
È 𝐥𝐚 𝐟𝐨𝐫𝐳𝐚 𝐜𝐡𝐞 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚 𝐁𝐥𝐨𝐨𝐝.
𝐎𝐬𝐜𝐮𝐫𝐢𝐭à 𝐞 𝐟𝐮𝐨𝐜𝐨.
𝐑𝐞𝐠𝐢𝐧𝐚 𝐧𝐚𝐭𝐚 𝐩𝐞𝐫 𝐝𝐨𝐦𝐢𝐧𝐚𝐫𝐞.

𝕭𝖑𝖔𝖔𝖉 è 𝖋𝖔𝖗𝖟𝖆.
𝑽𝒆𝒍𝒊𝒕𝒉 è 𝖊𝖘𝖘𝖊𝖓𝖟𝖆.
𝐈𝐧𝐬𝐢𝐞𝐦𝐞 𝐬𝐨𝐧𝐨 𝐝𝐞𝐬𝐭𝐢𝐧𝐨.

- 𝒃𝒍𝒐𝒐𝒅 & 𝒗𝒆𝒍𝒊𝒕𝒉 🩸🖤
  `.trim()

  await conn.sendMessage(
    m.chat,
    {
      image: fs.readFileSync(fotoPath),
      caption: text
    },
    { quoted: m }
  )
}

handler.command = ['mogliediblood']
handler.tags = ['fun']
handler.help = ['mogliediblood']

export default handler