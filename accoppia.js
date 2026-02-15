let handler = async (m, { conn }) => {

  let sender = m.sender
  let target = m.quoted 
    ? m.quoted.sender 
    : m.mentionedJid?.[0] 
      ? m.mentionedJid[0] 
      : null

  if (!target) {
    return m.reply('⭔ `Tagga qualcuno o rispondi a un messaggio`\n\n*`Esempio:`* *.accoppia @user*')
  }

  const nome1 = sender.split('@')[0]
  const nome2 = target.split('@')[0]

  const metà1 = nome1.slice(0, Math.floor(nome1.length / 2))
  const metà2 = nome2.slice(Math.floor(nome2.length / 2))

  const nomeFuso = (metà1 + metà2).replace(/\s+/g, '')

  const giudizio = Math.random() > 0.5
    ? '😍 Nome stupendo!'
    : '💀 Mamma mia che disastro...'

  const testo =
`💞 Accoppiamento attivato!

@${nome1} + @${nome2} = *${nomeFuso}*

${giudizio}`

  await conn.sendMessage(m.chat, {
    text: testo,
    mentions: [sender, target]
  }, { quoted: m })

}

handler.help = ['accoppia @utente']
handler.tags = ['giochi']
handler.command = /^(accoppia)$/i
handler.register = true

export default handler
