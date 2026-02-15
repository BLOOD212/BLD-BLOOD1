let handler = async (m, { conn, usedPrefix, command }) => {

  let sender = m.sender
  let target = m.quoted 
    ? m.quoted.sender 
    : m.mentionedJid?.[0] 
      ? m.mentionedJid[0] 
      : null

  let msg = `⭔ \`Tagga qualcuno o rispondi a un messaggio\`\n\n*\`Esempio:\`* *${usedPrefix + command} @user*`
  if (!target) return m.reply(msg)

  let nome1 = await conn.getName(sender)
  let nome2 = await conn.getName(target)

  // 🔥 Unione nomi senza spazi
  let unione = (nome1 + nome2).replace(/\s+/g, '')

  // 🎲 Mischia lettere casualmente
  let lettere = unione.split('')
  for (let i = lettere.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[lettere[i], lettere[j]] = [lettere[j], lettere[i]]
  }

  // Prendiamo una lunghezza random tra 4 e 8 lettere
  let lunghezza = Math.floor(Math.random() * 5) + 4
  let nomeFuso = lettere.join('').slice(0, lunghezza)

  let percentuale = Math.floor(Math.random() * 101)

  let risultato = ''
  if (percentuale <= 30) risultato = '💀 Destinati al blocco reciproco.'
  else if (percentuale <= 60) risultato = '😅 Relazione instabile...'
  else if (percentuale <= 85) risultato = '😍 Ottima ship!'
  else risultato = '💍 MATRIMONIO IN ARRIVO!'

  let testo = `
💘 *LOVE TEST RANDOM*

👤 @${sender.split('@')[0]}
+
👤 @${target.split('@')[0]}

✨ Nome coppia: *${nomeFuso}*
💞 Compatibilità: *${percentuale}%*

${risultato}
`

  await conn.sendMessage(m.chat, {
    text: testo.trim(),
    mentions: [sender, target]
  }, { quoted: m })

}

handler.help = ['accoppia @utente']
handler.tags = ['giochi']
handler.command = /^(accoppia)$/i
handler.register = true

export default handler
