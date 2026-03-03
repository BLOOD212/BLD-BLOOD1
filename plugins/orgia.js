let handler = async (m, { conn, command }) => {
  let mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  
  if (mentions.length < 4 || mentions.length > 15) {
    return conn.sendMessage(m.chat, { 
      text: "❌ *Errore:* Per un'orgia degna di questo nome devi menzionare da 4 a 15 persone!" 
    }, { quoted: m });
  }

  const tag = (jid) => `@${jid.split('@')[0]}`;
  let shuffled = mentions.sort(() => Math.random() - 0.5);
  let v = tag(shuffled[0]); // La vittima
  let p = shuffled.slice(1).map(tag); // Gli altri partecipanti
  
  let story = "";
  const count = mentions.length;

  switch (count) {
    case 4:
      story = `🔥 L'aria è densa di desiderio: ${p[0]} e ${p[1]} bloccano le braccia di ${v} contro il materasso, annullando ogni sua resistenza. Mentre i loro corpi sudati si scontrano, ${p[2]} prende posizione e lo sfonda con spinte sorde e violente, godendo del riverbero dei colpi sulla carne di ${v}, che ormai riesce solo a emettere gemiti strozzati.`;
      break;
    case 5:
      story = `🔞 In un angolo buio, ${p[0]} afferra ${v} per i capelli costringendolo a guardare mentre ${p[1]} lo penetra brutalmente da dietro. Nel frattempo, ${p[2]} e ${p[3]} non perdono tempo e gli riempiono la bocca e la faccia di sborra calda, trasformando ${v} in un trofeo di lussuria collettiva, umiliato e posseduto da ogni lato.`;
      break;
    case 6:
      story = `⛓️ È una carneficina di piacere: ${p[0]}, ${p[1]} e ${p[2]} formano un cerchio di carne attorno a ${v}, alternandosi nei suoi buchi senza lasciargli un secondo di respiro. Mentre le spinte diventano sempre più animalesche, ${p[3]} e ${p[4]} lo tengono bloccato a terra, sborrandogli ripetutamente sul petto e sulla gola, marchiandolo come la loro proprietà privata per tutta la notte.`;
      break;
    case 7:
      story = `🤤 ${v} è ormai ridotto a un ammasso di brividi: ${p[0]} e ${p[1]} si occupano di aprirlo davanti, mentre ${p[2]} lo spacca letteralmente dietro con una foga disumana. Il resto del branco — ${p[3]}, ${p[4]} e ${p[5]} — circonda la scena incitando alla violenza e inondando il corpo di ${v} con litri di seme bollente, finché l'odore del sesso non riempie l'intera stanza.`;
      break;
    case 8:
      story = `🔞 Otto corpi, zero pietà: ${p[0]} e ${p[1]} hanno preso il controllo totale della testa di ${v}, mentre ${p[2]} lo usa come un giocattolo rotto. Dietro di loro, ${p[3]}, ${p[4]}, ${p[5]} e ${p[6]} premono con i loro cazzi pronti, pronti a entrare a turno in ${v} mentre la sua schiena si inarca per il dolore e il piacere estremo di essere usato da così tanti uomini insieme.`;
      break;
    case 9:
      story = `🌊 La depravazione è totale: ${p[0]} domina la gola profonda di ${v}, facendolo quasi soffocare, mentre ${p[1]} e ${p[2]} lo penetrano in combo. Gli altri partecipanti (${p[3]}, ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]}) osservano i buchi di ${v} spalancarsi sotto la forza dei colpi, preparandosi a inondarlo con un'eiaculazione di gruppo che lo lascerà completamente sommerso e tremante.`;
      break;
    case 10:
      story = `🫦 ${v} è diventato il secchio della sborra ufficiale: ${p[0]}, ${p[1]}, ${p[2]}, ${p[3]} e ${p[4]} lo tengono sollevato da terra mentre ${p[5]}, ${p[6]}, ${p[7]}, ${p[8]} e ${p[9]} lo colpiscono a turno con spinte che fanno tremare le pareti. Non c'è più spazio per le parole, solo il rumore della carne che sbatte contro la carne e i versi animali di chi sta perdendo ogni briciolo di dignità.`;
      break;
    case 11:
      story = `🔥 Undici uomini inferociti: ${p[0]} e ${p[1]} spalancano le gambe di ${v} fino al limite, permettendo a ${p[2]}, ${p[3]}, ${p[4]} e ${p[5]} di svuotarsi a ripetizione dentro di lui. Nel frattempo, ${p[6]}, ${p[7]}, ${p[8]}, ${p[9]} e ${p[10]} coprono ogni centimetro della sua pelle di sperma denso, trasformando ${v} in una bambola di carne usata e abusata dal branco.`;
      break;
    case 12:
      story = `🔞 Un'orgia monumentale: ${v} sparisce sotto il peso di dodici corpi. ${p[0]}, ${p[1]}, ${p[2]}, ${p[3]}, ${p[4]} e ${p[5]} si accaniscono sui suoi orifizi con una ferocia mai vista, mentre ${p[6]}, ${p[7]}, ${p[8]}, ${p[9]}, ${p[10]} e ${p[11]} urlano per il piacere mentre gli sborrano negli occhi, in bocca e ovunque ci sia un millimetro di pelle libera.`;
      break;
    case 13:
      story = `⛓️ Tredici persone e una sola vittima: ${v} viene messo a pecora al centro del cerchio, mentre ${p[0]}, ${p[1]}, ${p[2]}, ${p[3]}, ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]}, ${p[8]}, ${p[9]}, ${p[10]}, ${p[11]} e ${p[12]} lo usano come un unico, immenso contenitore per la loro lussuria. Le pareti sudano, l'aria manca, e ${v} può solo subire l'umiliazione più profonda della sua vita.`;
      break;
    case 14:
      story = `🤤 Quattordici uomini dominanti: ${p[0]} e ${p[1]} tengono la bocca di ${v} spalancata con la forza, mentre l'intero gruppo — ${p.slice(2).join(', ')} — si alterna a penetrarlo e sborrargli dentro con una violenza che lo lascia privo di sensi. Ogni buco di ${v} è ormai sfasciato, colmo del seme di quattordici maschi che non conoscono la parola basta.`;
      break;
    case 15:
      story = `🔞 L'APOCALISSE DELLA CARNE: Quindici persone distruggono ogni tabù. ${v} viene letteralmente sommerso da una montagna di muscoli e sesso. ${p.slice(0, 7).join(', ')} lo penetrano a turno in un ciclo infinito di dolore e godimento, mentre ${p.slice(7).join(', ')} lo annegano sotto un'ondata di sborra collettiva che trasforma la stanza in una pozza di peccato puro.`;
      break;
  }

  let responseText = `🔞 *CRONACHE DI UN'ORGIA DI GRUPPO* 🔞\n\n`;
  responseText += `${story}\n\n`;
  responseText += `───────────────\n`;
  responseText += `⬇️ *IL FONDO DELLA CATENA (SOTTO TUTTI):* ${v}\n`;
  responseText += `*(Stasera sei la troia del gruppo. Non hai diritti, non hai voce. Sei solo un buco pronto a ricevere tutto il seme dei presenti fino allo sfinimento)* 💦🕳️`;

  await conn.sendMessage(m.chat, {
    text: responseText,
    mentions: mentions
  }, { quoted: m });
};

handler.help = ['orgia'];
handler.tags = ['giochi'];
handler.command = /^(orgia)$/i;

export default handler;
