const handler = async (m, { conn, isOwner, isAdmin, usedPrefix, command }) => {
  // Controllo permessi
  if (!isOwner && !isAdmin) return m.reply('⛔ *Solo gli amministratori possono usare questo comando.*')
  if (!m.isGroup) return 

  try {
    // Recupera la lista delle richieste pendenti
    const res = await conn.groupRequestParticipantsList(m.chat)

    if (!res || res.length === 0) {
      return m.reply('✅ *Non ci sono richieste di accesso pendenti.*')
    }

    // Estraiamo solo i JID (ID degli utenti)
    const jids = res.map(user => user.jid)

    // Eseguiamo l'approvazione per tutti i JID in una volta sola (più efficiente)
    // Se la tua versione richiede un ciclo, usa for...of con await
    await conn.groupRequestParticipantsUpdate(
      m.chat, 
      jids, 
      'approve'
    )

    m.reply(`✅ *Operazione completata:* sono state accettate ${jids.length} richieste di ingresso.`)

  } catch (e) {
    console.error(e)
    m.reply('❌ *Errore:* Assicurati che il bot sia amministratore e che l\'approvazione dei membri sia attiva nelle impostazioni del gruppo.')
  }
}

handler.help = ['accetta']
handler.tags = ['group']
handler.command = /^(accetta|accept)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
