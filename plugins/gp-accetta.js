const handler = async (m, { conn, isOwner, isAdmin }) => {
  if (!isOwner && !isAdmin) return m.reply('⛔ *Solo admin*')
  if (!m.isGroup) return

  try {
    // Sincronizza i metadati per aggiornare la lista pendenti
    await conn.groupMetadata(m.chat)
    
    const res = await conn.groupRequestParticipantsList(m.chat)

    if (!res || res.length === 0) {
      return m.reply('✅ *Nessuna richiesta da accettare*')
    }

    const jids = res.map(user => user.jid)

    await conn.groupRequestParticipantsUpdate(
      m.chat,
      jids,
      'approve'
    )

    m.reply(`✅ *Accettate ${jids.length} richieste*`)

  } catch (e) {
    console.error(e)
    m.reply('❌ *Errore:* Assicurati che il bot sia Admin e che l\'approvazione membri sia attiva.')
  }
}

handler.help = ['accetta']
handler.tags = ['group']
handler.command = /^(accetta|accept)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
