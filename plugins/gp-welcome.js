import { WAMessageStubType } from '@realvare/based';
import axios from 'axios';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const groupBackgroundCache = new Map();
const profilePicCache = new Map();
const DEFAULT_AVATAR_URL = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg';

let defaultAvatarBuffer = null;
let puppeteer = null;
let browser = null;
let isPuppeteerAvailable = false;

const initPuppeteer = async () => {
    try {
        puppeteer = await import('puppeteer');
        isPuppeteerAvailable = true;
        return true;
    } catch (error) {
        console.error('⚠️ Puppeteer non disponibile, userò Browserless come fallback:', error.message);
        isPuppeteerAvailable = false;
        return false;
    }
};

const initBrowser = async () => {
    if (!puppeteer || !isPuppeteerAvailable) return false;
    try {
        if (!browser) {
            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
                    '--disable-gpu', '--no-first-run', '--no-zygote', '--single-process',
                    '--disable-features=VizDisplayCompositor'
                ]
            });
        }
        return true;
    } catch (error) {
        console.error('❌ Errore inizializzazione browser Puppeteer:', error);
        isPuppeteerAvailable = false;
        return false;
    }
};

const createFallbackAvatar = async () => {
    const svgAvatar = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="200" fill="#6B7280"/><circle cx="200" cy="160" r="60" fill="#F3F4F6"/><ellipse cx="200" cy="300" rx="100" ry="80" fill="#F3F4F6"/></svg>`;
    return Buffer.from(svgAvatar);
};

const preloadDefaultAvatar = async () => {
    if (defaultAvatarBuffer) return;
    try {
        const res = await axios.get(DEFAULT_AVATAR_URL, {
            responseType: 'arraybuffer',
            timeout: 5000,
            headers: { 'User-Agent': 'varebot/2.5' }
        });
        defaultAvatarBuffer = res.status === 200 ? Buffer.from(res.data) : await createFallbackAvatar();
    } catch (error) {
        defaultAvatarBuffer = await createFallbackAvatar();
    }
};

async function getUserName(conn, jid, pushNameFromStub = '') {
    if (pushNameFromStub === 'created' || pushNameFromStub === 'Created' || !pushNameFromStub) {
        pushNameFromStub = '';
    }
    const isValid = str => str && typeof str === 'string' && str.length > 1 && str.length < 26 && !/^\d+$/.test(str) && !str.includes('@');
    if (isValid(pushNameFromStub)) return pushNameFromStub;
    const contact = conn.contacts?.[jid];
    if (contact) {
        if (isValid(contact.notify)) return contact.notify;
        if (isValid(contact.name)) return contact.name;
        if (isValid(contact.pushName)) return contact.pushName;
    }
    try {
        const nameFromApi = await Promise.race([
            conn.getName(jid),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
        ]);
        if (isValid(nameFromApi)) return nameFromApi;
    } catch (e) {}
    return `Utente ${jid.split('@')[0].replace(/:\d+/, '')}`;
}

async function getUserProfilePic(conn, jid) {
    if (profilePicCache.has(jid)) return profilePicCache.get(jid);
    let url;
    try {
        url = await Promise.race([
            conn.profilePictureUrl(jid, 'image'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1500))
        ]);
    } catch (e) { url = null; }
    if (url) {
        try {
            const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
            if (res.status === 200) {
                const buffer = Buffer.from(res.data);
                profilePicCache.set(jid, buffer);
                return buffer;
            }
        } catch (e) {}
    }
    if (!defaultAvatarBuffer) await preloadDefaultAvatar();
    return defaultAvatarBuffer;
}

async function getGroupBackgroundImage(groupJid, conn) {
    if (groupBackgroundCache.has(groupJid)) return groupBackgroundCache.get(groupJid);
    let buffer = null;
    try {
        const url = await conn.profilePictureUrl(groupJid, 'image');
        if (url) {
            const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 4000 });
            if (res.status === 200) buffer = Buffer.from(res.data);
        }
    } catch (e) {}
    if (!buffer) {
        try {
            const fallback = path.join(__dirname, '..', 'media', 'benvenuto-addio.jpg');
            buffer = await fs.readFile(fallback);
        } catch (e) {
            buffer = Buffer.from(`<svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#764ba2"/></svg>`);
        }
    }
    groupBackgroundCache.set(groupJid, buffer);
    return buffer;
}

