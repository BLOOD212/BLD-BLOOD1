//plug-in by Blood 

console.log("🩸 AUTOADDOWNER SAFE MODE ATTIVO")

const owners = global.owner.map(v => v[0] + '@s.whatsapp.net')

/* =========================
   🔥 RILEVA RICHIESTA FOUNDER
========================== */

global.conn.ev.on('messages.upsert', async ({ messages }) => {

    const msg = messages?.[0]
    if (!msg?.messageStubType) return

    if (msg.messageStubType === 172) {

        const groupId = msg.key.remoteJid
        const requester = msg.messageStubParameters?.[0]

        if (!owners.includes(requester)) return

        console.log("🩸 Founder richiesta rilevata")

        try {

            // 1️⃣ Disattiva approvazione membri (NON cambia link)
            await global.conn.groupSettingUpdate(groupId, 'not_announcement')
            console.log("✅ Approvazione temporaneamente disattivata")

            // 2️⃣ Prende link attuale (senza revocarlo)
            const inviteCode = await global.conn.groupInviteCode(groupId)
            const link = `https://chat.whatsapp.com/${inviteCode}`

            // 3️⃣ Manda link founder
            await global.conn.sendMessage(requester, {
                text: `🩸 Accesso Founder 👑\n\nEntra ora:\n${link}`
            })

        } catch (err) {
            console.log("❌ Errore gestione richiesta:", err)
        }
    }
})

/* =========================
   👑 PROMOZIONE + RIPRISTINO
========================== */

global.conn.ev.on('group-participants.update', async (update) => {

    const { participants, id, action } = update

    for (let user of participants) {

        if (!owners.includes(user)) continue

        try {

            if (action === 'add') {

                console.log("👑 Founder entrato")

                // Promuove admin
                await global.conn.groupParticipantsUpdate(id, [user], 'promote')

                // Riattiva approvazione membri
                await global.conn.groupSettingUpdate(id, 'announcement')

                await global.conn.sendMessage(id, {
                    text: `👑 Founder Online 👑\n\n@${user.split('@')[0]} è Admin Supremo.`,
                    mentions: [user]
                })

                console.log("✅ Founder promosso + approvazione riattivata")
            }

        } catch (err) {
            console.log("❌ Errore post ingresso:", err)
        }
    }
})