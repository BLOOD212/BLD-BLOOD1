let handler = async (m, {
  conn, text
  }) => {
  if (!m.isGroup)
  throw ''
  let gruppi = global.db.data.chats[m.chat]
  if (gruppi.spacobot === false)
  throw ''
  let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
  if (!menzione) throw 'Cu vo pigghiari po culu?'
  if (menzione === conn.user.jid) {
      const botInsults = [
  '*speci ri cosu moncu spakkiu sta scrivennu ca hai 40anni e ancora tarrti i baddi*',
        '*cunnutu tu to oma to opa da sucaminchi ri to soru e tutta a to razza*',
        '*ancora sta parannu? ma quannu cia tagghi ri ncucchiari minchiati e tuoccuchi npocu*',
        '*mammoriri si accussi lariu ca quannu nascisti u dutturi ti resi na pirata pi fariti tunnari intra*',
        '*hai chiu conna tu ca na pignata ri vaccareddi*',
        '*pigghiari po culu a tia e comu pigghialla ndo culu, pi picca cridtiani*',
        '*mbare ma non taffrunti? pisi 600kila hai 40anni e ancora fai u lesu areri du speci ri telefunu ra fera*',
        '*figghiu ri setti sucaminchi si chiu lariu ra motti buttama*',
        '*insultarti in dialetto sarebbe uno spreco di tempo e un insulto verso il catanese ietta sangu*',
        '*maffruntu a pigghiariti po culu*'
  ];
  
   
    }
  conn.reply(m.chat, `@${menzione.split`@`[0]} ${pickRandom(['tua mamma fa talmente schifo che deve dare il viagra al suo vibratore','sei talmente negro che Carlo Conti al confronto è biancaneve','sei così brutto che tua madre da piccolo non sapeva se prendere una culla o una gabbia','sei simpatico come un grappolo di emorroidi','ti puzza talmente l`alito che la gente scoreggia per cambiare aria','tua madre prende più schizzi di uno scoglio','tua mamma fa talmente schifo che deve dare il viagra al suo vibratore','meglio un figlio in guerra che un coglione con i risvoltini come te','tua madre è come Super Mario, salta per prendere i soldi','Hai meno neuroni di un panino al latte, e sono pure senza glutine.',' sei così brutto che quando preghi Gesù si mette su invisibile','Sei così poco fotogenico che i filtri di Instagram ti bloccano per proteggere gli utenti.','sei talmente negro che Carlo Conti al confronto è biancaneve','sei così brutto che tua madre da piccolo non sapeva se prendere una culla o una gabbia','le tue scorregge fanno talmente schifo che il big bang a confronto sembra una loffa','ti puzza la minchia','il buco del culo di tua madre ha visto più palle dei draghetti di bubble game','il buco del culo di tua madre ha visto più palle dei draghetti di bubble game','di a tua madre di smettere di cambiare rossetto! Ho il pisello che sembra un arcobaleno!','se ti vede la morte dice che è arrivato il cambio','hai il buco del culo con lo stesso diametro del traforo della manica','tua madre è come il sole, batte sempre sulle strade','dall`alito sembra che ti si sia arenato il cadavere di un`orca in gola','tua madre cavalca più di un fantino','sei così cornuto che se ti vede un cervo va in depressione','non ti picchio solo perchè la merda schizza!','tua mamma è come gli orsi: sempre in cerca di pesce','Sei così sfigato che se compri un biglietto della lotteria, vinci un debito.','sei cosí brutto che i tuoi ti danno da mangiare con la fionda','sei cosí brutto che i tuoi ti danno da mangiare con la fionda','sei così brutto che quando accendi il computer si attiva subito l`antivirus',' tua madre è così grassa che è stata usata come controfigura dell`iceberg in Titanic','La tua famiglia è così povera che i topi lasciano elemosina sotto il frigorifero.','sei così troia che se fossi una sirena riusciresti lo stesso ad aprire le gambe','tua madre è così vacca che in India la fanno sacra','sei talmente rompipalle che l`unico concorso che vinceresti è miss stai ropendo le palle','tua mamma è come il Mars, momento di vero godimento','sei talmente zoccola che se ti dicono batti il 5 controlli subito l`agenda','sei così brutto che se ti vede la morte si gratta le palle','La tua famiglia è così povera che i topi lasciano elemosina sotto il frigorifero.','tua madre è come la Grecia, ha un buco gigante che non vuole smettere di allargarsi','hai più corna tu, che un secchio di lumache','sei simpatico come un dito in culo e puzzi pure peggio','sei così brutto che quando lanci un boomerang non torna','sei utile come una stufa in estate','sei così odioso che se gianni Morandi ti dovesse abbracciare lo farebbe solo per soffocarti','sei utile come un culo senza il buco','sei utile come una stufa in estate','sei utile come un paio di mutande in un porno','sei fastidioso come un chiodo nel culo','sei utile quanto una laurea in Lettere & Filosofia','a te la testa serve solo per tener distaccate le orecchie','tua madre è così suora che si inchina ad ogni cappella','hai visto più piselli te de na zuppa der casale','sei cosi brutto che se ti vede il gatto nero si gratta le palle e gira langolo','sei talmente sfigato che se ti cade l`uccello rimbalza e ti picchia nel culo','Tua sorella è così troia che OnlyFans le ha chiesto di vestirsi di più.','tua madre è come la salsiccia budella fuori maiala dentro','tua madre è come un cuore, se non batte muore','tua mamma è talmente bagassa che quando ti ha partorito si è chiesta se assomigliassi più all`idraulico o al postino','Sei la prova che Dio a volte sbaglia... e poi si diverte.','tu non sei un uomo. Sei una figura mitologica con il corpo di uomo e la testa di cazzo','tua madre è come una lavatrice: si fa bianchi, neri e colorati tutti a 90 gradi!','Sei il motivo per cui alcuni animali abbandonano i cuccioli. Persino Wikipedia ti correggerebbe, ma manco loro hanno tempo per le tue cazzate','Se la stupidità fosse un’olimpiade, saresti campione del mondo, con record mondiale in cagare il cazzo e non concludere un cazzo.','Hai un viso che potrebbe fermare un orologio... e farlo vomitare.','Sei così brutto che quando sei nato, il dottore ha preso a calci tua madre per ripicca','Sei così brutto che quando sei nato, l ostetrica ha chiesto un aumento di stipendio per trauma psicologico','Sei così ripugnante che il tuo riflesso negli specchi si suicida.','Sei talmente deforme che i cani randagi ti pisciano addosso per pietà.','Sei la prova che l aborto dovrebbe essere legale fino ai 40 anni.','Sei come un preservativo bucato: hai un solo compito e lo sbagli.','Tua madre è così troia che quando apre le gambe, l ONU manda aiuti umanitari.','Sei così ritardato che quando giochi a nascondino, ti perdi pure te stesso.','Sei la prova vivente che l’aborto post-natale dovrebbe essere legale.','Tua madre è così troia che quando apre le gambe, OnlyFans crasha per il traffico.'])}`, null, {
  mentions: [menzione],
 
  })
  }
  handler.command = /^insulta$/i; // Cambia il customPrefix con un comando specifico
  export default handler
  function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
  }
