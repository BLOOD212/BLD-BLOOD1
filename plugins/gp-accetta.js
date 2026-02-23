const handler = async (m, { conn, isOwner, isAdmin }) => {
  if (!m.isGroup) return
  if (!isOwner && !isAdmin) return m.reply('⛔ *Solo admin*')

  try {
    // 1. Refresh metadati
    await conn.groupMetadata(m.chat)
    
    // 2. Recupero lista
    const res = await conn.groupRequestParticipantsList(m.chat)

    if (!res || res.length === 0) {
      return m.reply('✅ *Nessuna richiesta pendente.*')
    }

    // 3. Approvazione ciclica per evitare crash bulk
    let count = 0
    for (let user of res) {
      await conn.groupRequestParticipantsUpdate(m.chat, [user.jid], 'approve')
      count++
    }

    m.reply(`✅ *Completato:* ${count} persone accettate.`)

  } catch (e) {
    console.error(e)
    m.reply('❌ *Errore di sistema:* Se il bot è admin, disattiva e riattiva l\'approvazione partecipanti nelle impostazioni del gruppo per sbloccare la lista.')
  }
}

handler.command = /^(accetta)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
