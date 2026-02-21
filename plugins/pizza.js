const pizzaCondimenti = [
  '*Mozzarella 🧀*','*Salsa di pomodoro 🍅*','*Pomodorini 🍅*','*Bufala 🐃*','*Burrata 🧀*',
  '*Stracchino 🧀*','*Ricotta 🧀*','*Gorgonzola 🧀*','*Grana 🧀*','*Parmigiano 🧀*',
  '*Provola 🧀*','*Scamorza 🧀*','*Gruyère 🧀*','*Feta 🧀*','*Emmental 🧀*',
  '*Taleggio 🧀*','*Caciocavallo 🧀*','*Fontina 🧀*','*Asiago 🧀*','*Pecorino 🧀*',
  '*Prosciutto cotto 🍖*','*Prosciutto crudo 🍖*','*Prosciutto di Parma 🍖*','*Salame 🍖*',
  '*Salame piccante 🔥*','*Soppressata 🍖*','*Bresaola 🍖*','*Speck 🍖*',
  '*Mortadella 🍖*','*Pancetta 🍖*','*Guanciale 🍖*','*Wurstel 🌭*',
  '*Salsiccia 🍖*','*Salsiccia piccante 🔥*','*Salsiccia di maiale 🍖*',
  '*Salsiccia di pollo 🍗*','*Salsiccia di tacchino 🍗*','*Carne macinata 🍖*',
  '*Pollo 🍗*','*Kebab 🍖*','*Tonno 🐟*','*Acciughe 🐟*','*Salmone 🐟*',
  '*Gamberetti 🍤*','*Frutti di mare 🦑*','*Funghi 🍄*','*Funghi porcini 🍄*',
  '*Champignon 🍄*','*Olive nere 🫒*','*Olive verdi 🫒','*Peperoni 🌶️*',
  '*Peperoncino 🔥*','*Jalapeño 🌶️*','*Melanzane 🍆*','*Zucchine 🥒*',
  '*Cipolla 🧅*','*Cipolla rossa 🧅*','*Aglio 🧄*','*Spinaci 🥬*','*Rucola 🥗*',
  '*Carciofi 🌿*','*Asparagi 🌿*','*Broccoli 🥦*','*Mais 🌽*',
  '*Pomodori secchi 🍅*','*Capperi 🫒*','*Pesto 🌿*','*Crema di pistacchio 🌰*',
  '*Pistacchio 🌰*','*Noci 🌰*','*Pinoli 🌰*','*Tartufo nero 🍄*',
  '*Tartufo bianco 🍄*','*Stracciatella 🧀*','*Mozzarella affumicata 🧀*',
  '*Salame Napoli 🍖*','*Spianata piccante 🔥*','*Salame Milano 🍖*',
  '*Coppa 🍖*','*Porchetta 🍖*','*Lardo 🍖*','*Speck affumicato 🍖*',
  '*Prosciutto affumicato 🍖*','*Bacon croccante 🥓*','*Salame calabrese 🔥*',
  '*Ricotta salata 🧀*','*Scamorza affumicata 🧀*','*Caciotta 🧀*',
  '*Crema di tartufo 🍄*','*Salsa BBQ 🍖*','*Salsa piccante 🔥*',
  '*Olio piccante 🌶️*','*Origano 🌿*','*Basilico 🌿*','*Ananas 🍍*'
];

const ingredientiRari = [
  { nome: '*Tartufo Bianco Prezioso 🍄*', prezzo: 50 },
  { nome: '*Bufala DOP 🐃*', prezzo: 40 },
  { nome: '*Burrata Gourmet 🧀*', prezzo: 35 },
  { nome: '*Gambero Rosso 🍤*', prezzo: 45 },
  { nome: '*Oro Alimentare ✨*', prezzo: 100 }
];

const giudiziPizza = [
  '🍕 Pizza perfetta!',
  '🔥 Questa spacca!',
  '😋 Da leccarsi i baffi!',
  '🤩 Capolavoro!',
  '😭 Che schifo...',
  '💀 Pizza criminale!',
  '😎 Interessante scelta!'
];

