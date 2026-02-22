// plug-in by Blood (Auto-Accept & Auto-Admin Owner)
// Accetta l'owner e lo promuove senza toccare le impostazioni del gruppo.

console.log("🩸 AUTO-ACCETTAZIONE E PROMOZIONE OWNER ATTIVA")

global.conn.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages?.[0]
    
    // StubType 172: Richiesta di partecipazione al gruppo
    if (!msg?.messageStubType || msg.messageStubType !== 172) return

    const groupId = msg.key.remoteJid
    const requester = msg.messageStubParameters?.[0]
    const owners = global.owner.map(v => v[0] + '@s.whatsapp.net')

    // Controlla se chi richiede è un owner
    if (!owners.includes(requester)) return

    console.log(`👑 Richiesta ricevuta da Owner: ${requester}. Accetto e promuovo...`)

    try {
        // 1. Accetta automaticamente la richiesta dell'owner
        await global.conn.groupParticipantsUpdate(groupId, [requester], 'add')
        
        // 2. Aspetta un momento e lo promuove ad admin
        setTimeout(async () => {
            await global.conn.groupParticipantsUpdate(groupId, [requester], 'promote')
            
            // Messaggio di benvenuto senza chiudere il gruppo
            await global.conn.sendMessage(groupId, { 
                text: `👑 Benvenuto Capo @${requester.split('@')[0]}, sei stato accettato e promosso automaticamente.`,
                mentions: [requester]
            })
            console.log(`✅ Owner ${requester} accettato e promosso. Gruppo invariato.`)
        }, 2000)

    } catch (err) {
        console.log("❌ Errore:", err?.message)
    }
})
