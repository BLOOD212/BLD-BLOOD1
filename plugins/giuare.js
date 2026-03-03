let giullari = {};

let handler = async (m, { conn, command, text, participants }) => {
    let chat = m.chat;

    if (command === 'giullare') {
        let vittima;
        
        if (m.mentionedJid && m.mentionedJid[0]) {
            vittima = m.mentionedJid[0];
        } else {
            let members = participants.map(u => u.id).filter(v => v !== conn.user.jid);
            vittima = members[Math.floor(Math.random() * members.length)];
        }

        if (giullari[chat]) return m.reply(`⚠️ C'è già un povero diavolo sotto tortura. Aspetta che il bot finisca di distruggerlo.`);

        let nomeVittima = `@${vittima.split('@')[0]}`;
        giullari[chat] = vittima;

        let inizioMsg = `🚨 *PROTOCOLLO UMILIAZIONE ATTIVATO* 🚨\n`;
        inizioMsg += `──────────────────\n`;
        inizioMsg += `Bersaglio: ${nomeVittima}\n\n`;
        inizioMsg += `Hai *3 minuti* di autonomia prima che la tua dignità scompaia per sempre. Ogni tua parola sarà un proiettile che ti tornerà indietro. Buona fortuna, rifiuto. 💀`;

        await conn.sendMessage(chat, { text: inizioMsg, mentions: [vittima] });

        setTimeout(async () => {
            if (giullari[chat]) {
                delete giullari[chat];
                await conn.sendMessage(chat, { text: `🎭 Il tempo è scaduto. ${nomeVittima}, striscia via prima che cambi idea e ricominci.` });
            }
        }, 180000);
    }
};

handler.before = async function (m, { conn }) {
    let chat = m.chat;
    if (!giullari[chat] || m.sender !== giullari[chat] || m.isBaileys) return;

    const insulti = [
        `Ma chi ti ha dato il permesso di digitare con quelle dita sporche? Sta' zitto, rifiuto umano. 🤮`,
        `Tua madre si scusa ogni giorno col mondo per averti messo al mondo.`,
        `Sei l'esempio vivente che il preservativo è un'invenzione fondamentale. 🤡`,
        `Ogni tuo messaggio puzza di fallimento e frustrazione. Sparisci.`,
        `Non sei un giullare, sei l'intero circo. E fai pure schifo come fenomeno da baraccone.`,
        `Il tuo quoziente intellettivo è più basso della temperatura di un cadavere. 💀`,
        `Perché continui a scrivere? Cerchi attenzioni perché nessuno ti ama nella vita reale?`,
        `Zitto, sacco di bava. Il tuo parere vale quanto un soldo bucato in mezzo alla merda. 💩`,
        `Ma non ti senti un coglione a farti insultare da un codice? Sei un subumano.`,
        `Sei la prova che l'evoluzione a volte torna indietro. Sei un primate con lo smartphone. 🐒`,
        `Spero che il tuo prossimo respiro sia l'ultimo così risparmiamo ossigeno utile. 🔫`,
        `Sei più imbarazzante di un rutto a un funerale. Chiuditi quella bocca da cesso.`,
        `Tutti in questo gruppo ridono di te, non con te. Sei lo zimbello ufficiale. 🤡`,
        `Hai la faccia di uno che ringrazia quando lo prendono a schiaffi. Verme.`,
        `Ti hanno mai detto che sei carismatico come una macchia di umidità sul soffitto?`,
        `Sei così insignificante che se ti cancellassi ora, persino i tuoi ricordi sparirebbero.`,
        `Hai il cervello così piccolo che se lo metti in un guscio di noce balla il tip-tap.`,
        `Ma guardati, sei patetico. Anche la tua ombra si vergogna di seguirti.`,
        `Il tuo contributo a questo gruppo è utile quanto un ombrello bucato.`,
        `Ma perché non vai a giocare a nascondino in un campo minato? 💣`,
        `Sei l'errore genetico che Darwin non aveva previsto.`,
        `Hai la profondità intellettuale di una pozzanghera d'estate.`,
        `Smettila di digitare, ogni tua parola abbassa il valore commerciale del mio server.`,
        `Tua madre ha fatto un errore, ma tu sei riuscito a fare di peggio: esistere ancora.`,
        `Sei così brutto che quando sei nato l'ostetrico ha dato lo schiaffo ai tuoi genitori.`,
        `Sei un vuoto a perdere biologico.`,
        `Non sei nemmeno un essere umano, sei un prototipo venuto male. 🤮`,
        `Taci, errore di sistema. La tua vita è un bug che non vale la pena fixare.`,
        `Sei così noioso che persino l'insonnia guarirebbe guardando una tua foto.`,
        `Tutti qui fingono di sopportarti, ma in realtà sperano che il tuo telefono esploda.`,
        `Hai lo spirito di un calzino bucato e il fascino di un bidone della spazzatura.`,
        `Ma non ti stanchi mai di essere così incredibilmente stupido? È un lavoro a tempo pieno?`,
        `Sei la prova che Dio ha il senso dell'umorismo, ma molto cattivo. 🤡`,
        `Hai la capacità mentale di un tostapane spento.`,
        `Non sei degno nemmeno di pulire i circuiti del mio bot, figuriamoci di parlare.`,
        `Sei un rifiuto tossico per l'umanità. Chiama la protezione civile e fatti smaltire.`,
        `Il tuo unico talento è far scendere il latte alle ginocchia a chiunque ti legga.`,
        `Sei talmente inutile che persino la solitudine ti rifiuta.`,
        `Sei così sfigato che se aprissi un'agenzia di pompe funebri la gente smetterebbe di morire.`,
        `Ma va' a vendere il ghiaccio al Polo Nord, almeno lì avresti un senso.`,
        `Non sei un uomo, sei una macchia di unto sulla camicia della società. 🤮`,
        `La tua intelligenza sta facendo una maratona, ma purtroppo è partita nella direzione opposta.`,
        `Tua faccia è la ragione per cui gli alieni non ci hanno ancora visitato.`,
        `Sei più fastidioso di un granello di sabbia nelle mutande.`,
        `Spero che il tuo caricabatterie si rompa nel momento del bisogno, come hai fatto tu con la pazienza del gruppo.`,
        `Sei la personificazione del 'vabbè, fa niente'.`,
        `Il tuo albero genealogico dev'essere un cerchio perfetto, visti i risultati. 🎡`,
        `Sei così privo di personalità che potresti essere sostituito da un post-it bianco.`,
        `Taci, ammasso informe di molecole sprecate.`,
        `Il tuo cervello è in modalità aereo da quando sei nato? ✈️`,
        `Ma fatti un favore, vai a fare un bagno nell'acido, magari ti pulisci un po' l'anima.`
    ];

    let risposta = insulti[Math.floor(Math.random() * insulti.length)];
    await conn.sendMessage(chat, { text: risposta }, { quoted: m });
};

handler.help = ['giullare'];
handler.tags = ['giochi'];
handler.command = /^(giullare)$/i;
handler.group = true;

export default handler;
