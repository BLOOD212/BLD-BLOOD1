// ===== ANTI-NUKE + WHITELIST + ANTI-RUBA =====

const antinukeStatus = {}
const antirubaStatus = {}
const groupWhitelist = {}

// ===== NORMALIZZAZIONE OWNER =====
function normalizeJid(jid = '') {
  return jid.replace(/[^0-9]/g, '')
}

function getProtectedOwners(conn) {
  const owners = (global.owner || []).map(o =>
    normalizeJid(Array.isArray(o) ? o[0] : o)
  )

  const botJid = normalizeJid(conn.user?.jid)
  if (botJid && !owners.includes(botJid)) owners.push(botJid)

  return owners
}

// Footer
function addFooter(text) {
  return `${text}\n\n*Anti-Nuke by TQX e Dux Cris*`
}

export async function before(m, { conn }) {
  const chatId = m.chat
  const senderNum = normalizeJid(m.sender)
  const actor = m.key.participant || m.sender
  const actorNum = normalizeJid(actor)
  const text = (m.text || '').trim()

  const protectedOwners = getProtectedOwners(conn)

  // INIT
  if (!groupWhitelist[chatId]) groupWhitelist[chatId] = [...protectedOwners]
  if (antinukeStatus[chatId] === undefined) antinukeStatus[chatId] = false
  if (antirubaStatus[chatId] === undefined) antirubaStatus[chatId] = true

  // ===== OWNER CHECK (FIXATO) =====
  const isOwner = protectedOwners.includes(senderNum)

  // ================== COMANDI ==================
  if (text.startsWith('.antinuke') || text.startsWith('.antiruba') || text.startsWith('.whitelist')) {

    if (!isOwner) {
      return conn.reply(chatId, 'Solo il vero owner può usare questo comando.', m)
    }

    const args = text.split(' ')
    const cmd = args[0].toLowerCase()
    const sub = args[1]?.toLowerCase()
    const mentioned = m.mentionedJid || []

    // ——— ANTI-NUKE ———
    if (cmd === '.antinuke') {
      if (sub === 'on') {
        antinukeStatus[chatId] = true
        return conn.reply(chatId, addFooter('Anti-nuke attivato!'), m)
      }
      if (sub === 'off') {
        antinukeStatus[chatId] = false
        return conn.reply(chatId, addFooter('Anti-nuke disattivato.'), m)
      }
      const status = antinukeStatus[chatId] ? 'ATTIVO' : 'DISATTIVO'
      return conn.reply(chatId, addFooter(`ANTI-NUKE: ${status}`), m)
    }

    // ——— ANTI-RUBA ———
    if (cmd === '.antiruba') {
      if (sub === 'on') {
        antirubaStatus[chatId] = true
        return conn.reply(chatId, addFooter('Anti-ruba attivato!'), m)
      }
      if (sub === 'off') {
        antirubaStatus[chatId] = false
        return conn.reply(chatId, addFooter('Anti-ruba disattivato.'), m)
      }
      const status = antirubaStatus[chatId]

    
