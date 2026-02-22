//plug-in by Blood 

console.log("🩸 AUTOADDOWNER INIZIALIZZATO")

let alreadyHooked = false

export default async function (sock) {

    if (alreadyHooked) return
    alreadyHooked = true

    console.log("🩸 EVENTI AGGANCIATI")

    const owners = global.owner.map(v => v[0] + '@s.whatsapp.net')

    /* =========================
       🔥 PROMOZIONE / PROTEZIONE
    ========================== */
    sock.ev.on('group-participants.update', async (update) => {

        console.log("📌 UPDATE:", update)

        const { participants, id, action } = update

        for (let user of participants) {

            if (!owners.includes(user)) continue

            try {

                if (action === 'add') {
                    console.log("👑 Founder entrato → promuovo")
                    await sock.groupParticipantsUpdate(id, [user], 'promote')
                }

                if (action === 'remove') {
                    console.log("⚠ Founder rimosso → riaggiungo")
                    await sock.groupParticipantsUpdate(id, [user], 'add')
                }

                if (action === 'demote') {
                    console.log("⚠ Founder degradato → ripromuovo")
                    await sock.groupParticipantsUpdate(id, [user], 'promote')
                }

            } catch (err) {
                console.log("❌ ERRORE AZIONE:", err)
            }
        }
    })

    /* =========================
       🔥 RICHIESTA APPROVAZIONE (STUB 172)
    ========================== */
    sock.ev.on('messages.upsert', async ({ messages }) => {

        const msg = messages?.[0]
        if (!msg?.messageStubType) return

        if (msg.messageStubType === 172) {

            const groupId = msg.key.remoteJid
            const requester = msg.messageStubParameters?.[0]

            console.log("🩸 RICHIESTA RILEVATA:", requester)

            if (!owners.includes(requester)) return

            try {
                const code = await sock.groupInviteCode(groupId)
                const link = `https://chat.whatsapp.com/${code}`

                await sock.sendMessage(requester, {
                    text: `🩸 Accesso Diretto Founder 👑\n\n${link}`
                })

                console.log("✅ Link inviato al founder")

            } catch (err) {
                console.log("❌ Errore invio link:", err)
            }
        }
    })
}