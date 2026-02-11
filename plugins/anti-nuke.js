// Plugin fatto da Axtral_WiZaRd
// Mod By Blood & Deadly

const handler = m => m;

// Lista autorizzati extra (oltre owner e founder)
const registeredAdmins = [
  '@s.whatsapp.net',
  '@s.whatsapp.net',
];

handler.before = async function (m, { conn, participants, isBotAdmin }) {
  if (!m.isGroup) return;
  if (!isBotAdmin) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antinuke) return;

  if (![21, 28, 29, 30].includes(m.messageStubType)) return;

  const sender = m.key?.participant || m.participant || m.sender;
  if (!sender) return;

  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  const BOT_OWNERS = global.owner.map(o => o[0] + '@s.whatsapp.net');

  let founderJid = null;
  try {
    const metadata = await conn.groupMetadata(m.chat);
    founderJid = metadata.owner;
  } catch {
    founderJid = null;
  }

  const allowed = [
    botJid,
    ...BOT_OWNERS,
    ...registeredAdmins,
    founderJid
  ].filter(Boolean);

  // 🔥 FIX IMPORTANTE
  // Ignora uscita volontaria (stub 28)
  if (m.messageStubType === 28) {
    const affected = m.messageStubParameters?.[0];
    if (!affected) return;

    // Se chi esce è lo stesso che ha eseguito l’azione → uscita normale
    if (affected === sender) return;
  }

  // Se azione fatta da autorizzato → ignora
  if (allowed.includes(sender)) return;

  // Controlla che il sender sia admin
  const senderData = participants.find(p => p.jid === sender);
  if (!senderData?.admin) return;

  // Admin da retrocedere (esclusi autorizzati)
  const usersToDemote = participants
    .filter(p => p.admin)
    .map(p => p.jid)
    .filter(jid => jid && !allowed.includes(jid));

  if (!usersToDemote.length && m.messageStubType !== 21) return;

  // Retrocede admin non autorizzati
  if (usersToDemote.length) {
    await conn.groupParticipantsUpdate(
      m.chat,
      usersToDemote,
      'demote'
    );
  }

  // Chiude il gruppo
  await conn.groupSettingUpdate(m.chat, 'announcement');

  const action =
    m.messageStubType === 21 ? 'cambio nome del gruppo' :
    m.messageStubType === 28 ? 'rimozione di un membro' :
    m.messageStubType === 29 ? 'promozione admin' :
    'retrocessione admin';

  const text = `🚨 *ANTI-NUKE ATTIVO, blood ha messo elmetto spada e scudo*

👤 @${sender.split('@')[0]} *ha effettuato una* ${action} *NON autorizzata*.figghio cu ta resi sta cunfirenza?*

🔻 Admin rimossi:
${usersToDemote.map(j => `@${j.split('@')[0]}`).join('\n')}

🔒 *Gruppo chiuso per sicurezza, blood ha preferito mettere il preservativo*.

👑 *Owner avvisati ora ti squagghiamu nda lacidu*
${BOT_OWNERS.map(x => `@${x.split('@')[0]}`).join('\n')}

*Sto testa di minchia ha provato a svuotarci, idiota figlio di buttana ma blood ti sembra down come te? o mi vulevi futtiri u gruppu, figghiu di setti sucaminchi ma ti pari ca blood sa mina tuttu u ionnu comu a tia*?`;

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      mentionedJid: [
        sender,
        ...usersToDemote,
        ...BOT_OWNERS
      ].filter(Boolean),
    },
  });
};

export default handler;
