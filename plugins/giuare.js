// Database globale per la sessione
globalThis.sessioneGiullare = globalThis.sessioneGiullare || {};

let handler = async (m, { conn, command, participants }) => {
    const chat = m.chat;

    if (command === 'giullare') {
        if (globalThis.sessioneGiullare[chat]) {
            return m.reply(`⚠️ C'è già una vittima sotto tortura.`);
        }

        let vittima;
        if (m.mentionedJid && m.mentionedJid[0]) {
            vittima = m.mentionedJid[0];
        } else {
            let members = participants.map(u => u.id).filter(v => v !== conn.user.jid);
            vittima = members[Math.floor(Math.random() * members.length)];
        }

        const nomeVittima = `@${vittima.split('@')[0]}`;
        globalThis.sessioneGiullare[chat] = vittima;

        let inizioMsg = `🚨 *PROTOCOLLO UMILIAZIONE ATTIVATO* 🚨\n`;
        inizioMsg += `Bersaglio: ${nomeVittima}\n\n`;
        inizioMsg += `Ogni tua parola sarà punita. Hai 3 minuti di inferno. 🤡💀`;

        await conn.sendMessage(chat, { text: inizioMsg, mentions: [vittima] });

        // Timer di 3 minuti
        setTimeout(async () => {
            if (globalThis.sessioneGiullare[chat]) {
                delete globalThis.sessioneGiullare[chat];
                await conn.sendMessage(chat, { text: `🎭 Il tempo è scaduto per ${nomeVittima}.` });
            }
        }, 180000);
    }
};

// Logica di risposta automatica
handler.before = async function (m, { conn }) {
    if (!m.chat || !m.sender || m.isBaileys) return;
    
    const chat = m.chat;
    const giullareAttivo = globalThis.sessioneGiullare[chat];

    if (giullareAttivo && m.sender === giullareAttivo) {
        // Reazione immediata
        await conn.sendMessage(chat, { react: { text: "🤡", key: m.key } });

        const insulti = [
            "Zitto, sacco di bava. 🤮", "Ancora parli? Fai schifo.", "Sei un errore genetico. 🤡",
            "Il tuo quoziente intellettivo è un bug. 💀", "Taci, rifiuto umano.", "Patetico.",
            "Qualcuno tiri lo sciacquone! 🚽", "Utile quanto un semaforo spento.", "Tua madre si vergogna di te. 💩",
            "Mi sporchi il database.", "Sei lo zimbello ufficiale.", "Spero che il tuo telefono esploda. 💣",
            "Vuoto a perdere biologico.", "Mangi i sassi per colazione? 🪨", "Zitto e mangia la merda.",
            "Concentrato di mediocrità.", "Ti fai insultare da un bot, sfigato.", "Profondità di un piattino.",
            "Hai deluso persino un computer.", "Stai zitto, aborto mancato. 🤮", "Tuo padre ha fatto bene a scappare.",
            "Fastidioso come la sabbia nel culo.", "Insulto all'evoluzione.", "Errore genetico.",
            "Gli alieni non ci visitano per colpa tua.", "Ombrello bucato.", "Vai a giocare sull'autostrada.",
            "Il tuo specchio ha chiesto il divorzio.", "Vendi ghiaccio al Polo Nord, vai.", "Macchia di unto sociale.",
            "Ammaso informe di molecole.", "Noioso come un documentario sui sassi.", "Bug vivente.",
            "Carisma di una melanzana.", "Personificazione del nulla.", "Albero genealogico a cerchio. 🎡",
            "L'ombra si vergogna di te.", "Spero ti si rompa il caricabatterie.", "Fallimento ISO 9001.",
            "Sprechi ossigeno utile.", "Cerchi di scorrere le foto sui libri. 📖", "Sacco di bava.",
            "Grazia di un elefante.", "Scherzo della natura.", "La solitudine ti rifiuta.",
            "Fatti un bagno nell'acido.", "Prototipo venuto male. 🤮", "Sei un insulto vivente.",
            "Taci, rifiuto.", "Sparisci dalla mia vista."
        ];

        const scelto = insulti[Math.floor(Math.random() * insulti.length)];
        await conn.sendMessage(chat, { text: scelto }, { quoted: m });
    }
    return true;
};

handler.command = /^(giullare)$/i;
handler.group = true;

export default handler;
