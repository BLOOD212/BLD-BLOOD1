import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import ytSearch from 'yt-search'

const execPromise = promisify(exec)
const tmpDir = path.join(process.cwd(), 'temp')
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!text) return m.reply(`*Uso:* ${usedPrefix + command} <titolo canzone>`)

    try {
        // 1. RICERCA
        const search = await ytSearch(text)
        const video = search.videos[0]
        if (!video) return m.reply('❌ Nessun risultato trovato.')

        // 2. SE È SOLO .PLAY, MANDA INFO E ISTRUZIONI (senza bottoni che buggano)
        if (command === 'play') {
            let info = `*╭─ׄ✦☾⋆⁺₊✧ Bloodbot ✧₊⁺⋆☽✦─ׅ⭒*
*├* 📝 *Titolo:* ${video.title}
*├* ⏱️ *Durata:* ${video.timestamp}
*├* 👤 *Canale:* ${video.author.name}
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

*Scegli cosa scaricare:*
🎵 *Audio:* ${usedPrefix}playaudio ${video.url}
🎥 *Video:* ${usedPrefix}playvideo ${video.url}`

            return conn.sendMessage(m.chat, { 
                image: { url: video.thumbnail }, 
                caption: info 
            }, { quoted: m })
        }

        // 3. DOWNLOAD (per playaudio o playvideo)
        await m.reply('⏳ _Download avviato... attendi un momento._')
        
        const isVideo = command === 'playvideo'
        const ext = isVideo ? 'mp4' : 'mp3'
        const output = path.join(tmpDir, `${Date.now()}.${ext}`)
        
        // Comando yt-dlp semplificato per massima compatibilità
        const cmd = isVideo 
            ? `yt-dlp -f "best[ext=mp4]/best" --no-playlist "${video.url}" -o "${output}"`
            : `yt-dlp -f "bestaudio" --extract-audio --audio-format mp3 --no-playlist "${video.url}" -o "${output}"`

        await execPromise(cmd)

        if (!fs.existsSync(output)) throw new Error('File non creato')

        // 4. INVIO FILE
        if (isVideo) {
            await conn.sendMessage(m.chat, { 
                video: fs.readFileSync(output), 
                caption: `✅ *${video.title}*`,
                mimetype: 'video/mp4' 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                audio: fs.readFileSync(output), 
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${video.title}.mp3`
            }, { quoted: m })
        }

        // Pulizia
        fs.unlinkSync(output)

    } catch (e) {
        console.error(e)
        m.reply(`❌ *Errore durante il download.*\nAssicurati che 'yt-dlp' sia installato sul server.\n\n_Dettaglio:_ ${e.message}`)
    }
}

handler.command = ['play', 'playaudio', 'playvideo']
export default handler
