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

// --- UTILS ---
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

const __dirname = global.__dirname(import.meta.url);
const logger = pino({ level: 'silent' });
global.store = makeInMemoryStore({ logger });

// --- DATABASE ---
global.db = new Low(new JSONFile('database.json'));
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = { users: {}, chats: {}, stats: {}, settings: {}, ...(global.db.data || {}) };
};
await global.loadDatabase();

// --- AUTH ---
global.authFile = 'bloodsession';
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterCache = new NodeCache();

const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
};

// --- INTERFACCIA DI AVVIO ---
let opzione;
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.authFile}/creds.json`)) {
    do {
        const v1 = chalk.hex('#9d00ff'); 
        const v2 = chalk.hex('#00e5ff'); 
        const v3 = chalk.hex('#ff00d4'); 
        const softText = chalk.hex('#b0b0b0');

        console.clear();
        const a = v1('╭━━━━━━━━━━━━━• ✧˚🩸BLD BLOOD🕊️˚✧ •━━━━━━━━━━━━━');
        const b = v1('╰━━━━━━━━━━━━━• ☾⋆₊✧ 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 ✧₊⋆☽ •━━━━━━━━━━━━━');
        const linea = v2('   ✦━━━━━━✦✦━━━━━━༺༻━━━━━━༺༻━━━━━━✦✦━━━━━━✦');
        
        const menu = `
${a}
          ${v3('SELEZIONE METODO DI ACCESSO ✦')}
${linea}
${v1(' ┌─⭓')} ${chalk.bold.white('1. Scansione con QR Code')}
${v1(' └─⭓')} ${chalk.bold.white('2. Codice di 8 cifre')}
${linea}
${v1(' ┌─⭓')} ${softText.italic('Digita il numero e premi Invio.')}
${v2.italic('                   by blood')}
${b}`;

        opzione = await question(menu + v3.bold('\n⌯ Inserisci la tua scelta ---> '));
    } while (!/^[1-2]$/.test(opzione));
}

// --- CONNESSIONE ---
const connectionOptions = {
    logger: logger,
    browser: opzione === '1' ? Browsers.windows('Chrome') : Browsers.macOS('Safari'),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    decodeJid: (jid) => {
        if (!jid) return jid;
        return jidNormalizedUser(jid);
    },
    printQRInTerminal: opzione === '1' || methodCodeQR,
    getMessage: async (key) => {
        const jid = jidNormalizedUser(key.remoteJid);
        const msg = await global.store.loadMessage(jid, key.id);
        return msg?.message || undefined;
    },
    msgRetryCounterCache
};

global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn.ev);

// --- PAIRING CODE ---
if (!fs.existsSync(`./${global.authFile}/creds.json`) && opzione === '2') {
    if (!global.conn.authState.creds.registered) {
        let addNumber = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : '';
        if (!addNumber) {
            const input = await question(chalk.bgHex('#00e5ff').black.bold(` Inserisci il numero (es: 39347...) `) + '\n' + chalk.hex('#ff00d4')('━━► '));
            addNumber = input.replace(/\D/g, '');
        }
        setTimeout(async () => {
            let codeBot = await global.conn.requestPairingCode(addNumber, 'BLOODBOT');
            codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
            console.log(chalk.bgHex('#9d00ff').white.bold('『 🔗 』– CODICE:'), chalk.hex('#00e5ff').bold(codeBot));
        }, 3000);
    }
}

// --- HANDLERS ---
async function connectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr && !global.qrGenerated) {
        console.log(chalk.hex('#00ff88').bold(`\n 🪐 SCANSIONA IL QR - SCADENZA 45s 🪐`));
        global.qrGenerated = true;
    }
    
    if (connection === 'open') {
        console.clear();
        const gradiente = ['#4d00ff', '#6a00ff', '#8600ff', '#a300ff', '#bf00ff', '#db00ff'];
        const logo = [
            `██████╗ ██╗      ██████╗  ██████╗ ██████╗ ██████╗  ██████╗ ████████╗`,
            `██╔══██╗██║     ██╔═══██╗██╔═══██╗██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝`,
            `██████╔╝██║     ██║   ██║██║   ██║██║  ██║██████╔╝██║   ██║   ██║`,
            `██╔══██╗██║     ██║   ██║██║   ██║██║  ██║██╔══██╗██║   ██║   ██║`,
            `██████╔╝███████╗╚██████╔╝╚██████╔╝██████╔╝██████╔╝╚██████╔╝   ██║`,
            `╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝  ╚═════╝    ╚═╝`
        ];
        logo.forEach((line, i) => console.log(chalk.hex(gradiente[i])(line)));
        console.log(chalk.hex('#00e5ff').bold(`⭑⭒━━━✦❘༻☾⋆⁺₊✧ 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 CONNESSO ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
    }

    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        console.log(chalk.hex('#ff4500')(`\n⚠️ Connessione chiusa (Codice: ${reason}). Riavvio...`));
        process.exit();
    }
}

global.conn.ev.on('connection.update', connectionUpdate);
global.conn.ev.on('creds.update', saveCreds);

console.log(chalk.hex('#00e5ff').bold('✦ SISTEMA BLOOD BOT AVVIATO ✦'));