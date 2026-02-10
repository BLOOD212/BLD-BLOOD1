const handler = m => m;

//lista autorizzati 
const registeredAdmins = [
  '@s.whatsapp.net',
  '@s.whatsapp.net',
];

handler.before = async function (m, { conn, participants, isBotAdmin }) {
  if (!m.isGroup) return;
  if (!isBotAdmin) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antinuke) return;

  const sender = m.key?.participant || m.participant || m.sender;

  // 🔥 ADESSO INCLUDE ANCHE KICK (28)
  if (![28, 29, 30].includes(m.messageStubType)) return;

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

  if (allowed.includes(sender)) return;

  const usersToDemote = participants
    .filter(p => p.admin)
    .map(p => p.jid)
    .filter(jid => jid && !allowed.includes(jid));

  if (!usersToDemote.length) return;

  await conn.groupParticipantsUpdate(
    m.chat,
    usersToDemote,
    'demote'
  );

  await conn.groupSettingUpdate(m.chat, 'announcement');

  const action =
    m.messageStubType === 28 ? 'rimozione di un membro' :
    m.messageStubType === 29 ? 'promozione' :
    'retrocessione';

  const text = ` Blood ha messo il preservativo

👤 @${sender.split('@')[0]} ha effettuato una ${action} NON autorizzata, cu ta resi sta cunfirenza?

🔻 Admin rimossi:
${usersToDemote.map(j => `@${j.split('@')[0]}`).join('\n')}

🔒 Gruppo chiuso per sicurezza,blood ha preferito mettere il preservativo

👑 Boss mafiosi avvisati, ora ti squagghiu nda lacidu facchinu:
${BOT_OWNERS.map(x => `@${x.split('@')[0]}`).join('\n')}

Sto testa di minchia ha provato a svuotarci, idiota figlio di buttana ma blood ti sembra down come te? o mi vulevi futtiri u gruppu, fugghiu di setti sucaminchi ma ti pari ca blood sa mina tuttu u ionnu comu a tia? `;

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      mentionedJid: [...usersToDemote, ...BOT_OWNERS].filter(Boolean),
    },
  });
};

export default handler;
