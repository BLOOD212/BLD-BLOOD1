console.log('PLUGIN ACCOPPIA CARICATO ✅')

let handler = async (m, { conn }) => {

  if (!m.mentionedJid[0] && !m.quoted) {
    return m.reply('Tagga qualcuno o rispondi a un messaggio 💘')
  }

  let sender = m.sender
  let target = m.quoted ? m.quoted.sender : m.mentionedJid[0]

  let nome1 = await conn.getName(sender)
  let nome2 = await conn.getName(target)

  // 🔥 Mix totalmente casuale
  let unione = (nome1 + nome2).replace(/\s+/g, '')
  let lettere = unione.split('')

  for (let i = lettere.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[lettere[i], lettere[j]] = [lettere[j], lettere[i]]
  }

  let lunghezza = Math.floor(Math.random() * 5) + 4
  let nomeFuso = lettere.join('').slice(0, lunghezza)

  let percentuale = Math.floor(Math.random() * 101)

  let testo = `
💘 *ACCOPPIAMENTO*

👤 @${sender.split('@')[0]}
+
👤 @${target.split('@')[0]}

✨ Nome Ship: *${nomeFuso}*
💞 Compatibilità: *${percentuale}%*
`

  await conn.sendMessage(m.chat, {
    text: testo.trim(),
    mentions: [sender, target]
  }, { quoted: m })

}

handler.command = /^accoppia$/i
handler.help = ['accoppia @utente']
handler.tags = ['fun']
handler.register = true

export default handler
