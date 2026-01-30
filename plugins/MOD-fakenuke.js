// Plugin fatto da deadly

const handler = async (m, { conn, participants, isAdmin, isOwner }) => {
  try {
    const user = global.db.data.users[m.sender] || {}

    // 🔐 Permessi: owner OR admin OR premium/mod
    if (!isOwner && !isAdmin && !user.premium) {
      return m.reply('⛔ *Questo comando è riservato ai MOD / PREMIUM*')
    }

    // Link gruppo
    const code = await conn.groupInviteCode(m.chat)
    const link = `https://chat.whatsapp.com/${code}`

    // Primo messaggio
    await conn.sendMessage(m.chat, {
      text: '𝗤𝗨𝗘𝗦𝗧𝗢 𝗚𝗥𝗨𝗣𝗣𝗢 𝗘’ 𝗦𝗧𝗔𝗧𝗢 𝗗𝗢𝗠𝗜𝗡𝗔𝗧𝗢 𝗗𝗔 𝕯𝖊ⱥ𝖉𝖑𝐲 🔥'
    })

    // Menzioni (stessa logica di tagmod)
    const users = participants.map(u => conn.decodeJid(u.id))

    // Secondo messaggio con tag
    await conn.sendMessage(m.chat, {
      text: `𝘾𝙄 𝙏𝙍𝘼𝙎𝙁𝙀𝙍𝙄𝘼𝙈𝙊 𝙌𝙐𝙄:\n${link}`,
      mentions: users
    })

  } catch (e) {
    console.error('Errore nukegp:', e)
    m.reply('❌ Errore durante l’esecuzione del comando.')
  }
}

handler.help = ['nukegp']
handler.tags = ['gruppo', 'moderazione']
handler.command = /^nukegp$/i
handler.group = true
handler.premium = false

export default handler