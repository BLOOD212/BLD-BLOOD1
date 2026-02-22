//plug-in by blood

const { owners } = require('./config');

// Funzione per gestire l'evento quando i partecipanti cambiano nel gruppo
async function handleGroupParticipantsUpdate(sock, update) {
    const { participants, groupId, action } = update;

    // Verifica se l'azione è 'add' (un membro entra nel gruppo)
    if (action === 'add') {
        for (let participant of participants) {
            if (owners.includes(participant)) {
                try {
                    console.log(`Aggiungendo owner ${participant} al gruppo ${groupId}`);
                    // Aggiungi l'owner automaticamente al gruppo
                    await sock.groupAdd(groupId, [participant]);
                } catch (error) {
                    console.error(`Errore nell'aggiungere ${participant}: ${error.message}`);
                }
            }
        }
    }
}

// Aggiungi il gestore dell'evento al tuo bot
module.exports = function (sock) {
    sock.ev.on('group-participants.update', (update) => {
        handleGroupParticipantsUpdate(sock, update);
    });
};