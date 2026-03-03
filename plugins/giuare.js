// Database globale per i giullari della sessione
globalThis.sessioneGiullare = globalThis.sessioneGiullare || {};

let handler = async (m, { conn, command, participants }) => {
    let chat = m.chat;

    if (command === 'giullare') {
        // Se c'è già un giullare attivo in questa chat, non fare nulla
        if (globalThis.sessioneGiullare[chat]) {
            return m.reply(`⚠️ C'è già un povero diavolo sotto tortura. Aspetta che finisca il suo calvario.`);
        }

        let vittima;
        if (m.mentionedJid && m.mentionedJid[0]) {
            vittima = m.mentionedJid[0];
        } else {
            let members = participants.map(u => u.id).filter(v => v !== conn.user.jid);
            vittima = members[Math.floor(Math.random() * members.length)];
        }

        let nomeVittima = `@${vittima.split('@')[0]}`;
        
        // Attiva il giullare nel database globale
        globalThis.sessioneGiullare[chat] = vittima;

        let inizioMsg = `🚨 *PROTOCOLLO UMILIAZIONE ATTIVATO* 🚨\n`;
        inizioMsg += `──────────────────\n`;
        inizioMsg += `Bersaglio: ${nomeVittima}\n\n`;
        inizioMsg += `Hai *3 minuti* di vita d'inferno. Ogni tua parola sarà un proiettile che ti tornerà indietro. Buona fortuna, rifiuto. 💀`;

        await conn.sendMessage(chat, { text: inizioMsg, mentions: [vittima] });

        // Timer di 3 minuti per rimuovere il giullare
        setTimeout(async () => {
            if (globalThis.sessioneGiullare[chat]) {
                delete globalThis.sessioneGiullare[chat];
                await conn.sendMessage(chat, { text: `🎭 Il tempo è scaduto. ${nomeVittima}, striscia via prima che cambi idea.` });
            }
        }, 180000);
    }
};

// --- QUESTA PARTE DEVE ESSERE FUORI DALL'HANDLER PRINCIPALE ---
handler.before = async function (m, { conn }) {
    if (!m.chat || !m.sender || m.isBaileys) return;
    
    let chat = m.chat;
    let giullareAttivo = globalThis.sessioneGiullare[chat];

    // Se l'utente che scrive è il giullare attivo...
    if (giullareAttivo && m.sender === giullareAttivo) {
        
        const cattiverie = [
            `Ma chi ti ha dato il permesso di digitare? Sta' zitto, rifiuto umano. 🤮`,
            `Ogni tuo messaggio puzza di fallimento. Sparisci.`,
            `Non sei un giullare, sei l'intero circo. E fai pure schifo.`,
            `Il tuo quoziente intellettivo è più basso della temperatura di un cadavere. 💀`,
            `Zitto, sacco di bava. Il tuo parere vale quanto la merda. 💩`,
            `Spero che il tuo prossimo respiro sia l'ultimo così risparmiamo ossigeno. 🔫`,
            `Sei più imbarazzante di un rutto a un funerale. Chiudi quella bocca.`,
            `Tua madre si scusa ogni giorno col mondo per averti fatto nascere.`,
            `Sei l'errore genetico che Darwin non aveva previsto.`,
            `Taci, errore di sistema. La tua vita è un bug da eliminare.`,
            `Hai il cervello così piccolo che se lo metti in un guscio di noce balla il tip-tap.`,
            `Ma guardati, sei patetico. Anche la tua ombra si vergogna di te.`,
            `Sei così inutile che se sparissi ora, il gruppo festeggerebbe.`,
            `Hai la faccia di uno che ringrazia quando lo prendono a schiaffi. Verme.`,
            `Smettila di scrivere, ogni tua parola abbassa il valore della chat.`,
            `Sei così sfigato che se aprissi un'agenzia funebre la gente smetterebbe di morire.`,
            `Non sei degno nemmeno di pulire i miei circuiti, figuriamoci di parlare.`,
            `Sei un rifiuto tossico. Chiama la protezione civile e fatti smaltire.`,
            `Tua faccia è la ragione per cui gli alieni non ci visitano.`,
            `Sei la prova che Dio ha il senso dell'umorismo, ma molto cattivo. 🤡`
        ];

        let insulto = cattiverie[Math.floor(Math.random() * cattiverie.length)];
        
        // Risponde all'istante citando il messaggio
        await conn.sendMessage(chat, { text: insulto }, { quoted: m });
        return true; // Blocca altri handler per questo messaggio
    }
};

handler.help = ['giullare'];
handler.tags = ['giochi'];
handler.command = /^(giullare)$/i;
handler.group = true;

export default handler;
