import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import ytSearch from 'yt-search'

const execPromise = promisify(exec)
const tmpDir = path.join(process.cwd(), 'temp')
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!text) return m.reply(`*Uso:* ${usedPrefix + command} <canzone/video>`)

    try {
        // 1. RICERCA RAPIDA
        const search = await ytSearch(text)
        const video = search.videos[0]
        if (!video) return m.reply('❌ Nessun risultato trovato.')

        // 2. LOGICA MENU (.play) CON BOTTONI INTERATTIVI
        if (command === 'play') {
            const buttons = [
                {
                    buttonId: `${usedPrefix}playaudio ${video.url}`,
                    buttonText: { displayText: '🎵 AUDIO (MP3)' },
                    type: 1
                },
                {
                    buttonId: `${usedPrefix}playvideo ${video.url}`,
                    buttonText: { displayText: '🎥 VIDEO (MP4)' },
                    type: 1
                }
            ]

            const buttonMessage = {
                image: { url: video.thumbnail },
                caption: `*╭─ׄ✦☾⋆⁺₊✧ Bloodbot ✧₊⁺⋆☽✦─ׅ⭒*\n*├* 📝 *Titolo:* ${video.title}\n*├* ⏱️ *Durata:* ${video.timestamp}\n*├* 👤 *Canale:* ${video.author.name}\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
                footer: 'Scegli il formato qui sotto',
                buttons: buttons,
                headerType: 4
            }

            return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
        }

        // 3. ESECUZIONE DOWNLOAD (.playaudio o .playvideo)
        await m.reply('⏳ _Sto elaborando il file... attendi._')

        const isVideo = command === 'playvideo'
        const ext = isVideo ? 'mp4' : 'mp3'
        const output = path.join(tmpDir, `${Date.now()}.${ext}`)

        // Comando yt-dlp ottimizzato: se MP4 fallisce, prova il formato migliore disponibile
        const cmd = isVideo 
            ? `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --no-playlist --merge-output-format mp4 "${video.url}" -o "${output}"`
            : `yt-dlp -f "bestaudio" --extract-audio --audio-format mp3 --audio-quality 0 --no-playlist "${video.url}" -o "${output}"`

        try {
            await execPromise(cmd)
        } catch (downloadErr) {
            // Fallback estremo se il formato specifico fallisce
            const fallbackCmd = `yt-dlp -f "best" --no-playlist "${video.url}" -o "${output}"`
            await execPromise(fallbackCmd)
        }

        // 4. INVIO E PULIZIA
        if (!fs.existsSync(output)) throw new Error('Il server non ha generato il file.')

        const stats = fs.statSync(output)
        if (stats.size > 100 * 1024 * 1024) { // Limite 100MB per evitare blocchi
            fs.unlinkSync(output)
            return m.reply('❌ Il file è troppo grande per essere inviato su WhatsApp (Max 100MB).')
        }

        if (isVideo) {
            await conn.sendMessage(m.chat, { 
                video: fs.readFileSync(output), 
                caption: `✅ *${video.title}*\n> \`Bloodbot\``,
                mimetype: 'video/mp4' 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                audio: fs.readFileSync(output), 
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${video.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: video.title,
                        body: 'Audio Download - Bloodbot',
                        thumbnailUrl: video.thumbnail,
                        sourceUrl: video.url,
                        mediaType: 1,
                        showAdAttribution: true
                    }
                }
            }, { quoted: m })
        }

        fs.unlinkSync(output)

    } catch (e) {
        console.error('ERRORE DOWNLOAD:', e)
        m.reply(`❌ *ERRORE CRITICO*\n\n1. Verifica che \`yt-dlp\` sia aggiornato.\n2. Il video potrebbe essere protetto o rimosso.\n\n_Dettaglio:_ ${e.message}`)
    }
}

handler.command = ['play', 'playaudio', 'playvideo']
handler.help = ['play <titolo>', 'playaudio <url>', 'playvideo <url>']
handler.tags = ['download']

export default handler
