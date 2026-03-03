let handler = async (m, { conn, command }) => {
  let mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  
  // Messaggio di aiuto/errore se i tag non sono corretti
  if (mentions.length < 4 || mentions.length > 15) {
    let helpText = `🔞 *BENVENUTO NELLE CRONACHE DELL'ORGIA* 🔞\n\n`;
    helpText += `Per avviare il massacro, devi menzionare da *4 a 15 persone*.\n\n`;
    helpText += `📌 *Nota:* Se preferisci, il bot può gestire tutto lui! Basta taggare i tuoi amici e io deciderò casualmente chi domina, chi subisce e chi finisce sommerso di sborra.\n\n`;
    helpText += `👉 *Esempio:* .orgia @utente1 @utente2 @utente3 @utente4`;
    
    return conn.sendMessage(m.chat, { text: helpText }, { quoted: m });
  }

  const tag = (jid) => `@${jid.split('@')[0]}`;
  
  // Mescolamento totale dei partecipanti
  let p = mentions.sort(() => Math.random() - 0.5).map(tag); 
  let sufferer = p[Math.floor(Math.random() * p.length)]; 
  
  let story = "";
  const count = mentions.length;

  switch (count) {
    case 4:
      story = `🔥 ${p[0]} blocca ferocemente le spalle di ${p[1]} mentre ${p[2]} lo sfonda con una foga animalesca; nel frattempo ${p[3]} si avventa su entrambi inondando i loro corpi di sborra e bava, in un groviglio di membra che non lascia spazio al respiro.`;
      break;
    case 5:
      story = `🔞 ${p[0]} e ${p[1]} tengono spalancato ${p[2]} esponendo ogni suo buco, mentre ${p[3]} lo penetra senza alcuna pietà; ${p[4]} osserva la scena eccitato prima di unirsi al massacro spingendo il suo seme caldo nelle gole di tutti i presenti.`;
      break;
    case 6:
      story = `⛓️ È un assalto totale: ${p[0]} domina brutalmente ${p[1]}, mentre ${p[2]} e ${p[3]} si incastrano in un treno di carne che travolge ${p[4]} con spinte sorde; ${p[5]} chiude il cerchio della lussuria marchiando ogni centimetro di pelle con il suo sperma bollente.`;
      break;
    case 7:
      story = `🤤 ${p[0]}, ${p[1]} e ${p[2]} formano un triangolo di sesso violento sopra ${p[3]}, mentre ${p[4]} e ${p[5]} si occupano di sfasciare ogni orifizio residuo di ${p[6]} in un'esplosione di gemiti e fluidi che allaga il pavimento della stanza.`;
      break;
    case 8:
      story = `🔞 ${p[0]} e ${p[1]} guidano l'assalto coordinato su ${p[2]} e ${p[3]}, mentre ${p[4]}, ${p[5]}, ${p[6]} e ${p[7]} si scambiano colpi e sborrate violente sul viso, creando un vortice di depravazione dove nessuno è risparmiato e ogni buco viene reclamato con la forza.`;
      break;
    case 9:
      story = `🌊 Nove corpi in preda al delirio: ${p[0]} strozza ${p[1]} dal piacere estremo, ${p[2]} penetra ${p[3]} con cattiveria inaudita, mentre ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]} e ${p[8]} si ammassano in un'orgia di spinte che culmina in una pioggia di sperma collettiva che li rende irriconoscibili.`;
      break;
    case 10:
      story = `🫦 La carne sbatte violentemente: ${p[0]} e ${p[1]} aprono la strada alla lussuria per ${p[2]} e ${p[3]}, mentre l'intero gruppo composto da ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]}, ${p[8]} e ${p[9]} si fonde in un unico, immenso ammasso di brividi, bava e umiliazione estrema.`;
      break;
    case 11:
      story = `🔥 Undici peccatori senza legge: ${p[0]} viene usato contemporaneamente da ${p[1]} e ${p[2]}, mentre ${p[3]}, ${p[4]} e ${p[5]} si accaniscono selvaggiamente su ${p[6]}. Il resto del branco (${p[7]}, ${p[8]}, ${p[9]}, ${p[10]}) annega ogni residuo di dignità sotto litri di seme denso e inarrestabile.`;
      break;
    case 12:
      story = `🔞 Un'apocalisse di lussuria pura: ${p[0]} e ${p[1]} dirigono i movimenti, mentre ${p[2]}, ${p[3]}, ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]}, ${p[8]}, ${p[9]}, ${p[10]} e ${p[11]} si intrecciano in posizioni impossibili, sventrando ogni buco a suon di spinte ferali e sborrate incrociate.`;
      break;
    case 13:
      story = `⛓️ Tredici ombre nel peccato: ${p[0]}, ${p[1]} e ${p[2]} guidano la carica di carne, seguiti da ${p[3]}, ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]}, ${p[8]}, ${p[9]}, ${p[10]}, ${p[11]} e ${p[12]} che si svuotano a turno l'uno dentro l'altro, creando una catena umana inzuppata di bava e sperma.`;
      break;
    case 14:
      story = `🤤 Quattordici demoni affamati: ${p[0]} urla mentre ${p[1]} lo possiede con violenza, ${p.slice(2, 8).join(', ')} creano una mischia di corpi pulsanti e ${p.slice(8).join(', ')} finiscono il lavoro sommergendo tutti i presenti con un'eiaculazione di massa che toglie il fiato.`;
      break;
    case 15:
      story = `🔞 IL MASSACRO TOTALE: Quindici corpi in fiamme. ${p.slice(0, 5).join(', ')} distruggono ogni limite su ${p.slice(5, 10).join(', ')}, mentre i restanti ${p.slice(10).join(', ')} sigillano l'orgia con una scarica di sperma che trasforma la stanza in una pozza di depravazione assoluta.`;
      break;
  }

  let responseText = `🔞 *CRONACHE DELL'ESTASI COLLETTIVA* 🔞\n\n`;
  responseText += `${story}\n\n`;
  responseText += `───────────────\n`;
  responseText += `🏆 *IL PREMIO "CARNE TRITA" DELLA SERATA:* ${sufferer}\n`;
  responseText += `*(Dopo essere stato usato, sfondato e riempito da tutti, è ufficialmente quello che ha sofferto di più per il piacere del gruppo)* 💦💀\n\n`;
  responseText += `👉 _Nota: Il bot ha scelto i ruoli casualmente. Vuoi cambiare vittima? Rilancia il comando!_`;

  await conn.sendMessage(m.chat, {
    text: responseText,
    mentions: mentions
  }, { quoted: m });
};

handler.help = ['orgia'];
handler.tags = ['giochi'];
handler.command = /^(orgia)$/i;

export default handler;
