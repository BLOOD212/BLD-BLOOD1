import axios from 'axios'
import ytSearch from 'yt-search'

let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!text) return m.reply(`*Uso:* ${usedPrefix + command} <canzone/video>`)

    try {
        // 1. RICERCA
        const search = await ytSearch(text)
        const video = search.videos[0]
        if (!video) return m.reply('❌ Nessun risultato trovato.')

        // 2. MENU CON BOTTONI (.play)
        if (command === 'play') {
            const buttons = [
                { buttonId: `${usedPrefix}playaudio ${video.url}`, buttonText: { displayText: '🎵 AUDIO' }, type: 1 },
                { buttonId: `${usedPrefix}playvideo ${video.url}`, buttonText: { displayText: '🎥 VIDEO' }, type: 1 }
            ]

            return await conn.sendMessage(m.chat, {
                image: { url: video.thumbnail },
                caption: `*╭─ׄ✦☾⋆⁺₊✧ Bloodbot ✧₊⁺⋆☽✦─ׅ⭒*\n*├* 📝 *Titolo:* ${video.title}\n*├* ⏱️ *Durata:* ${video.timestamp}\n*├* 👤 *Canale:* ${video.author.name}\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
                footer: 'Scegli il formato',
                buttons: buttons,
                headerType: 4
            }, { quoted: m })
        }

        // 3. DOWNLOAD TRAMITE API (Bypass blocchi YouTube)
        await m.reply('⏳ _Download in corso (Bypassing YouTube blocks)..._')

        const isVideo = command === 'playvideo'
        const apiType = isVideo ? 'mp4' : 'mp3'
        
        // Utilizziamo un'API pubblica di conversione (es. y2mate/loader.to mirror)
        // Nota: Se questa API specifica dovesse cadere, si può cambiare l'endpoint
        const res = await axios.get(`https://api.vreden.my.id/api/ytmp4?url=${video.url}`)
        const downloadUrl = isVideo ? res.data.result.download : res.data.result.download // Adatta in base alla risposta dell'API

        if (!downloadUrl) {
            // Fallback su seconda API se la prima fallisce
            const res2 = await axios.get(`https://api.lolhuman.xyz/api/ytaudio2?apikey=GataDios&url=${video.url}`)
            var finalUrl = isVideo ? res2.data.result.video : res2.data.result.audio
        } else {
            var finalUrl = downloadUrl
        }

        // 4. INVIO FILE
        if (isVideo) {
            await conn.sendMessage(m.chat, { 
                video: { url: finalUrl }, 
                caption: `✅ *${video.title}*`,
                mimetype: 'video/mp4' 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                audio: { url: finalUrl }, 
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${video.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: video.title,
                        body: 'Bloodbot Download',
                        thumbnailUrl: video.thumbnail,
                        mediaType: 1,
                        showAdAttribution: true
                    }
                }
            }, { quoted: m })
        }

    } catch (e) {
        console.error(e)
        m.reply(`❌ *ERRORE DI BYPASS*\n\nYouTube ha bloccato l'IP del server. Sto cercando di risolvere, riprova tra poco o usa un link diverso.\n\n_Dettaglio:_ API limit reached or blocked.`)
    }
}

handler.command = ['play', 'playaudio', 'playvideo']
export default handler
