//plug-in by Blood

export default function (sock) {

    const owners = global.owner.map(v => v[0] + '@s.whatsapp.net');

    /* ===============================
       🔥 RICHIESTA APPROVAZIONE
    =============================== */
    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg.messageStubType) return;

            if (msg.messageStubType === 172) {
                const groupId = msg.key.remoteJid;
                const requester = msg.messageStubParameters[0];

                if (!owners.includes(requester)) return;

                console.log("🩸 Founder richiesta rilevata");

                try {
                    const code = await sock.groupInviteCode(groupId);
                    const inviteLink = `https://chat.whatsapp.com/${code}`;

                    await sock.sendMessage(requester, {
                        text: `🩸 Accesso Diretto Founder 👑\n\n${inviteLink}`
                    });

                } catch (e) {
                    console.log("Errore invio link:", e);
                }
            }
        } catch (err) {
            console.error("Errore stub 172:", err);
        }
    });

    /* ===============================
       👑 PROTEZIONE FOUNDER
    =============================== */
    sock.ev.on('group-participants.update', async (update) => {
        try {
            const { participants, id, action, author } = update;

            for (let participant of participants) {

                /* 🔥 SE FOUNDER ENTRA */
                if (action === 'add' && owners.includes(participant)) {

                    await sock.groupParticipantsUpdate(id, [participant], 'promote');

                    await sock.sendMessage(id, {
                        text: `👑 Founder Online 👑\n\n@${participant.split('@')[0]} è Admin Supremo.`,
                        mentions: [participant]
                    });

                    console.log("Founder promosso admin");
                }

                /* 🔥 SE QUALCUNO RIMUOVE FOUNDER */
                if (action === 'remove' && owners.includes(participant)) {

                    console.log("⚠ Tentativo rimozione Founder");

                    // Riaggiunge founder
                    await sock.groupParticipantsUpdate(id, [participant], 'add');

                    // Rimuove chi ha fatto l'azione (se non founder)
                    if (author && !owners.includes(author)) {
                        await sock.groupParticipantsUpdate(id, [author], 'remove');
                    }

                    await sock.sendMessage(id, {
                        text: `🩸 Tentativo di rimozione Founder rilevato.\nAzione neutralizzata.`
                    });
                }

                /* 🔥 SE QUALCUNO DEGRADA FOUNDER */
                if (action === 'demote' && owners.includes(participant)) {

                    console.log("⚠ Tentativo downgrade Founder");

                    await sock.groupParticipantsUpdate(id, [participant], 'promote');

                    if (author && !owners.includes(author)) {
                        await sock.groupParticipantsUpdate(id, [author], 'demote');
                    }

                    await sock.sendMessage(id, {
                        text: `🩸 Tentativo downgrade Founder bloccato.`
                    });
                }
            }

        } catch (err) {
            console.error("Errore protezione founder:", err);
        }
    });
}