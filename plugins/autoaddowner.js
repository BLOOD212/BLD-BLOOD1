// plug-in by Blood 

console.log("🩸 AUTO-APPROVAZIONE OWNER ATTIVA")

global.conn.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages?.[0]
    
    // StubType 172 indica una richiesta di accesso a un gruppo (Membership Approval Request)
    if (!msg?.messageStubType || msg.messageStubType !== 172) return

    const groupId = msg.key.remoteJid
    const requester = msg.messageStubParameters?.[0] // L'ID di chi ha chiesto di entrare
    const owners = global.owner.map(v => v[0] + '@s.whatsapp.net')

    // Verifica se chi richiede l'accesso è nella lista global.owner
    if (!owners.includes(requester)) {
        console.log(`⏳ Richiesta ignorata: ${requester} non è un owner.`)
        return
    }

    console.log(`👑 Rilevata richiesta da Owner: ${requester}. Approvo...`)

    try {
        // ✅ Accetta la richiesta dell'owner
        // Nota: 'add' in questo contesto di groupParticipantsUpdate agisce come "approve"
        await global.conn.groupParticipantsUpdate(groupId, [requester], 'add')
        
        console.log(`✅ Owner ${requester} accettato automaticamente nel gruppo ${groupId}`)

        // Facoltativo: Messaggio di benvenuto o promozione automatica subito dopo
        setTimeout(async () => {
            await global.conn.groupParticipantsUpdate(groupId, [requester], 'promote')
            await global.conn.sendMessage(groupId, { text: "👑 Benvenuto Capo. Sei stato promosso automaticamente." })
        }, 2000)

    } catch (err) {
        console.log("❌ Errore durante l'approvazione automatica:", err?.message)
    }
})