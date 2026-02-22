// plugins/autoaddowner.js by blood

export default function (sock) {

    // Converte numeri owner in jid
    const owners = global.owner.map(v => v[0] + '@s.whatsapp.net');

    /* 🔥 APPROVA RICHIESTE */
    sock.ev.on('group.join-request', async (update) => {
        try {
            const { id, author } = update;

            if (owners.includes(author)) {

                await sock.groupRequestParticipantsUpdate(id, [author], 'approve');

                await sock.sendMessage(id, {
                    text: `🩸 Founder rilevato 👑

@${author.split('@')[0]} è stato approvato automaticamente.`,
                    mentions: [author]
                });

                console.log(`Owner ${author} approvato automaticamente`);
            }

        } catch (err) {
            console.error('Errore join-request:', err);
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
            console.error('Errore participants update:', err);
        }
    });
}