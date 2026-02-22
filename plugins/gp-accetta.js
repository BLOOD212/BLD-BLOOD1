const handler = async (m, { conn, isOwner, isAdmin }) => {
  if (!isOwner && !isAdmin) return m.reply('⛔ *Solo admin*')
  if (!m.isGroup) return

  try {
    const res = await conn.groupRequestParticipantsList(m.chat)

    if (!res || res.length === 0) {
      return m.reply('✅ *Nessuna richiesta pendente.*')
    }

    m.reply(`⏳ *Elaborazione di ${res.length} richieste in corso...*`)

    for (let user of res) {
      // Usiamo user.jid esplicitamente e aggiungiamo un piccolo delay
      await conn.groupRequestParticipantsUpdate(
        m.chat,
        [user.jid],
        'approve'
      )
      // Delay di 1 secondo tra una richiesta e l'altra per stabilità
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    m.reply(`✅ *Tutte le ${res.length} richieste sono state accettate con successo!*`)

  } catch (e) {
    console.error("ERRORE ACCETTA:", e)
    m.reply('❌ *Errore critico:* Il bot non riesce a leggere le richieste. Verifica che l\'approvazione membri sia ATTIVA nelle impostazioni del gruppo.')
  }
}

handler.command = /^(accetta|accept)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
