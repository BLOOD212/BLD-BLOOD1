let handler = async (m, { conn, command, participants }) => {
  let mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  
  // LOGICA PER COMANDO CASUALE
  if (command.toLowerCase() === 'orgiacasuale' || command.toLowerCase() === 'orgiarandom') {
    // Prende i membri del gruppo escludendo il bot stesso
    let groupMembers = participants.map(u => u.id).filter(v => v !== conn.user.jid);
    
    // Sceglie un numero casuale di partecipanti tra 4 e 15
    let randomCount = Math.floor(Math.random() * (15 - 4 + 1)) + 4;
    
    // Se il gruppo ha meno persone del numero scelto, le prende tutte (minimo 4)
    let finalCount = Math.min(randomCount, groupMembers.length);
    
    if (finalCount < 4) {
        return conn.sendMessage(m.chat, { text: "❌ *Errore:* Ci devono essere almeno 4 persone nel gruppo per iniziare il massacro!" }, { quoted: m });
    }

    // Seleziona i membri casuali
    mentions = groupMembers.sort(() => Math.random() - 0.5).slice(0, finalCount);
  }

  // VALIDAZIONE PER COMANDO MANUALE
  if (mentions.length < 4 || mentions.length > 15) {
    let helpText = `🔞 *BENVENUTO NELLE CRONACHE DELL'ORGIA* 🔞\n\n`;
    helpText += `Per il massacro manuale, tagga da *4 a 15 persone*.\n\n`;
    helpText += `🎲 *MODALITÀ CASUALE:* Digita *.orgiacasuale* e sceglierò io da 4 a 15 vittime tra i presenti!\n\n`;
    helpText += `👉 *Esempio:* .orgia @utente1 @utente2 @utente3 @utente4`;
    
    return conn.sendMessage(m.chat, { text: helpText }, { quoted: m });
  }

  const tag = (jid) => `@${jid.split('@')[0]}`;
  
  // Mescolamento e selezione "eroe del dolore"
  let p = mentions.sort(() => Math.random() - 0.5).map(tag); 
  let sufferer = p[Math.floor(Math.random() * p.length)]; 
  
  let story = "";
  const count = mentions.length;

  // Racconti dinamici (Da 4 a 15)
  switch (count) {
    case 4:
      story = `🔥 ${p[0]} blocca ferocemente le spalle di ${p[1]} mentre ${p[2]} lo sfonda con una foga animalesca; nel frattempo ${p[3]} si avventa su entrambi inondando i loro corpi di sborra e bava, in un groviglio di membra senza respiro.`;
      break;
    case 5:
      story = `🔞 ${p[0]} e ${p[1]} tengono spalancato ${p[2]} esponendo ogni suo buco, mentre ${p[3]} lo penetra senza alcuna pietà; ${p[4]} osserva la scena eccitato prima di unirsi al massacro spingendo il suo seme caldo nelle loro gole.`;
      break;
    case 6:
      story = `⛓️ Assalto totale: ${p[0]} domina brutalmente ${p[1]}, mentre ${p[2]} e ${p[3]} si incastrano in un treno di carne che travolge ${p[4]} con spinte sorde; ${p[5]} chiude il cerchio marchiando tutti con il suo sperma bollente.`;
      break;
    case 7:
      story = `🤤 ${p[0]}, ${p[1]} e ${p[2]} formano un triangolo di sesso violento sopra ${p[3]}, mentre ${p[4]} e ${p[5]} si occupano di sfasciare ogni orifizio di ${p[6]} in un'esplosione di gemiti e fluidi che allaga tutto.`;
      break;
    case 8:
      story = `🔞 ${p[0]} e ${p[1]} guidano l'assalto coordinato su ${p[2]} e ${p[3]}, mentre ${p[4]}, ${p[5]}, ${p[6]} e ${p[7]} si scambiano colpi e sborrate violente sul viso, creando un vortice di depravazione assoluta.`;
      break;
    case 9:
      story = `🌊 Nove corpi nel delirio: ${p[0]} strozza ${p[1]} dal piacere estremo, ${p[2]} penetra ${p[3]} con cattiveria inaudita, mentre ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]} e ${p[8]} si ammassano in una pioggia di sperma collettiva.`;
      break;
    case 10:
      story = `🫦 La carne sbatte: ${p[0]} e ${p[1]} aprono la strada alla lussuria per ${p[2]} e ${p[3]}, mentre l'intero gruppo composto da ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]}, ${p[8]} e ${p[9]} si fonde in un immenso ammasso di bava e umiliazione.`;
      break;
    case 11:
      story = `🔥 Undici peccatori: ${p[0]} viene usato da ${p[1]} e ${p[2]}, mentre ${p[3]}, ${p[4]} e ${p[5]} si accaniscono selvaggiamente su ${p[6]}. Il resto del branco (${p[7]}, ${p[8]}, ${p[9]}, ${p[10]}) annega ogni dignità sotto litri di seme denso.`;
      break;
    case 12:
      story = `🔞 Apocalisse di lussuria: ${p[0]} e ${p[1]} dirigono i movimenti, mentre ${p[2]}, ${p[3]}, ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]}, ${p[8]}, ${p[9]}, ${p[10]} e ${p[11]} si intrecciano in posizioni impossibili sventrando ogni buco residuo.`;
      break;
    case 13:
      story = `⛓️ Tredici ombre nel peccato: ${p[0]}, ${p[1]} e ${p[2]} guidano la carica, seguiti da ${p[3]}, ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]}, ${p[8]}, ${p[9]}, ${p[10]}, ${p[11]} e ${p[12]} che si svuotano l'uno dentro l'altro in una catena di bava e sperma.`;
      break;
    case 14:
      story = `🤤 Quattordici demoni: ${p[0]} urla mentre ${p[1]} lo possiede con violenza, ${p.slice(2, 8).join(', ')} creano una mischia di corpi pulsanti e ${p.slice(8).join(', ')} sommergono tutti con un'eiaculazione di massa.`;
      break;
    case 15:
      story = `🔞 MASSACRO TOTALE: Quindici corpi in fiamme. ${p.slice(0, 5).join(', ')} distruggono ogni limite su ${p.slice(5, 10).join(', ')}, mentre i restanti ${p.slice(10).join(', ')} sigillano l'orgia con una scarica di sperma assoluta.`;
      break;
  }

  let responseText = `🔞 *CRONACHE DELL'ESTASI COLLETTIVA* 🔞\n`;
  if (command.includes('casuale')) responseText += `🎲 _Modalità Casuale: ${count} partecipanti estratti_\n\n`;
  
  responseText += `${story}\n\n`;
  responseText += `───────────────\n`;
  responseText += `🏆 *IL PREMIO "CARNE TRITA" DELLA SERATA:* ${sufferer}\n`;
  responseText += `*(Dopo essere stato usato e riempito da tutti, è ufficialmente quello che ha sofferto di più per il piacere del gruppo)* 💦💀`;

  await conn.sendMessage(m.chat, {
    text: responseText,
    mentions: mentions
  }, { quoted: m });
};

handler.help = ['orgia', 'orgiacasuale'];
handler.tags = ['giochi'];
handler.command = /^(orgia|orgiacasuale|orgiarandom)$/i;

export default handler;
 