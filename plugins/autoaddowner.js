async function handleGroupParticipantsUpdate(sock, update) {
    const { participants, id, action } = update;

    // Converte i numeri owner in formato jid
    const owners = global.owner.map(v => v[0] + '@s.whatsapp.net');

    for (let participant of participants) {

        // Se è un owner
        if (owners.includes(participant)) {

            try {

                /* 🟢 1️⃣ APPROVA RICHIESTA (se presente) */
                if (action === 'request') {
                    await sock.groupRequestParticipantsUpdate(id, [participant], 'approve');
                    console.log(`Richiesta approvata per owner ${participant}`);
                }

                /* 🟢 2️⃣ PROMUOVI ADMIN */
                if (action === 'add') {
                    await sock.groupParticipantsUpdate(id, [participant], 'promote');
                    console.log(`Owner ${participant} promosso admin`);
                }

                /* 🟢 3️⃣ MESSAGGIO DI BENVENUTO */
                const nome = participant.split('@')[0];

                await sock.sendMessage(id, {
                    text: `🩸 Benvenuto Mio Creatore 👑

@${nome} è entrato nel gruppo.
Modalità Fondatore Attivata 🔥`,
                    mentions: [participant]
                });

            } catch (error) {
                console.error(`Errore gestione owner ${participant}:`, error);
            }
        }
    }
}

export default function (sock) {
    sock.ev.on('group-participants.update', async (update) => {
        try {
            await handleGroupParticipantsUpdate(sock, update);
        } catch (err) {
            console.error('Errore evento group update:', err);
        }
    });
}