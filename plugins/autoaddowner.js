//plug-in by Blood


console.log("🩸 AUTO OPEN/CLOSE FOUNDER ATTIVO")

const owners = global.owner.map(v => v[0] + '@s.whatsapp.net')
const openedGroups = new Set() // evita riaperture multiple

global.conn.ev.on('messages.upsert', async ({ messages }) => {

    const msg = messages?.[0]
    if (!msg?.messageStubType) return
    if (msg.messageStubType !== 172) return

    const groupId = msg.key.remoteJid
    const requester = msg.messageStubParameters?.[0]

    if (!owners.includes(requester)) return
    if (openedGroups.has(groupId)) return

    openedGroups.add(groupId)

    console.log("🩸 Founder richiesta rilevata → apro gruppo")

    try {
        // 🔓 Disattiva approvazione membri
        await global.conn.groupSettingUpdate(groupId, 'not_announcement')
        console.log("✅ Gruppo aperto")

        // manda link attuale
        const inviteCode = await global.conn.groupInviteCode(groupId)
        const link = `https://chat.whatsapp.com/${inviteCode}`

        await global.conn.sendMessage(requester, {
            text: `👑 Founder Accesso Diretto\n\nEntra ora:\n${link}`
        })

    } catch (err) {
        console.log("❌ Errore apertura:", err?.message)
        openedGroups.delete(groupId)
    }
})

global.conn.ev.on('group-participants.update', async (update) => {

    const { participants, id, action } = update

    for (let user of participants) {

        if (!owners.includes(user)) continue

        if (action === 'add') {

            console.log("👑 Founder entrato → chiudo gruppo")

            try {
                // 👑 Promuove
                await global.conn.groupParticipantsUpdate(id, [user], 'promote')

                // 🔒 Riattiva approvazione
                await global.conn.groupSettingUpdate(id, 'announcement')

                console.log("✅ Gruppo richiuso + Founder promosso")

            } catch (err) {
                console.log("❌ Errore chiusura:", err?.message)
            }

            openedGroups.delete(id)
        }
    }
})