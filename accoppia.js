const handler = async (m, { conn }) => {

  let sender = m.sender
  let target = null

  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0]
  } else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender
  } else {
    return m.reply('Devi menzionare qualcuno 😏')
  }

  const nome1 = sender.split('@')[0]
  const nome2 = target.split('@')[0]

  const metà1 = nome1.slice(0, Math.floor(nome1.length / 2))
  const metà2 = nome2.slice(Math.floor(nome2.length / 2))

  const nomeFuso = metà1 + metà2

  const giudizio = Math.random() > 0.5
    ? '😍 Nome stupendo!'
    : '💀 Mamma mia che disastro...'

  const testo =
    `💞 Accoppiamento attivato!\n\n` +
    `@${nome1} + @${nome2} = *${nomeFuso}*\n\n` +
    giudizio

  await conn.sendMessage(m.chat, {
    text: testo,
    mentions: [sender, target]
  }, { quoted: m })

}

handler.help = ['accoppia @utente']
handler.tags = ['fun']
handler.command = ['accoppia']

export default handler
