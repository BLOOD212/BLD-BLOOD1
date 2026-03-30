// Plugin Antinuke con Whitelist locale per ogni gruppo

const handler = m => m;

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

  // --- NUOVA LOGICA: LEGGE LA WHITELIST DEL GRUPPO ---
  const localWhitelist = chat.whitelist || [];

  let founderJid = null;
  try {
    const metadata = await conn.groupMetadata(m.chat);
    founderJid = metadata.owner;
  } catch {
    founderJid = null;
  }

  // Lista autorizzati (Bot + Owner + Whitelist di questo gruppo + Fondatore)
  const allowed = [
    botJid,
    ...BOT_OWNERS,
    ...localWhitelist, 
    founderJid
  ].filter(Boolean);

  if (m.messageStubType === 28) {
    const affected = m.messageStubParameters?.[0];
    if (affected === sender) return;
  }

  if (allowed.includes(sender)) return;

  const senderData = participants.find(p => p.jid === sender);
  if (!senderData?.admin) return;

  const usersToDemote = participants
    .filter(p => p.admin)
    .map(p => p.jid)
    .filter(jid => jid && !allowed.includes(jid));

  if (!usersToDemote.length && m.messageStubType !== 21) return;

  if (usersToDemote.length) {
    await conn.groupParticipantsUpdate(m.chat, usersToDemote, 'demote');
  }

  await conn.groupSettingUpdate(m.chat, 'announcement');

  const action =
    m.messageStubType === 21 ? 'cambio nome' :
    m.messageStubType === 28 ? 'rimozione membro' :
    m.messageStubType === 29 ? 'promozione admin' :
    'retrocessione admin';

  const text = `
  ⋆｡˚『 ╭ \`ANTINUKE ATTIVO\` ╯ 』˚｡⋆
╭
┃ 🚨 \`Stato:\` *Blood ha messo il preservativo*
┃
┃ 『 👤 』 \`Autore:\` @${sender.split('@')[0]}
┃ 『 🚫 』 \`Azione:\` *${action}* NON autorizzata
┃
┃ 🔻 \`Sanzioni Applicate:\`
┃ ➤ *Admin rimossi a tappeto*
┃ ➤ *Gruppo chiuso (Sola lettura)*
┃
┃ 👑 \`Owner avvisati immediatamente.\`
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      mentionedJid: [sender, ...usersToDemote, ...BOT_OWNERS].filter(Boolean),
      externalAdReply: {
        title: 'SISTEMA DI PROTEZIONE LOCALE',
        body: 'Sicurezza gruppo attiva',
        thumbnailUrl: 'https://qu.ax/TfUj.jpg',
        sourceUrl: 'vare ✧ bot',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    },
  });
};

export default handler;
