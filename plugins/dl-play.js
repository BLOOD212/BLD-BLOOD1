import youtubedl from 'youtube-dl-exec'
import fs from 'fs'
import path from 'path'
import ytSearch from 'yt-search'

const videoInfoCache = new Map()
const CACHE_TTL = 15 * 60 * 1000
const A = [
    '251',
    '140',
    '250',
    '249',
    '139',
    'bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio',
    'best[height<=720][ext=mp4]/best[ext=mp4]'
]
const V = [
    '22',
    '136+140',
    '298+140',
    '135+140',
    '18',
    '134+140',
    'best[height<=1080][ext=mp4]/best[ext=mp4]/best[height<=720]'
]
const tmpDir = path.join(process.cwd(), 'temp')
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir)
}

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
        noPlaylist: true
    }
    if (options.format) opts.format = options.format
    if (options.output) opts.output = options.output
    if (options.extractAudio) {
        opts.extractAudio = true
        if (options.audioFormat) opts.audioFormat = options.audioFormat
        if (options.audioQuality) opts.audioQuality = options.audioQuality
        opts.keepVideo = false
    }
    if (options.maxFilesize) opts.maxFilesize = options.maxFilesize
    if (options.cookies) opts.cookies = options.cookies
    return await youtubedl(url, opts)
}

async function getVideoInfoYtDlExec(url) {
    try {
        const info = await youtubedl(url, {
            dumpJson: true,
            noDownload: true,
            noWarnings: true
        })
        return {
            title: info.title || 'Video YouTube',
            uploader: info.uploader || info.channel || 'Sconosciuto',
            duration: info.duration_string || (info.duration ? new Date(info.duration * 1000).toISOString().substr(11, 8) : '?'),
            view_count: info.view_count,
            upload_date: info.upload_date,
            thumbnail: info.thumbnail,
            id: info.id,
            webpage_url: info.webpage_url || url
        }
    } catch (error) {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
        return {
            title: 'Video YouTube',
            uploader: 'YouTube',
            duration: '?',
            view_count: null,
            upload_date: null,
            thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
            id: videoId,
            webpage_url: url
        }
    }
}

async function downloadMedia(m, conn, command, url, prefix, preloadedVideoInfo = null, isSearchQuery = false) {
    try {
        let videoInfo = preloadedVideoInfo;

        if (!videoInfo) {
            try {
                const searchResult = await ytSearch(url);
                if (searchResult && searchResult.videos && searchResult.videos.length > 0) {
                    const video = searchResult.videos[0];
                    videoInfo = {
                        title: video.title || 'Video YouTube',
                        uploader: video.author?.name || 'Sconosciuto',
                        duration: video.duration?.timestamp || video.duration || '?',
                        view_count: video.views,
                        upload_date: video.uploadedAt || null,
                        thumbnail: video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`,
                        id: video.videoId,
                        webpage_url: video.url
                    };
                }
            } catch (error) {
                console.log(`[ERRORE] yt-search fallito per URL ${url}: ${error.message}`)
                try {
                    videoInfo = await getVideoInfoYtDlExec(url)
                } catch (ytdlpError) {
                    console.log(`[ERRORE] fallback ytdlp anche fallito per URL ${url}: ${ytdlpError.message}`)
                    throw ytdlpError
                }
            }
        }

        if (videoInfo && videoInfo.id) {
            videoInfoCache.set(`info_${videoInfo.id}`, { data: videoInfo, timestamp: Date.now() });
        }

        const cookiesPath = path.join(process.cwd(), 'cookies.txt');
        const downloadOptions = {
            maxFilesize: '100M',
            ...(fs.existsSync(cookiesPath) && { cookies: cookiesPath })
        };

        const tmpFile = path.join(tmpDir, `${command}_${Date.now()}.${(command === 'playvideo') ? 'mp4' : 'mp3'}`);
        downloadOptions.output = tmpFile;

        if (command === 'play' || command === 'playaudio') {
            downloadOptions.extractAudio = true;
            downloadOptions.audioFormat = 'mp3';
            downloadOptions.audioQuality = '1';
        }

        const formats = (command === 'playvideo') ? V : A;
        let downloaded = false;
        let lastError = null;

        for (let i = 0; i < formats.length; i++) {
            const format = formats[i];
            const attemptOptions = { ...downloadOptions, format };
            const attemptFile = path.join(tmpDir, `${command}_attempt_${i}_${Date.now()}.${(command === 'playvideo') ? 'mp4' : 'mp3'}`);
            attemptOptions.output = attemptFile;

            if (command === 'play' || command === 'playaudio') {
                attemptOptions.extractAudio = true;
                attemptOptions.audioFormat = 'mp3';
                attemptOptions.audioQuality = '0';
            } else {
                delete attemptOptions.extractAudio;
                delete attemptOptions.audioFormat;
                delete attemptOptions.audioQuality;
            }

            try {
                console.log(`[DOWNLOAD] Tentativo di download per ${url} con formato ${format}`);
                await download(url, attemptOptions);
                downloaded = true;
                fs.renameSync(attemptFile, tmpFile); // Rinomina il file correttamente se il download è riuscito
                break;
            } catch (error) {
                fs.unlinkSync(attemptFile);  // Elimina il file temporaneo in caso di errore
                lastError = error;
                console.log(`[ERROR] Tentativo ${i} fallito per formato ${format}: ${error.message}`);
            }
        }

        if (!downloaded) {
            throw new Error(`Download fallito dopo tutti i tentativi. Ultimo errore: ${lastError?.message || 'Sconosciuto'}`);
        }

        const buffer = await fs.promises.readFile(tmpFile);
        await fs.promises.unlink(tmpFile).catch(() => {});

        // Invio del file al cliente
        if (command === 'playvideo') {
            const fileName = videoInfo ? `${videoInfo.title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 40)}.mp4` : 'video.mp4';
            await conn.sendMessage(m.chat, {
                video: buffer,
                mimetype: 'video/mp4',
                fileName: fileName,
                caption: `> \`𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙\``,
                footer: '',
                interactiveButtons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🎵 Scarica audio',
                            id: `${prefix}playaudio ${url}`
                        })
                    }
                ],
                contextInfo: {...global.fake?.contextInfo}
            }, { quoted: m });
        } else {
            const fileName = videoInfo ? `${videoInfo.title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 40)}.mp3` : 'audio.mp3';
            await conn.sendMessage(m.chat, {
                audio: buffer,
                mimetype: 'audio/mpeg',
                fileName: fileName,
                ptt: false,
                contextInfo: {
                    ...global.fake?.contextInfo,
                    externalAdReply: {
                        ...global.fake?.contextInfo?.externalAdReply,
                        title: videoInfo ? videoInfo.title : 'Audio',
                        body: '⋆⭑˚₊𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 ₊˚⭑⋆',
                        thumbnailUrl: videoInfo ? videoInfo.thumbnail : 'https://img.youtube.com/vi/default/maxresdefault.jpg',
                        sourceUrl: null,
                        mediaType: 2,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });
        }
    } catch (e) {
        const errorMessage = e.message?.includes('Sign in') ? `${global.errore}` :
            e.message?.includes('unavailable') ? '『 ❌ 』- \`Video non disponibile\