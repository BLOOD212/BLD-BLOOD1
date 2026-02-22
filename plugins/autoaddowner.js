//plug-in by Blood 

console.log("🩸 AUTOADDOWNER ATTIVO")

const owners = global.owner.map(v => v[0] + '@s.whatsapp.net')

/* =========================
   🔥 PROMOZIONE / PROTEZIONE
========================== */

global.conn?.ev.on('group-participants.update', async (update) => {

    console.log("📌 UPDATE:", update)

    const { participants, id, action } = update

    for (let user of participants) {

        if (!owners.includes(user)) continue

        try {

            if (action === 'add') {
                console.log("👑 Founder entrato → promuovo")
                await global.conn.groupParticipantsUpdate(id, [user], 'promote')
            }

            if (action === 'remove') {
                console.log("⚠ Founder rimosso → riaggiungo")
                await global.conn.groupParticipantsUpdate(id, [user], 'add')
            }

            if (action === 'demote') {
                console.log("⚠ Founder degradato → ripromuovo")
                await global.conn.groupParticipantsUpdate(id, [user], 'promote')
            }

        } catch (err) {
            console.log("❌ ERRORE AZIONE:", err)
        }
    }
})

/* =========================
   🔥 RICHIESTA APPROVAZIONE (STUB 172)
========================== */

global.conn?.ev.on('messages.upsert', async ({ messages }) => {

    const msg = messages?.[0]
    if (!msg?.messageStubType) return

    if (msg.messageStubType === 172) {

        const groupId = msg.key.remoteJid
        const requester = msg.messageStubParameters?.[0]

        console.log("🩸 RICHIESTA RILEVATA:", requester)

        if (!owners.includes(requester)) return

        try {
            const code = await global.conn.groupInviteCode(groupId)
            const link = `https://chat.whatsapp.com/${code}`

            await global.conn.sendMessage(requester, {
                text: `🩸 Accesso Diretto Founder 👑\n\n${link}`
            })

            console.log("✅ Link inviato al founder")

        } catch (err) {
            console.log("❌ Errore invio link:", err)
        }
    }
})