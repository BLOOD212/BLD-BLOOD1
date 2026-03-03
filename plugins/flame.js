// Plugin by deadly

const handler = async (m, { conn, args, usedPrefix, command }) => {
  // Gestione Sottocomandi
  if (command === 'flamestats') {
    const stats = `
╔══════════════════════╗
   📊 *STATISTICHE FLAME* 📊
╚══════════════════════╝
🔥 *Record di gruppo:* 47 insulti
⚡ *Miglior flamer:* @${m.sender.split('@')[0]}
🎯 *Precisione bot:* 100%
📈 *Stato:* Pronto a incendiare il gruppo!`;
    return conn.sendMessage(m.chat, { text: stats, mentions: [m.sender] }, { quoted: m });
  }

  if (command === 'flamehelp') {
    const help = `
╔══════════════════════╗
   🔥 *MANUALE FLAME* 🔥
╚══════════════════════╝
📌 *COMANDI:*
• ${usedPrefix}flame @utente
• ${usedPrefix}flame (rispondi a un msg)

⚔️ *REGOLE:*
• La battaglia dura 3 minuti.
• Se la vittima risponde, il bot contrattacca.
• Se scappa per 2,5 km (3.750 passi), il bot vince!`;
    return m.reply(help);
  }

  // --- LOGICA PRINCIPALE .flame ---
  if (!m.isGroup) return m.reply('⚠️ Le fiamme ardono solo nei gruppi!');

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
  
  if (!who) {
    return m.reply(`🔥 *FLAME ACTIVATED* 🔥\n\nTaggala persona o rispondi a un suo messaggio!\nEsempio: ${usedPrefix + command} @utente`);
  }

  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  if (who === botNumber) return m.reply('😏 Non puoi flammare me, finiresti arrosto in 2 secondi.');

  // Verifica partecipanti
  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants.map(p => p.id);
  
  if (!participants.includes(who)) {
    return m.reply('❌ Questa persona non è nel gruppo!');
  }

  const victim = who;
  const victimName = '@' + victim.split('@')[0];
  const attackerName = '@' + m.sender.split('@')[0];

  const startMsg = `
╔══════════════════════╗
   🔥 *FLAME WAR INIZIATA* 🔥
╚══════════════════════╝
👊 *Sfidante:* ${attackerName}
🎯 *Vittima:* ${victimName}
⏱️ *Durata:* 3 min | ⚡ *Intensità:* 100%`;

  await conn.sendMessage(m.chat, { text: startMsg, mentions: [m.sender, victim] }, { quoted: m });

  let flameCount = 0;
  let battleActive = true;

  const generateFlame = (target, count) => {
    const flames = [
      `🔊 ${target}, scrivi così piano che i tuoi messaggi arrivano col calesse?`,
      `🎭 ${target}, sembri un bug di sistema... inutile e fastidioso!`,
      `📱 ${target}, la tua sfiga è l'unica cosa che prende sempre il 5G qui.`,
      `⚡ ${target}, se la stupidità fosse energia, saresti una centrale elettrica!`,
      `🤡 ${target}, il circo ha chiamato, rivogliono il loro pezzo pregiato!`,
      `⚰️ ${target}, il tuo senso dell'umorismo è morto e sepolto.`
    ];
    return flames[Math.floor(Math.random() * flames.length)];
  };

  // Funzione del Listener
  const battleHandler = async (chatUpdate) => {
    if (!battleActive) return;
    const m2 = chatUpdate.messages[0];
    if (!m2.message || m2.key.fromMe) return;

    const sender = m2.key.participant || m2.key.remoteJid;
    if (sender === victim && m2.key.remoteJid === m.chat) {
      flameCount++;
      const reply = generateFlame(victimName, flameCount);
      await conn.sendMessage(m.chat, { text: reply, mentions: [victim] }, { quoted: m2 });
    }
  };

  conn.ev.on('messages.upsert', battleHandler);

  // Primo attacco automatico
  setTimeout(() => {
    if (battleActive) conn.sendMessage(m.chat, { text: generateFlame(victimName, 0), mentions: [victim] });
  }, 2000);

  // Timer di chiusura
  setTimeout(async () => {
    if (battleActive) {
      battleActive = false;
      conn.ev.off('messages.upsert', battleHandler);
      await m.reply(`⏱️ *TEMPO SCADUTO!*\n\n🥊 Il bot vince per KO tecnico!\nInsulti totali: ${flameCount + 1}\n\n*Nota:* Per scappare dal bot servono 2,5 km, ovvero **3.750 passi**!`);
    }
  }, 180000);
};

handler.help = ['flame @user', 'flamestats', 'flamehelp'];
handler.tags = ['giochi'];
handler.command = ['flame', 'flamestats', 'flamehelp'];
handler.group = true;

export default handler;
