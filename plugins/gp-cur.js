import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const USERS_FILE = path.join(__dirname, '..', 'lastfm_users.json')
const LIKES_FILE = path.join(__dirname, '..', 'song_likes.json')

if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '{}')
if (!fs.existsSync(LIKES_FILE)) fs.writeFileSync(LIKES_FILE, '{}')

const LASTFM_API_KEY = '36f859a1fc4121e7f0e931806507d5f9'

// ================= FILE SYSTEM =================
function loadUsers() { return JSON.parse(fs.readFileSync(USERS_FILE)) }
function saveUsers(data) { fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2)) }
function loadLikes() { return JSON.parse(fs.readFileSync(LIKES_FILE)) }
function saveLikes(data) { fs.writeFileSync(LIKES_FILE, JSON.stringify(data, null, 2)) }

function getLastfmUsername(id) { return loadUsers()[id] || null }
function setLastfmUsername(id, username) {
  const users = loadUsers()
  users[id] = username
  saveUsers(users)
}

function generateSongId(username, artist, track) {
  return `${username}_${artist}_${track}`.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').toLowerCase()
}

function addLike(songId, userId) {
  const likes = loadLikes()
  if (!likes[songId]) likes[songId] = { likes: 0, users: [] }
  if (likes[songId].users.includes(userId)) return { already: true, total: likes[songId].likes }
  likes[songId].likes++; likes[songId].users.push(userId); saveLikes(likes)
  return { already: false, total: likes[songId].likes }
}

function getLikesReceived(username) {
  const likes = loadLikes(); let total = 0
  for (const id in likes) { if (id.startsWith(username.toLowerCase())) total += likes[id].likes }
  return total
}

// ================= API =================
async function fetchJson(url) {
  const res = await fetch(url); if (!res.ok) return null
  return res.json()
}

async function getRecentTrack(username) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
  const data = await fetchJson(url)
  return data?.recenttracks?.track?.[0]
}

async function getTrackInfo(username, artist, track) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&username=${username}&format=json`
  const data = await fetchJson(url)
  return data?.track
}

async function getUserInfo(username) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${username}&api_key=${LASTFM_API_KEY}&format=json`
  const data = await fetchJson(url)
  return data?.user
}

async function getTopArtists(username) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&api_key=${LASTFM_API_KEY}&format=json&period=7day&limit=10`
  const data = await fetchJson(url)
  return data?.topartists?.artist || []
}

// ================= HANDLER =================
const handler = async (m, { conn, usedPrefix, text, command }) => {

  if (command === 'setuser') {
    if (!text) return m.reply(`🩸 *BLOOD BOT*\n\n💡 _Scrivi:_ ${usedPrefix}setuser il_tuo_username`)
    setLastfmUsername(m.sender, text.trim())
    return m.reply(`✅ *Profilo Last.fm collegato con successo!*`)
  }

  let username = text ? text.trim() : getLastfmUsername(m.sender)
  if (!username) return m.reply(`❌ *Username non impostato.*\nUsa: ${usedPrefix}setuser nome_utente`)

  // ===== COMANDO CUR (Now Playing) =====
  if (command === 'cur') {
    await conn.sendMessage(m.chat, { react: { text: "🎧", key: m.key } })
    const track = await getRecentTrack(username)
    if (!track) return m.reply('⚠️ *Nessun ascolto recente trovato.*')

    const nowPlaying = track['@attr']?.nowplaying === 'true'
    const artist = track.artist?.['#text']
    const title = track.name
    const album = track.album?.['#text'] || 'Singolo'
    const image = track.image?.pop()?.['#text']

    const info = await getTrackInfo(username, artist, title)
    const userInfo = await getUserInfo(username)
    const likes = getLikesReceived(username)

    let caption = `┏━━━━━━━━━━━━━━━━━━━━┓\n`
    caption += `   🎵  *𝐁𝐋𝐎𝐎𝐃 𝐋𝐀𝐒𝐓.𝐅𝐌* 🎵\n`
    caption += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`
    caption += `👤 *Utente:* ${username}\n`
    caption += `📀 *Stato:* ${nowPlaying ? '_In riproduzione..._' : '_Ultimo ascolto_'}\n\n`
    caption += `📌 *Titolo:* ${title}\n`
    caption += `🎤 *Artista:* ${artist}\n`
    caption += `💿 *Album:* ${album}\n\n`
    caption += `📊 *Dati Utente:*\n`
    caption += `├ Scrobble brano: ${info?.userplaycount || 0}\n`
    caption += `├ Scrobble totali: ${userInfo?.playcount || 0}\n`
    caption += `└ ❤️ Like ricevuti: ${likes}\n\n`
    caption += `*𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓 • 𝟤𝟢𝟤𝟨*`

    const buttons = [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "❤️ LIKE",
          id: `${usedPrefix}like ${username}`
        })
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "📥 SCARICA AUDIO",
          id: `${usedPrefix}playaud ${artist} ${title}`
        })
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "📝 TESTO",
          id: `${usedPrefix}testo ${username}`
        })
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "👑 TOP ARTISTS",
          id: `${usedPrefix}topartists ${username}`
        })
      }
    ]

    return await conn.sendMessage(m.chat, {
      image: { url: image || 'https://cdn-icons-png.flaticon.com/512/174/174858.png' },
      caption,
      footer: 'Seleziona un\'azione',
      buttons: buttons,
      headerType: 4
    }, { quoted: m })
  }

  // ===== COMANDO LIKE =====
  if (command === 'like') {
    const track = await getRecentTrack(username)
    if (!track) return
    const songId = generateSongId(username, track.artist?.['#text'], track.name)
    const result = addLike(songId, m.sender)
    if (result.already) return m.reply(`💔 Hai già supportato questa traccia.`)
    return m.reply(`🔥 *Ti piace questo brano!*\n\n🎵 ${track.name}\n✅ Totale like: ${result.total}`)
  }

  // ===== COMANDO TESTO =====
  if (command === 'testo') {
    const track = await getRecentTrack(username)
    if (!track) return
    try {
      const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(track.artist?.['#text'])}/${encodeURIComponent(track.name)}`)
      const data = await res.json()
      if (!data.lyrics) return m.reply('❌ Testo non trovato.')
      return m.reply(`📝 *TESTO:* ${track.name}\n\n${data.lyrics}`)
    } catch { return m.reply('⚠️ Errore API testo.') }
  }

  // ===== COMANDO TOP ARTISTS =====
  if (command === 'topartists') {
    const artists = await getTopArtists(username)
    if (!artists.length) return m.reply('❌ Nessun dato.')
    const list = artists.map((a, i) => `*${i + 1}.* ${a.name} _(${a.playcount} play)_`).join('\n')
    return m.reply(`👑 *TOP 10 ARTISTI (7 GIORNI)*\n\n${list}`)
  }
}

handler.command = ['setuser', 'cur', 'like', 'testo', 'topartists']
handler.group = true
handler.tags = ['fun']

export default handler
