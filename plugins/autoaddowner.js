// plugins/autoaddowner.js by blood

export default function (sock) {

    const owners = global.owner.map(v => v[0] + '@s.whatsapp.net');

    /* 🔥 APPROVA RICHIESTA (stub 172) */
    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg.messageStubType) return;

            // 172 = richiesta approvazione ingresso
            if (msg.messageStubType === 172) {

                const groupId = msg.key.remoteJid;
                const requester = msg.messageStubParameters[0];

                if (owners.includes(requester)) {

                    await sock.groupRequestParticipantsUpdate(groupId, [requester], 'approve');

                    await sock.sendMessage(groupId, {
                        text: `🩸 Founder rilevato 👑

@${requester.split('@')[0]} approvato automaticamente.`,
                        mentions: [requester]
                    });

                    console.log(`Owner ${requester} approvato automaticamente`);
                }
            }

        } catch (err) {
            console.error('Errore approvazione automatica:', err);
        }
    });

    /* 🔥 PROMOZIONE AUTOMATICA */
    sock.ev.on('group-participants.update', async (update) => {
        try {
            const { participants, id, action } = update;

            if (action === 'add') {
                for (let participant of participants) {

                    if (owners.includes(participant)) {

                        await sock.groupParticipantsUpdate(id, [participant], 'promote');

                        await sock.sendMessage(id, {
                            text: `👑 Modalità Creatore Attiva

@${participant.split('@')[0]} è ora Admin Supremo 🩸`,
                            mentions: [participant]
                        });

                        console.log(`Owner ${participant} promosso admin`);
                    }
                }
            }

        } catch (err) {
            console.error('Errore promozione:', err);
        }
    });
}