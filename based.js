process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, readFileSync, mkdirSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import { tmpdir } from 'os';
import { format } from 'util';
import pino from 'pino';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import NodeCache from 'node-cache';
import { ripristinaTimer } from './plugins/gp-configgruppo.js';

const DisconnectReason = {
    connectionClosed: 428,
    connectionLost: 408,
    connectionReplaced: 440,
    timedOut: 408,
    loggedOut: 401,
    badSession: 500,
    restartRequired: 515,
    multideviceMismatch: 411,
    forbidden: 403,
    unavailableService: 503
};
const { useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, getPerformanceConfig, setPerformanceConfig, Logger, makeInMemoryStore } = await import('@realvare/based');
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
protoType();
serialize();
global.isLogoPrinted = false;
global.qrGenerated = false;
global.connectionMessagesPrinted = {};
let methodCodeQR = process.argv.includes("qr");
let methodCode = process.argv.includes("code");
let MethodMobile = process.argv.includes("mobile");
let phoneNumber = global.botNumberCode;

function redefineConsoleMethod(methodName, filterStrings) {
    const originalConsoleMethod = console[methodName];
    console[methodName] = function () {
        const message = arguments[0];
        if (typeof message === 'string' && filterStrings.some(filterString => message.includes(atob(filterString)))) {
            arguments[0] = "";
        }
        originalConsoleMethod.apply(console, arguments);
    };
}

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};

global.__require = function require(dir = import.meta.url) {
    return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');
global.timestamp = { start: new Date };
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '*/!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@').replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&') + ']');
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new JSONFile('database.json') : new JSONFile('database.json'));
global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve) => setInterval(async function () {
            if (!global.db.READ) {
                clearInterval(this);
                resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
            }
        }, 1 * 1000));
    }
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = {
        users: {},
        chats: {},
        stats: {},
        settings: {},
        ...(global.db.data || {}),
    };
    global.db.chain = chain(global.db.data);
};
loadDatabase();

if (global.conns instanceof Array) {
} else {
    global.conns = [];
}

global.creds = 'creds.json';
global.authFile = 'bloodsession';
global.authFileJB = '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙-sub';

setPerformanceConfig({
    performance: {
        enableCache: true,
        enableMetrics: true
    },
    debug: {
        enableLidLogging: true,
        logLevel: 'debug'
    }
});

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterMap = (MessageRetryMap) => { };
const msgRetryCounterCache = new NodeCache();
const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
};

let opzione;
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
    do {
        const v1 = chalk.hex('#9d00ff'); // Deep Violet
        const v2 = chalk.hex('#00e5ff'); // Electric Cyan
        const v3 = chalk.hex('#ff00d4'); // Magenta Pop
        const softText = chalk.hex('#b0b0b0');

        const a = v1('╭━━━━━━━━━━━━━• ✧˚🩸BLD BLOOD🕊️˚✧ •━━━━━━━━━━━━━');
        const b = v1('╰━━━━━━━━━━━━━• ☾⋆₊✧ 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 ✧₊⋆☽ •━━━━━━━━━━━━━');
        const linea = v2('   ✦━━━━━━✦✦━━━━━━༺༻━━━━━━༺༻━━━━━━✦✦━━━━━━✦');
        const sm = v3('SELEZIONE METODO DI ACCESSO ✦');
        const qr = v1(' ┌─⭓') + ' ' + chalk.bold.white('1. Scansione con QR Code');
        const codice = v1(' └─⭓') + ' ' + chalk.bold.white('2. Codice di 8 cifre');
        const istruzioni = [
            v1(' ┌─⭓') + softText.italic(' Digita solo il numero corrispondente.'),
            v1(' └─⭓') + softText.italic(' Premi Invio per confermare.'),
            softText.italic(''),
            v2.italic('                   by blood'),
        ];
        const prompt = v3.bold('\n⌯ Inserisci la tua scelta ---> ');

        opzione = await question(`\n
${a}

          ${sm}
${linea}

${qr}
${codice}

${linea}
${istruzioni.join('\n')}

${b}
${prompt}`);

        if (!/^[1-2]$/.test(opzione)) {
            console.log(`\n${chalk.hex('#ff3b3b').bold('✖ INPUT NON VALIDO')}

${v1('━━━━━━━━━━━━━━𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙━━━━━━━━━━━━━')}
${chalk.hex('#ff6e6e').bold('⚠️ Sono ammessi solo i numeri')} ${chalk.bold.hex('#00ff88')('1')} ${chalk.hex('#ff6e6e').bold('o')} ${chalk.bold.hex('#00ff88')('2')}
${chalk.hex('#ffbaba')('┌─⭓ Nessuna lettera o simbolo')}
${chalk.hex('#ffbaba')('└─⭓ Copia il numero dell\'opzione desiderata e incollalo')}
${v2.italic('\n✧ Suggerimento: Se hai dubbi, scrivi al creatore +393476686131')}
`);
        }
    } while ((opzione !== '1' && opzione !== '2') || fs.existsSync(`./${authFile}/creds.json`));
}

const filterStrings = ["Q2xvc2luZyBzdGFsZSBvcGVu", "Q2xvc2luZyBvcGVuIHNlc3Npb24=", "RmFpbGVkIHRvIGRlY3J5cHQ=", "U2Vzc2lvbiBlcnJvcg==", "RXJyb3I6IEJhZCBNQUM=", "RGVjcnlwdGVkIG1lc3NhZ2U="];
console.info = () => {};
console.debug = () => {};
['log', 'warn', 'error'].forEach(methodName => redefineConsoleMethod(methodName, filterStrings));

