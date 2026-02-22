//plug-in by Blood 


            console.log("🩸 AUTOADDOWNER STABLE MODE")

const owners = global.owner.map(v => v[0] + '@s.whatsapp.net')
const cooldown = new Map() // anti spam per gruppo

global.conn.ev.on('messages.upsert', async ({ messages }) => {

    const msg = messages?.[0]
    if (!msg?.messageStubType) return
    if (msg.messageStubType !== 172) return

    const groupId = msg.key.remoteJid
    const requester = msg.messageStubParameters?.[0]

    if (!owners.includes(requester)) return

    // ⛔ BLOCCO ANTI RATE LIMIT (30 sec)
    const now = Date.now()
    const last = cooldown.get(groupId) || 0
    if (now - last < 30000) {
        console.log("⛔ Cooldown attivo, ignoro")
        return
    }
    cooldown.set(groupId, now)

    console.log("🩸 Founder richiesta rilevata")

    try {
        // Disattiva approvazione UNA SOLA VOLTA
        await global.conn.groupSettingUpdate(groupId, 'not_announcement')
        console.log("✅ Approvazione disattivata")

        // Prende link senza revocarlo
        const inviteCode = await global.conn.groupInviteCode(groupId)
        const link = `https://chat.whatsapp.com/${inviteCode}`

        await global.conn.sendMessage(requester, {
            text: `🩸 Accesso Founder 👑\n\nEntra ora:\n${link}`
        })

        console.log("✅ Link inviato al founder")

    } catch (err) {
        console.log("❌ Errore gestione richiesta:", err?.message)
    }
})

global.conn.ev.on('group-participants.update', async (update) => {

    const { participants, id, action } = update

    for (let user of participants) {

        if (!owners.includes(user)) continue

        if (action === 'add') {

            console.log("👑 Founder entrato")

            try {
                await global.conn.groupParticipantsUpdate(id, [user], 'promote')
                await global.conn.groupSettingUpdate(id, 'announcement')
                console.log("✅ Founder promosso + approvazione riattivata")
            } catch (err) {
                console.log("❌ Errore post ingresso:", err?.message)
            }
        }
    }
})