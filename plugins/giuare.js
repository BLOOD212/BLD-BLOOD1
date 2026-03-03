//plug-in by blood 
global.sessioneGiullare = global.sessioneGiullare || {};

let handler = async (m, { conn, command, participants }) => {
    const chat = m.chat;

    // Comando attivazione
    if (command === 'giullare') {
        if (global.sessioneGiullare[chat]) {
            return conn.reply(chat, `⚠️ C'è già una vittima sotto tortura. Aspetta che finisca.`, m);
        }

        let vittima;
        if (m.mentionedJid && m.mentionedJid[0]) {
            vittima = m.mentionedJid[0];
        } else {
            // Se non tagga nessuno, sceglie un utente a caso (escludendo il bot)
            let members = participants.map(u => u.id).filter(v => v !== conn.user.jid);
            vittima = members[Math.floor(Math.random() * members.length)];
        }

        const nomeVittima = `@${vittima.split('@')[0]}`;
        global.sessioneGiullare[chat] = vittima;

        let inizioMsg = `🚨 *PROTOCOLLO UMILIAZIONE ATTIVATO* 🚨\n`;
        inizioMsg += `──────────────────\n`;
        inizioMsg += `Bersaglio acquisito: ${nomeVittima}\n\n`;
        inizioMsg += `Hai *3 minuti* di vita d'inferno. Ogni tua parola sarà punita all'istante con insulti e fango. Non provare a scappare. 🤡💀`;

        await conn.sendMessage(chat, { text: inizioMsg, mentions: [vittima] }, { quoted: m });

        // Timer di 3 minuti (180.000 ms)
        setTimeout(async () => {
            if (global.sessioneGiullare[chat]) {
                delete global.sessioneGiullare[chat];
                await conn.sendMessage(chat, { text: `🎭 Il tempo è scaduto per ${nomeVittima}. Puoi tornare a strisciare nella tua mediocrità.` });
            }
        }, 180000);
    }
};

// Logica di risposta automatica (SI ESEGUE SU OGNI MESSAGGIO)
handler.before = async function (m, { conn }) {
    if (!m.chat || !m.sender || m.isBaileys) return;
    
    const chat = m.chat;
    const giullareAttivo = global.sessioneGiullare[chat];

    // Se l'autore del messaggio è il Giullare scelto
    if (giullareAttivo && m.sender === giullareAttivo) {
        
        // 1. Reazione immediata 🤡
        try {
            await conn.sendMessage(chat, { react: { text: "🤡", key: m.key } });
        } catch (e) {
            console.error("Errore reazione:", e);
        }

        // 2. Database 50 Insulti Spaventosi
        const insulti = [
            "Zitto, sacco di bava. 🤮", "Ancora parli? Fai schifo.", "Sei un errore genetico. 🤡",
            "Il tuo quoziente intellettivo è un bug. 💀", "Taci, rifiuto umano.", "Patetico.",
            "Qualcuno tiri lo sciacquone! 🚽", "Utile quanto un semaforo spento.", "Tua madre si vergogna di te. 💩",
            "Mi sporchi il database con la tua sfiga.", "Sei lo zimbello ufficiale.", "Spero che il tuo telefono esploda ora. 💣",
            "Vuoto a perdere biologico.", "Mangi i sassi per colazione? 🪨", "Zitto e mangia la merda che ti tiriamo addosso.",
            "Concentrato di mediocrità. Sparisci.", "Ti fai insultare da un bot, sfigato totale.", "Profondità di un piattino da caffè.",
            "Hai deluso persino un computer, che traguardo di merda.", "Stai zitto, aborto mancato. 🤮", "Tuo padre ha fatto bene a scappare.",
            "Fastidioso come la sabbia nel culo.", "Sei un insulto vivente all'evoluzione.", "Errore genetico senza rimedio.",
            "Gli alieni non ci visitano per colpa tua.", "Utile come un ombrello bucato.", "Vai a giocare sull'autostrada, magari vinci un premio.",
            "Il tuo specchio ha chiesto il divorzio.", "Vai a vendere il ghiaccio al Polo Nord, fallito.", "Macchia di unto sociale.",
            "Ammaso informe di molecole sprecate.", "Noioso come un documentario sui sassi.", "Bug vivente che non vale la pena fixare.",
            "Carisma di una melanzana ammuffita.", "Personificazione del nulla cosmico.", "Albero genealogico a cerchio perfetto. 🎡",
            "Persino la tua ombra si vergogna di seguirti.", "Spero ti si rompa il caricabatterie per sempre.", "Fallimento certificato ISO 9001.",
            "Sprechi ossigeno utile ad altri.", "Sei così stupido che cerchi di scorrere le foto sui libri. 📖", "Sacco di bava inutile.",
            "Grazia di un elefante in una cristalleria.", "Scherzo della natura venuto male.", "La solitudine ti rifiuta per quanto sei sfigato.",
            "Fatti un bagno nell'acido, magari ti pulisci l'anima.", "Prototipo di essere umano venuto male. 🤮", "Sei un insulto alla razza umana.",
            "Taci, rifiuto della società.", "Sparisci dalla mia vista, mi dai il voltastomaco.", "Tua faccia è un crimine contro l'umanità.",
            "Sei la prova che Dio ha un senso dell'umorismo crudele.", "Zitto, verme.", "Il tuo cervello è in sciopero permanente."
        ];

        const scelto = insulti[Math.floor(Math.random() * insulti.length)];
        
        // 3. Risposta immediata
        await conn.sendMessage(chat, { text: scelto }, { quoted: m });
    }
    return true;
};

handler.help = ['giullare'];
handler.tags = ['giochi'];
handler.command = /^(giullare)$/i;
handler.group = true;

export default handler;