const connectionOptions = {
    logger: logger,
    mobile: MethodMobile,
    browser: opzione === '1' ? Browsers.windows('Chrome') : methodCodeQR ? Browsers.windows('Chrome') : Browsers.macOS('Safari'),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    decodeJid: (jid) => {
        if (!jid) return jid;
        const cached = global.jidCache.get(jid);
        if (cached) return cached;
        let decoded = jidNormalizedUser(jid);
        global.jidCache.set(jid, decoded);
        return decoded;
    },
    printQRInTerminal: opzione === '1' || methodCodeQR ? true : false,
    getMessage: async (key) => {
        const jid = global.conn.decodeJid(key.remoteJid);
        const msg = await global.store.loadMessage(jid, key.id);
        return msg?.message || undefined;
    },
    msgRetryCounterCache,
    msgRetryCounterMap,
};

global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn.ev);

if (!fs.existsSync(`./${authFile}/creds.json`)) {
    if (opzione === '2' || methodCode) {
        if (!conn.authState.creds.registered) {
            let addNumber;
            if (phoneNumber) {
                addNumber = phoneNumber.replace(/[^0-9]/g, '');
            } else {
                phoneNumber = await question(chalk.bgHex('#00e5ff').black.bold(` Inserisci il numero di WhatsApp. `) + `\n` + chalk.hex('#ff00d4')('━━► '));
                addNumber = phoneNumber.replace(/\D/g, '');
            }
            setTimeout(async () => {
                let codeBot = await conn.requestPairingCode(addNumber, 'BLOODBOT');
                codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                console.log(chalk.bgHex('#9d00ff').white.bold('『 🔗 』– CODICE DI ABBINAMENTO:'), chalk.hex('#00e5ff').bold(codeBot));
            }, 3000);
        }
    }
}

async function connectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;
    if (qr && (opzione === '1' || methodCodeQR) && !global.qrGenerated) {
        console.log(chalk.hex('#00ff88').bold(`\n 🪐 SCANSIONA IL CODICE QR - SCADE TRA 45 SECONDI 🪐`));
        global.qrGenerated = true;
    }
    
    if (connection === 'open') {
        global.qrGenerated = false;
        if (!global.isLogoPrinted) {
            const gradiente = ['#4d00ff', '#6a00ff', '#8600ff', '#a300ff', '#bf00ff', '#db00ff'];
            const 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 = [
                `██████╗ ██╗      ██████╗  ██████╗ ██████╗ ██████╗  ██████╗ ████████╗`,
                `██╔══██╗██║     ██╔═══██╗██╔═══██╗██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝`,
                `██████╔╝██║     ██║   ██║██║   ██║██║  ██║██████╔╝██║   ██║   ██║`,
                `██╔══██╗██║     ██║   ██║██║   ██║██║  ██║██╔══██╗██║   ██║   ██║`,
                `██████╔╝███████╗╚██████╔╝╚██████╔╝██████╔╝██████╔╝╚██████╔╝   ██║`,
                `╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝  ╚═════╝    ╚═╝`
            ];
            𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙.forEach((line, i) => console.log(chalk.hex(gradiente[i])(line)));
            global.isLogoPrinted = true;
        }
    }

    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        const vError = chalk.hex('#ff4500').bold;
        if (reason === DisconnectReason.connectionLost) {
            console.log(vError(`\n╭⭑⭒━━━✦❘༻ ⚠️ CONNESSIONE PERSA COL SERVER ༺❘✦━━━⭒⭑\n┃ 🔄 RICONNESSIONE IN CORSO... \n╰⭑⭒━━━✦❘༻☾⋆₊✧𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
        } else if (reason === DisconnectReason.loggedOut) {
            console.log(vError(`\n⚠️ DISCONNESSO, SESSIONE ELIMINATA. RIAVVIA IL BOT ⚠️`));
            process.exit(1);
        } else if (reason === DisconnectReason.timedOut) {
            console.log(vError(`\n╭⭑⭒━━━✦❘༻ ⌛ TIMEOUT CONNESSIONE ༺❘✦━━━⭒⭑\n┃ 🔄 RICONNESSIONE IN CORSO...\n╰⭑⭒━━━✦❘༻☾⋆⁺₊✧ 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
        }
        await global.reloadHandler(true);
    }
}

async function connectSubBots() {
    const subBotDirectory = './𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙-sub';
    if (existsSync(subBotDirectory)) {
        const subBotFolders = readdirSync(subBotDirectory).filter(file => statSync(join(subBotDirectory, file)).isDirectory());
        if (subBotFolders.length === 0) {
            console.log(chalk.hex('#b0b0b0')('- 🌑 | Nessun subbot collegato'));
        } else {
            console.log(chalk.hex('#00ff88').bold(`🌙 ${subBotFolders.length} Sub-Bot rilevati nel sistema.`));
        }
    }
}

(async () => {
    conn.ev.on('connection.update', connectionUpdate);
    conn.ev.on('creds.update', saveCreds);
    console.log(chalk.hex('#00e5ff').bold(`⭑⭒━━━✦❘༻☾⋆⁺₊✧ 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 connesso correttamente ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
    await connectSubBots();
})();