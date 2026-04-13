// 🎯 PLUGIN VOIP ELITE V3 - ANTI-BLOCK 403
// Powered by Giuse & Blood

let isScraperReady = false;
let axios, cheerio;

try {
    axios = (await import('axios')).default;
    cheerio = await import('cheerio');
    isScraperReady = true;
} catch (e) {
    console.log("ERRORE VOIP: Librerie mancanti.");
}

const baseUrl = 'https://sms24.me';

// Header ultra-realistici per bypassare il 403
const getHeaders = () => ({
    'authority': 'sms24.me',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
    'cache-control': 'max-age=0',
    'referer': 'https://www.google.com/',
    'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'cross-site',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const nazioni = [
    { id: '1', nome: 'Stati Uniti 🇺🇸', path: '/en/countries/us' },
    { id: '2', nome: 'Regno Unito 🇬🇧', path: '/en/countries/gb' },
    { id: '3', nome: 'Francia 🇫🇷', path: '/en/countries/fr' },
    { id: '4', nome: 'Svezia 🇸🇪', path: '/en/countries/se' },
    { id: '5', nome: 'Germania 🇩🇪', path: '/en/countries/de' },
    { id: '6', nome: 'Italia 🇮🇹', path: '/en/countries/it' },
    { id: '7', nome: 'Olanda 🇳🇱', path: '/en/countries/nl' },
    { id: '8', nome: 'Spagna 🇪🇸', path: '/en/countries/es' },
    { id: '9', nome: 'Canada 🇨🇦', path: '/en/countries/ca' },
    { id: '10', nome: 'Belgio 🇧🇪', path: '/en/countries/be' },
    { id: '11', nome: 'Austria 🇦🇹', path: '/en/countries/at' },
    { id: '12', nome: 'Danimarca 🇩🇰', path: '/en/countries/dk' },
    { id: '13', nome: 'Polonia 🇵🇱', path: '/en/countries/pl' },
    { id: '14', nome: 'Portogallo 🇵🇹', path: '/en/countries/pt' },
    { id: '15', nome: 'Russia 🇷🇺', path: '/en/countries/ru' },
    { id: '16', nome: 'Estonia 🇪🇪', path: '/en/countries/ee' },
    { id: '17', nome: 'Lettonia 🇱🇻', path: '/en/countries/lv' },
    { id: '18', nome: 'Lituania 🇱🇹', path: '/en/countries/lt' },
    { id: '19', nome: 'Rep. Ceca 🇨🇿', path: '/en/countries/cz' },
    { id: '20', nome: 'Romania 🇷🇴', path: '/en/countries/ro' },
    { id: '21', nome: 'Croazia 🇭🇷', path: '/en/countries/hr' },
    { id: '22', nome: 'Hong Kong 🇭🇰', path: '/en/countries/hk' },
    { id: '23', nome: 'Cina 🇨🇳', path: '/en/countries/cn' },
    { id: '24', nome: 'Malesia 🇲🇾', path: '/en/countries/my' },
    { id: '25', nome: 'Indonesia 🇮🇩', path: '/en/countries/id' },
    { id: '26', nome: 'Filippine 🇵🇭', path: '/en/countries/ph' },
    { id: '27', nome: 'Thailandia 🇹🇭', path: '/en/countries/th' },
    { id: '28', nome: 'Vietnam 🇻🇳', path: '/en/countries/vn' },
    { id: '29', nome: 'Sudafrica 🇿🇦', path: '/en/countries/za' },
    { id: '30', nome: 'Brasile 🇧🇷', path: '/en/countries/br' },
    { id: '31', nome: 'Messico 🇲🇽', path: '/en/countries/mx' },
    { id: '32', nome: 'India 🇮🇳', path: '/en/countries/in' },
    { id: '33', nome: 'Ucraina 🇺🇦', path: '/en/countries/ua' },
    { id: '34', nome: 'Svizzera 🇨🇭', path: '/en/countries/ch' },
    { id: '35', nome: 'Irlanda 🇮🇪', path: '/en/countries/ie' },
    { id: '36', nome: 'Norvegia 🇳🇴', path: '/en/countries/no' },
    { id: '37', nome: 'Australia 🇦🇺', path: '/en/countries/au' },
    { id: '38', nome: 'Israele 🇮🇱', path: '/en/countries/il' },
    { id: '39', nome: 'Kazakistan 🇰🇿', path: '/en/countries/kz' },
    { id: '40', nome: 'Finlandia 🇫🇮', path: '/en/countries/fi' }
];

async function fetchMessaggi(numeroTelefono) {
    try {
        const numUrl = `${baseUrl}/en/numbers/${numeroTelefono.replace('+', '')}`;
        const { data } = await axios.get(numUrl, { headers: getHeaders(), timeout: 15000 });
        const $ = cheerio.load(data);
        let messaggi = [];
        $('.shadow-sm, .list-group-item, .callout').each((i, el) => {
            let mittente = $(el).find('a').first().text().trim() || 'SCONOSCIUTO';
            let tempo = $(el).find('.text-info, .text-muted, small').first().text().trim() || 'ADESS0';
            let testo = $(el).text().replace(/\s+/g, ' ').replace(mittente, '').replace(tempo, '').trim();
            if (testo.length > 2) messaggi.push({ mittente, tempo, testo });
        });
        return messaggi;
    } catch (e) { return null; }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!isScraperReady) return m.reply("❌ Errore librerie.");
    const cmd = command.toLowerCase();

    if (cmd === 'menuvoip') {
        let menu = `┏━━━ « 📱 *VOIP PANEL V3* » ━━━┓\n┃\n┃ 🌍 *${usedPrefix}voip*\n┃ 🔍 *${usedPrefix}voip <id>*\n┃ 🔥 *${usedPrefix}lastvoips*\n┃ 📡 *${usedPrefix}regvoip <num>*\n┃ 📩 *${usedPrefix}voip sms <num>*\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
        return m.reply(menu);
    }

    if (cmd === 'lastvoips' || (cmd === 'voip' && args[0])) {
        let isNazione = nazioni.find(n => n.id === args[0]);
        let url = isNazione ? `${baseUrl}${isNazione.path}` : `${baseUrl}/en`;
        let { key } = await conn.sendMessage(m.chat, { text: `📡 *CONTATTANDO IL PROVIDER...*` });
        
        try {
            await sleep(2000); // Ritardo simulato per sembrare umano
            const { data } = await axios.get(url, { headers: getHeaders(), timeout: 20000 });
            const $ = cheerio.load(data);
            let nms = [];
            $('a').each((i, el) => {
                let t = $(el).text().trim();
                if (t.includes('+')) nms.push(t.replace(/[^0-9]/g, ''));
            });

            if (nms.length === 0) throw new Error("Layout non riconosciuto o blocco attivo.");
            
            let res = `🟢 *NUMERI DISPONIBILI* 🟢\n\n`;
            [...new Set(nms)].slice(0, 20).forEach((n, i) => res += `*${i+1}.* \`+${n}\`\n`);
            return conn.sendMessage(m.chat, { text: res, edit: key });
        } catch (e) {
            let errorMsg = e.response?.status === 403 
                ? "❌ *ERRORE 403:* Il sito ha bloccato l'IP del server. Cloudflare è troppo forte su questa VPS." 
                : `❌ *ERRORE:* ${e.message}`;
            return conn.sendMessage(m.chat, { text: errorMsg, edit: key });
        }
    }

    // Comandi regvoip e voip sms rimangono simili ma usano i nuovi headers
    if (cmd === 'regvoip') {
        const num = args[0]?.replace('+', '');
        if (!num) return m.reply("Inserisci il numero.");
        m.reply(`🚀 Radar attivo per \`+${num}\`. Ti avviserò se arriva un SMS (Max 3 min).`);
        let lastOld = "NONE";
        for (let i = 0; i < 12; i++) {
            await sleep(15000);
            let current = await fetchMessaggi(num);
            if (current && current.length > 0 && current[0].testo !== lastOld) {
                return m.reply(`🔔 *SMS:* \`+${num}\`\n👤 Da: ${current[0].mittente}\n💬: ${current[0].testo}`);
            }
        }
    }
};

handler.command = /^(voip|regvoip|lastvoips|menuvoip)$/i;
export default handler;
