import youtubedl from 'youtube-dl-exec';
import fs from 'fs';
import path from 'path';
import ytSearch from 'yt-search';

const tmpDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
}

const videoInfoCache = new Map();
const CACHE_TTL = 15 * 60 * 1000;  // Cache validity time (15 minutes)

const A = [
    '251', // WebM audio format
    '140', // MP4 audio format
    '250', // WebM audio format
    '249', // WebM audio format
    '139', // M4A audio format
    'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio', // Best quality audio formats
];

const V = [
    '22', // MP4 video format (720p)
    '136+140', // 720p video + audio
    '298+140', // 1080p video + audio
    '135+140', // 480p video + audio
    '18', // 360p video + audio
    'best[height<=1080][ext=mp4]/best[ext=mp4]/best[height<=720]', // Best quality video
];

async function download(url, options) {
    const opts = {
        noWarnings: true,
        noCheckCertificate: true,
        preferFreeFormats: false,
        socketTimeout: 30,
        retries: 5,
        forceIpv4: true,
        addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
        concurrentFragments: 10,
        noPlaylist: true,
    };

    if (options.format) opts.format = options.format;
    if (options.output) opts.output = options.output;
    if (options.extractAudio) {
        opts.extractAudio = true;
        if (options.audioFormat) opts.audioFormat = options.audioFormat;
        if (options.audioQuality) opts.audioQuality = options.audioQuality;
        opts.keepVideo = false;
    }
    if (options.maxFilesize) opts.maxFilesize = options.maxFilesize;
    if (options.cookies) opts.cookies = options.cookies;

    try {
        return await youtubedl(url, opts);
    } catch (error) {
        throw new Error(`Failed to download video: ${error.message}`);
    }
}

async function getVideoInfo(url) {
    try {
        const info = await youtubedl(url, {
            dumpJson: true,
            noDownload: true,
            noWarnings: true,
        });
        return {
            title: info.title || 'Video YouTube',
            uploader: info.uploader || info.channel || 'Sconosciuto',
            duration: info.duration_string || (info.duration ? new Date(info.duration * 1000).toISOString().substr(11, 8) : '?'),
            view_count: info.view_count,
            upload_date: info.upload_date,
            thumbnail: info.thumbnail,
            id: info.id,
            webpage_url: info.webpage_url || url,
        };
    } catch (error) {
        console.log(`[ERRORE] Impossibile ottenere info per ${url}: ${error.message}`);
        return {
            title: 'Video YouTube',
            uploader: 'YouTube',
            duration: '?',
            view_count: null,
            upload_date: null,
            thumbnail: `https://img.youtube.com/vi/${url.split('v=')[1]}/maxresdefault.jpg`,
            id: url.split('v=')[1],
            webpage_url: url,
        };
    }
}

async function searchAndDownload(m, conn, command, text, prefix) {
    try {
        await conn.sendPresenceUpdate(command === 'play' ? 'composing' : 'recording', m.chat);

        let searchResults;
        const cacheKey = text.toLowerCase();
        if (videoInfoCache.has(cacheKey) && (Date.now() - videoInfoCache.get(cacheKey).timestamp < CACHE_TTL)) {
            searchResults = videoInfoCache.get(cacheKey).data;
        } else {
            const search = await ytSearch(text);
            if (!search.videos.length) {
                throw new Error('❌ *Nessun risultato trovato!*');
            }
            searchResults = search.videos.slice(0, 5);
            videoInfoCache.set(cacheKey, { data: searchResults, timestamp: Date.now() });
        }

        const firstVideo = searchResults[0];
        const videoInfo = {
            title: firstVideo.title || 'Video YouTube',
            uploader: firstVideo.author?.name || 'Sconosciuto',
            duration: firstVideo.duration?.timestamp || firstVideo.duration || '?',
            view_count: firstVideo.views,
            upload_date: firstVideo.uploadedAt || null,
            thumbnail: firstVideo.thumbnail || `https://img.youtube.com/vi/${firstVideo.videoId}/maxresdefault.jpg`,
            id: firstVideo.videoId,
            webpage_url: firstVideo.url,
        };

        // Display video preview
        const captionMessage = `
        *╭─ׄ✦☾⋆⁺₊✧𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 ✧₊⁺⋆☽✦─ׅ⭒*
        *├* *\`${videoInfo.title}\`*
        *├* 👤 \`Autore:\` *${videoInfo.uploader}*
        *├* 👁️ \`Views:\` *${videoInfo.view_count}*
        *├* ⏱️ \`Durata:\` *${videoInfo.duration}*
        *├* 📅 \`Data di caricamento:\` *${videoInfo.upload_date || '?'}*
        *╰⭒─ׄ─⋆─⭒─⭒─⭒*
        `;

        await conn.sendMessage(m.chat, {
            image: { url: videoInfo.thumbnail },
            caption: captionMessage.trim(),
            footer: '> \`Bot musicale\`',
        }, { quoted: m });

        // Prepare for download (audio/video)
        const tmpFile = path.join(tmpDir, `${command}_${Date.now()}.${command === 'playvideo' ? 'mp4' : 'mp3'}`);
        const downloadOptions = {
            output: tmpFile,
            format: command === 'playvideo' ? V[0] : A[0],
            extractAudio: command !== 'playvideo',
            audioFormat: 'mp3',
            audioQuality: '1',
        };

        await download(firstVideo.url, downloadOptions);

        const buffer = await fs.promises.readFile(tmpFile);
        await fs.promises.unlink(tmpFile); // Clean up the temporary file

        // Send audio or video
        if (command === 'playvideo') {
            await conn.sendMessage(m.chat, {
                video: buffer,
                mimetype: 'video/mp4',
                fileName: `${videoInfo.title}.mp4`,
                caption: 'Video scaricato con successo!',
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, {
                audio: buffer,
                mimetype: 'audio/mpeg',
                fileName: `${videoInfo.title}.mp3`,
                ptt: false,
            }, { quoted: m });
        }
    } catch (error) {
        console.log(`[ERRORE] ${error.message}`);
        await conn.reply(m.chat, '❌ *Errore durante il download, riprova!*', m);
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
}

let handler = async (m, { conn, command, text, usedprefix }) => {
    const prefix = usedprefix || '.';
    if (!text) {
        const helpMessage = `
        *╭─ׄ✦☾⋆⁺₊✧ 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 ✧₊⁺⋆☽✦─ׅ⭒*
        *├* *\`${prefix}play\` _<nome/url>_
        *├* ↳ 『 🎵 』- *Scarica audio veloce*
        *├* *\`${prefix}playaudio\` _<nome/url>_
        *├* ↳ 『 🎶 』- *Scarica solo l'audio*
        *├* *\`${prefix}playvideo\` _<nome/url>_
        *├* ↳ 『 🎥 』- *Scarica video*
        *╰⭒─ׄ─▢─
        `;
        await conn.reply(m.chat, helpMessage, m);
        return;