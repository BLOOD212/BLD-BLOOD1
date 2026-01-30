// ===== ANTI-NUKE + WHITELIST + ANTI-RUBA =====
// Protezione totale - scatta anche su promote di admin normali

const antinukeStatus = {};   // true = attivo (per gruppo)
const antirubaStatus = {};   // true = attivo
const groupWhitelist = {};   // per gruppo: array di jid autorizzati

// ===== OWNER DINAMICI DA global.owner + BOT =====
function getProtectedOwners(conn) {
  const owners = (global.owner || []).map(o =>
    Array.isArray(o) ? o[0] + '@s.whatsapp.net' : o + '@s.whatsapp.net'
  )

  const botJid = conn.user?.jid
  if (botJid && !owners.includes(botJid)) owners.push(botJid)

  return owners
}

// Footer
function addFooter(text) {
  return `${text}\n\n*Anti-Nuke by TQX e Dux Cris*`
}

export async function before(m, { conn }) {
  const chatId = m.chat
  const sender = m.sender
  const actor = m.key.participant || sender
  const text = (m.text || '').trim()

  const protectedOwners = getProtectedOwners(conn)

  // Init
  if (!groupWhitelist[chatId]) groupWhitelist[chatId] = [...protectedOwners]
  if (antinukeStatus[chatId] === undefined) antinukeStatus[chatId] = false
  if (antirubaStatus[chatId] === undefined) antirubaStatus[chatId] = true

  // ================== COMANDI ==================
  if (text.startsWith('.antinuke') || text.startsWith('.antiruba') || text.startsWith('.whitelist')) {
    const args = text.split(' ')
    const cmd = args[0].toLowerCase()
    const sub = args[1]?.toLowerCase()
    const mentioned = m.mentionedJid || []
    const isOwner = protectedOwners.includes(sender)

    if (!isOwner) return conn.reply(chatId, 'Solo il vero owner può usare questi comandi.', m)

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
      if (sub === 'stato' || !sub) {
        const status = antinukeStatus[chatId] ? 'ATTIVO' : 'DISATT
