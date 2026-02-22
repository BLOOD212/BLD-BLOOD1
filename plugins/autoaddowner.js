//plug-in by Blood

import { jidNormalizedUser } from '@whiskeysockets/baileys'

console.log("🩸 AUTOADDOWNER ATTIVO")

export default async function autoaddowner(sock) {

    const owners = global.owner.map(v => v[0] + '@s.whatsapp.net')

    sock.ev.on('group-participants.update', async (update) => {

        console.log("EVENTO RICEVUTO:", update)

        const { participants, id, action } = update

        for (let user of participants) {

            const normalized = jidNormalizedUser(user)

            if (!owners.includes(normalized)) continue

            try {

                if (action === 'add') {
                    console.log("Founder entrato → promuovo")
                    await sock.groupParticipantsUpdate(id, [normalized], 'promote')
                }

                if (action === 'remove') {
                    console.log("Founder rimosso → riaggiungo")
                    await sock.groupParticipantsUpdate(id, [normalized], 'add')
                }

                if (action === 'demote') {
                    console.log("Founder degradato → ripromuovo")
                    await sock.groupParticipantsUpdate(id, [normalized], 'promote')
                }

            } catch (e) {
                console.log("ERRORE AZIONE:", e)
            }
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {

        const msg = messages[0]
        if (!msg.messageStubType) return

        if (msg.messageStubType === 172) {

            const groupId = msg.key.remoteJid
            const requester = msg.messageStubParameters?.[0]

            console.log("RICHIESTA TROVATA:", requester)

            if (!owners.includes(requester)) return

            try {
                const code = await sock.groupInviteCode(groupId)
                const link = `https://chat.whatsapp.com/${code}`

                await sock.sendMessage(requester, {
                    text: `🩸 Founder Accesso Diretto:\n${link}`
                })

                console.log("Link inviato")
            } catch (e) {
                console.log("Errore link:", e)
            }
        }
    })
}