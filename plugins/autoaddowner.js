import { owners } from './config.js'; // Use import instead of require

// Funzione per gestire l'evento quando i partecipanti cambiano nel gruppo
async function handleGroupParticipantsUpdate(sock, update) {
    const { participants, groupId, action } = update;

    // Verifica se l'azione è 'add' (un membro entra nel gruppo)
    if (action === 'add') {
        for (let participant of participants) {
            if (owners.includes(participant)) {
                try {
                    console.log(`Owner ${participant} sta cercando di entrare nel gruppo ${groupId}`);
                    
                    // Il bot approva automaticamente la richiesta di partecipazione dell'owner
                    await sock.groupParticipantApprove(groupId, participant); // Metodo ipotetico
                    console.log(`La richiesta di partecipazione per ${participant} è stata accettata nel gruppo ${groupId}`);
                } catch (error) {
                    console.error(`Errore nell'accettare la richiesta di partecipazione per ${participant}: ${error.message}`);
                }
            }
        }
    }
}

// Aggiungi il gestore dell'evento al tuo bot
export default function (sock) {
    sock.ev.on('group-participants.update', (update) => {
        handleGroupParticipantsUpdate(sock, update).catch(error => {
            console.error(`Errore durante il trattamento dell'evento: ${error.message}`);
        });
    });
}