const WelcomeCard = ({ backgroundUrl, pfpUrl, isGoodbye, username, groupName }) => {
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 1600px; height: 900px; font-family: 'Poppins', sans-serif; background: #1a1a1a; overflow: hidden; }
        .container { width: 100%; height: 100%; position: relative; display: flex; justify-content: center; align-items: center; }
        .background { position: absolute; width: 100%; height: 100%; background: url('${backgroundUrl || ''}') center/cover; filter: blur(30px) brightness(0.7); opacity: 0.7; }
        .overlay { position: absolute; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); }
        .card { position: relative; width: 90%; height: 85%; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 50px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; padding: 45px; z-index: 2; }
        .pfp { width: 280px; height: 280px; border-radius: 50%; border: 8px solid #FFF; box-shadow: 0 0 30px rgba(255, 255, 255, 0.7); object-fit: cover; margin-bottom: 30px; }
        .title { font-size: 100px; text-shadow: 0 0 12px rgba(255,255,255,0.7); line-height: 1; }
        .username { font-size: 72px; margin: 10px 0; word-break: break-all; text-align: center; }
        .group-name { font-size: 56px; color: #ccc; text-align: center; }
        .footer { position: absolute; bottom: 35px; font-size: 42px; }
    `;

    return React.createElement('html', null,
        React.createElement('head', null, React.createElement('style', { dangerouslySetInnerHTML: { __html: styles } })),
        React.createElement('body', null,
            React.createElement('div', { className: 'container' },
                React.createElement('div', { className: 'background' }),
                React.createElement('div', { className: 'overlay' }),
                React.createElement('div', { className: 'card' },
                    React.createElement('img', { src: pfpUrl, className: 'pfp' }),
                    React.createElement('h1', { className: 'title' }, 'BENVENUTO!'),
                    React.createElement('h2', { className: 'username' }, username),
                    React.createElement('p', { className: 'group-name' }, groupName),
                    React.createElement('div', { className: 'footer' }, '✦ ⋆ ✧ ⭒ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ⭒ ✧ ⋆ ✦')
                )
            )
        )
    );
};

async function createImage(username, groupName, profilePicBuffer, isGoodbye, groupJid, conn) {
    const backgroundBuffer = await getGroupBackgroundImage(groupJid, conn);
    const toBase64 = (buffer, type) => `data:image/${type};base64,${buffer.toString('base64')}`;
    const backgroundUrl = toBase64(backgroundBuffer, 'jpeg');
    const pfpUrl = toBase64(profilePicBuffer || defaultAvatarBuffer, 'jpeg');

    const element = React.createElement(WelcomeCard, { backgroundUrl, pfpUrl, isGoodbye, username, groupName });
    const htmlContent = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(element)}`;

    if (isPuppeteerAvailable && browser) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 900 });
        await page.setContent(htmlContent);
        const screenshot = await page.screenshot({ type: 'jpeg', quality: 90 });
        await page.close();
        return screenshot;
    }

    const browserlessApiKey = global.APIKeys?.browserless;
    const res = await axios.post(`https://production-sfo.browserless.io/screenshot?token=${browserlessApiKey}`, {
        html: htmlContent,
        viewport: { width: 1600, height: 900 }
    }, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
}

const requestCounter = { count: 0, lastReset: Date.now(), isBlocked: false, blockUntil: 0 };
function checkAntiSpam() {
    const now = Date.now();
    if (requestCounter.isBlocked && now < requestCounter.blockUntil) return false;
    if (now - requestCounter.lastReset > 30000) { requestCounter.count = 0; requestCounter.lastReset = now; }
    requestCounter.count++;
    if (requestCounter.count > 6) {
        requestCounter.isBlocked = true;
        requestCounter.blockUntil = now + 45000;
        return false;
    }
    return true;
}

initPuppeteer().then(preloadDefaultAvatar);

export async function before(m, { conn, groupMetadata }) {
    if (!m.isGroup || !m.messageStubType) return true;

    const chat = global.db?.data?.chats?.[m.chat];
    if (!chat || !chat.welcome) return true;

    // FILTRO: Solo entrate effettive (27 = aggiunto/link, 31 = aggiunto via admin/invito accettato)
    if (![27, 31].includes(m.messageStubType)) return true;

    const who = m.messageStubParameters?.[0];
    const pushNameFromStub = m.messageStubParameters?.[1];
    if (!who || !who.includes('@')) return true;
    
    const jid = conn.decodeJid(who);
    const cleanUserId = jid.split('@')[0];

    if (!checkAntiSpam()) return true;

    const [username, profilePic] = await Promise.all([
        getUserName(conn, jid, pushNameFromStub),
        getUserProfilePic(conn, jid)
    ]);

    const groupName = groupMetadata?.subject || 'Gruppo';
    const memberCount = groupMetadata?.participants?.length || 0;
    const displayName = (username.startsWith('Utente ')) ? cleanUserId : username;

    const caption = `*\`Benvenuto/a\`* @${cleanUserId} *✧*\n┊ *\`In\`* *${groupName}*\n*╰►* *\`Membri:\`* ${memberCount}`;

    try {
        const image = await createImage(displayName, groupName, profilePic, false, m.chat, conn);
        await conn.sendMessage(m.chat, {
            image,
            caption,
            mentions: [jid],
            contextInfo: { ...(global.fake?.contextInfo || {}) }
        });
    } catch (error) {
        await conn.sendMessage(m.chat, { text: caption, mentions: [jid] });
    }
    return true;
}