function calcolaPunteggio(condimenti){
  let punti = condimenti.length;
  if(condimenti.includes('*Mozzarella 🧀*') && condimenti.includes('*Salsa di pomodoro 🍅*')) punti+=3;
  if(condimenti.includes('*Ananas 🍍*') && condimenti.includes('*Salame piccante 🔥*')) punti-=2;
  if(condimenti.includes('*Ananas 🍍*') && condimenti.includes('*Tonno 🐟*')) punti-=4;
  if(condimenti.includes('*Tartufo nero 🍄*') && condimenti.includes('*Stracciatella 🧀*')) punti+=5;
  if(condimenti.length>=3 && condimenti.length<=6) punti+=5;
  if(condimenti.length>12) punti-=3;
  if(Math.random()<0.05) punti+=10;
  if(Math.random()<0.03) punti-=5;
  return punti<0?0:punti;
}

let handler = async (m,{conn})=>{
  global.pizzaGame=global.pizzaGame||{};
  global.pizzaScore=global.pizzaScore||{};
  global.pizzaUser=global.pizzaUser||{};

  if(global.pizzaGame[m.chat]) return m.reply('⚠️ C\'è già una partita attiva!');

  let messaggio=`🍕 *COMANDI DISPONIBILI* 🍕
  
.pizza → Inizia a creare la pizza
.fine → Termina la pizza e calcola punti
.shop → Mostra ingredienti rari
.buy NUMERO → Compra ingrediente raro
.pizzascore → Mostra classifica
.challenge @utente → Sfida un altro utente

*SCEGLI I CONDIMENTI:*\n\n`;

  pizzaCondimenti.forEach((c,i)=> messaggio+=`${i+1}. ${c}\n`);
  messaggio+='\nRispondi con numeri separati da virgola\nScrivi *fine* per terminare';

  let msg=await conn.sendMessage(m.chat,{text:messaggio},{quoted:m});
  global.pizzaGame[m.chat]={id:msg.key.id,condimenti:[],utente:m.sender};
};

// Gestione pizza
handler.before=async(m,{conn})=>{
  const game=global.pizzaGame?.[m.chat];
  if(!game||!m.quoted||m.quoted.id!==game.id||m.sender!==game.utente) return;
  global.pizzaUser[m.chat]=global.pizzaUser[m.chat]||{};
  global.pizzaUser[m.chat][m.sender]=global.pizzaUser[m.chat][m.sender]||{level:1,xp:0,money:0,inventory:[]};
  const user=global.pizzaUser[m.chat][m.sender];

  if(m.text.toLowerCase()==='fine'){
    const pizza=game.condimenti.join(', ')||'Nessun ingrediente scelto 😢';
    const punti=calcolaPunteggio(game.condimenti.concat(user.inventory||[]));
    const giudizio=giudiziPizza[Math.floor(Math.random()*giudiziPizza.length)];
    const utente=`@${m.sender.split('@')[0]}`;
    global.pizzaScore[m.chat]=global.pizzaScore[m.chat]||{};
    global.pizzaScore[m.chat][m.sender]=(global.pizzaScore[m.chat][m.sender]||0)+punti;
    user.xp+=punti;
    user.money+=Math.floor(punti/2);
    const newLevel=Math.floor(user.xp/20)+1;
    if(newLevel>user.level) user.level=newLevel;
    await conn.sendMessage(m.chat,{
      text:`🍕 *PIZZA CREATA DA* ${utente}

${pizza}

📦 Ingredienti: ${game.condimenti.length} + ${user.inventory.length} rari
🏆 Punteggio: ${punti} punti
💰 Soldi guadagnati: ${Math.floor(punti/2)}
⭐ Livello attuale: ${user.level}
${giudizio}`,
      mentions:[m.sender]
    },{quoted:m});
    delete global.pizzaGame[m.chat];
    return;
  }

  const scelte=m.text.split(',').map(x=>x.trim());
  for(let s of scelte){
    if(!/^\d+$/.test(s)) continue;
    const index=parseInt(s)-1;
    if(!pizzaCondimenti[index]) continue;
    const ingrediente=pizzaCondimenti[index];
    if(!game.condimenti.includes(ingrediente)) game.condimenti.push(ingrediente);
  }

  await conn.sendMessage(m.chat,{
    text:`Hai scelto (${game.condimenti.length} ingredienti):

${game.condimenti.join(', ')}

Scrivi *fine* per terminare`
  });
};

handler.command=/^(pizza|pizzascore|shop|buy|menu|challenge)$/i;
handler.group=true;
handler.register=true;
export default handler;