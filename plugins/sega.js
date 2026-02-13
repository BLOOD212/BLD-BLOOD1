let handler = async (m, { conn }) => {

  let destinatario

  // Se risponde a qualcuno
  if (m.quoted && m.quoted.sender) {
    destinatario = m.quoted.sender

  // Se menziona qualcuno
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    destinatario = m.mentionedJid[0]

  // Se non fa nulla → si auto-targetta
  } else {
    destinatario = m.sender
  }

  let nome = '@' + destinatario.split('@')[0]

  const frames = [
    `Ora sego ${nome}... 😏`,
    "8===👊=D",
    "8=👊===D",
    "8==👊==D",
    "8===👊=D💦",
    `Oh ${nome} ha sborrato! 😋💦`
  ]

  for (let msg of frames) {
    await conn.sendMessage(m.chat, {
      text: msg,
      mentions: [destinatario]
    }, { quoted: m })

    await new Promise(r => setTimeout(r, 700))
  }
}

handler.help = ['sega @tag']
handler.tags = ['fun']
handler.command = /^(sega)$/i

// 🔓 Nessuna restrizione
handler.owner = false
handler.admin = false
handler.group = false
handler.private = false
handler.premium = false

export default handler
