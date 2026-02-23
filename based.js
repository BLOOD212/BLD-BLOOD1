process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';

// --- RISOLUZIONE ERRORI MEMORIA ---
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 0; 
process.setMaxListeners(0);

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
    if (global.db.READ) return;
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = { users: {}, chats: {}, stats: {}, settings: {}, ...(global.db.data || {}) };
    global.db.chain = chain(global.db.data);
};
loadDatabase();

if (!(global.conns instanceof Array)) global.conns = [];

global.creds = 'creds.json';
global.authFile = 'bloodssion';
global.authFileJB = '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙-sub';

setPerformanceConfig({
    performance: { enableCache: true, enableMetrics: true },
    debug: { enableLidLogging: true, logLevel: 'debug' }
});

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterMap = (MessageRetryMap) => { };
const msgRetryCounterCache = new NodeCache();
const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => resolve(data.toString().trim()));
    });
};

let opzione;
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
    do {
        const violet1 = chalk.hex('#9B59B6');
        const violet2 = chalk.hex('#8E44AD');
        const violet3 = chalk.hex('#7D3C98');
        const violet4 = chalk.hex('#5B2C6F');
        const softText = chalk.hex('#D7BDE2');

        const a = violet1('╭━━━━━━━━━━━━━• ✧˚🩸 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 🕊️˚✧ •━━━━━━━━━━━━━');
        const b = violet1('╰━━━━━━━━━━━━━• ☾⋆₊✧ 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 ✧₊⋆☽ •━━━━━━━━━━━━━');
        const linea = violet2('   ✦━━━━━━✦✦━━━━━━༺༻━━━━━━༺༻━━━━━━✦✦━━━━━━✦');
        const sm = violet3('SELEZIONE METODO DI ACCESSO ✦');
        const qr = violet4(' ┌─⭓') + ' ' + chalk.bold.hex('#D2B4DE')('1. Scansione con QR Code');
        const codice = violet4(' └─⭓') + ' ' + chalk.bold.hex('#D2B4DE')('2. Codice di 8 cifre');
        const istruzioni = [
            violet4(' ┌─⭓') + softText.italic(' Digita solo il numero corrispondente.'),
            violet4(' └─⭓') + softText.italic(' Premi Invio per confermare.'),
            softText.italic(''),
            violet1.italic('                   by sam'),
        ];
        const prompt = chalk.hex('#BB8FCE').bold('\n⌯ Inserisci la tua scelta ---> ');

        opzione = await question(`\n${a}\n\n          ${sm}\n${linea}\n\n${qr}\n${codice}\n\n${linea}\n${istruzioni.join('\n')}\n\n${b}\n${prompt}`);

        if (!/^[1-2]$/.test(opzione)) {
            console.log(`\n${chalk.hex('#E74C3C').bold('✖ INPUT NON VALIDO')}\n\n${chalk.hex('#F5EEF8')('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n${chalk.hex('#EC7063').bold('⚠️ Sono ammessi solo i numeri')} ${chalk.bold.green('1')} ${chalk.hex('#EC7063').bold('o')} ${chalk.bold.green('2')}\n${chalk.hex('#FADBD8')('┌─⭓ Nessuna lettera o simbolo')}\n${chalk.hex('#FADBD8')('└─⭓ Copia il numero dell\'opzione desiderata e incollalo')}\n${chalk.hex('#BB8FCE').italic('\n✧ Suggerimento: Se hai dubbi, scrivi al creatore +393701330693')}\n`);
        }
    } while ((opzione !== '1' && opzione !== '2') || fs.existsSync(`./${authFile}/creds.json`));
}

const filterStrings = ["Q2xvc2luZyBzdGFsZSBvcGVu", "Q2xvc2luZyBvcGVuIHNlc3Npb24=", "RmFpbGVkIHRvIGRlY3J5cHQ=", "U2Vzc2lvbiBlcnJvcg==", "RXJyb3I6IEJhZCBNQUM=", "RGVjcnlwdGVkIG1lc3NhZ2U="];
console.info = () => {}; console.debug = () => {};
['log', 'warn', 'error'].forEach(methodName => redefineConsoleMethod(methodName, filterStrings));
const logger = pino({ level: 'silent' });
global.store = makeInMemoryStore({ logger });

const connectionOptions = {
    logger,
    mobile: MethodMobile,
    browser: opzione === '1' ? Browsers.windows('Chrome') : Browsers.macOS('Safari'),
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
    decodeJid: (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) return jidNormalizedUser(jid);
        return jid;
    },
    printQRInTerminal: opzione === '1' || methodCodeQR ? true : false,
    msgRetryCounterCache,
};

global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn.ev);

if (!fs.existsSync(`./${authFile}/creds.json`) && (opzione === '2' || methodCode)) {
    if (!conn.authState.creds.registered) {
        let addNumber = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : (await question(chalk.bgBlack(chalk.bold.bgMagentaBright("Inserisci il numero WhatsApp: ")))).replace(/\D/g, '');
        setTimeout(async () => {
            let codeBot = await conn.requestPairingCode(addNumber, 'BLOODBOT');
            codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
            console.log(chalk.bold.white(chalk.bgMagenta('『 🔗 』– CODICE:')), chalk.bold.white(codeBot));
        }, 3000);
    }
}

async function connectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;
    if (qr && (opzione === '1' || methodCodeQR) && !global.qrGenerated) {
        console.log(chalk.bold.yellow(`\n 🪐 SCANSIONA IL CODICE QR 🪐`));
        global.qrGenerated = true;
    }
    if (connection === 'open') {
        global.qrGenerated = false;
        if (!global.isLogoPrinted) {
            const violet = ['#3b0d95', '#3b0d90', '#3b0d85', '#3b0d80', '#3b0d75', '#3b0d70', '#3b0d65', '#3b0d60', '#3b0d55', '#3b0d50', '#3b0d45'];
            const logo = [
                ` ██▓███   ██▓     ▒█████   ▒█████  ▓█████▄  ▄▄▄▄    ▒█████  ▄▄▄█████▓ `,
                `▓██░  ██▒▓██▒    ▒██▒  ██▒▒██▒  ██▒▒██▀ ██▌▓█████▄ ▒██▒  ██▒▓  ██▒ ▓▒ `,
                `▓██░ ██▓▒▒██░    ▒██░  ██▒▒██░  ██▒░██   █▌▒██▒ ▄██▒██░  ██▒▒ ▓██░ ▒░ `,
                `▒██▄█▓▒ ▒▒██░    ▒██   ██░▒██   ██░░▓█▄   ▌▒██░█▀  ▒██   ██░░ ▓██▓ ░  `,
                `▒██▒ ░  ░░██████▒░ ████▓▒░░ ████▓▒░░▒████▓ ░▓█  ▀█▓░ ████▓▒░  ▒██▒ ░  `,
                `▒▓▒░ ░  ░░ ▒░▓  ░░ ▒░▒░▒░ ░ ▒░▒░▒░  ▒▒▓  ▒ ░▒▓███▀▒░ ▒░▒░▒░   ▒ ░░    `,
                `░▒ ░     ░ ░ ▒  ░  ░ ▒ ▒░   ░ ▒ ▒░  ░ ▒  ▒ ▒░▒   ░   ░ ▒ ▒░     ░     `,
                `░░         ░ ░   ░ ░ ░ ▒  ░ ░ ░ ▒   ░ ░  ░  ░    ░ ░ ░ ░ ▒    ░       `,
                `             ░  ░    ░ ░      ░ ░     ░     ░          ░ ░            `
            ];
            logo.forEach((line, i) => console.log(chalk.hex(violet[i] || '#3b0d45')(line)));
            global.isLogoPrinted = true;
        }
    }
    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason !== DisconnectReason.loggedOut) await global.reloadHandler(true);
    }
}

let isInit = true;
global.reloadHandler = async function (restatConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`);
        global.handler = Handler.handler || Handler;
    } catch (e) { console.error(e); }

    if (restatConn) {
        try { global.conn.ws.close(); } catch { }
        global.conn.ev.removeAllListeners();
        global.conn = makeWASocket(connectionOptions);
        global.store.bind(global.conn.ev);
    }

    if (!isInit && global.conn) {
        if (global.conn.handler) global.conn.ev.off('messages.upsert', global.conn.handler);
        if (global.conn.connectionUpdate) global.conn.ev.off('connection.update', global.conn.connectionUpdate);
        if (global.conn.credsUpdate) global.conn.ev.off('creds.update', global.conn.credsUpdate);
    }

    global.conn.handler = global.handler.bind(global.conn);
    global.conn.connectionUpdate = connectionUpdate.bind(global.conn);
    global.conn.credsUpdate = saveCreds.bind(global.conn);

    global.conn.ev.on('messages.upsert', global.conn.handler);
    global.conn.ev.on('connection.update', global.conn.connectionUpdate);
    global.conn.ev.on('creds.update', global.conn.credsUpdate);
    
    isInit = false;
    return true;
};

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
global.reload = async (_ev, filename) => {
    if (/\.js$/.test(filename)) {
        const dir = global.__filename(join(pluginFolder, filename), true);
        await import(`${global.__filename(dir)}?update=${Date.now()}`).catch(console.error);
    }
};

if (global.pluginWatcher) global.pluginWatcher.close();
global.pluginWatcher = watch(pluginFolder, global.reload);

let filePath = fileURLToPath(import.meta.url);
if (global.mainWatcher) global.mainWatcher.close();
global.mainWatcher = watch(filePath, async () => {
    console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'based.js' Aggiornato")));
    await global.reloadHandler(true);
});

await global.reloadHandler();

setInterval(() => {
    const tmp = join(__dirname, 'tmp');
    if (existsSync(tmp)) readdirSync(tmp).forEach(f => rmSync(join(tmp, f), { recursive: true, force: true }));
    console.log(chalk.bold.magenta(`\n╭⭑⭒━━━✦❘༻ 🟣 PULIZIA 🟣 ༺❘✦━━━⭒⭑\n┃      SISTEMA PULITO CON SUCCESSO\n╰⭑⭒━━━✦❘༻☾⋆⁺₊🗑️ 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 ♻️₊⁺⋆☽༺❘✦━━━⭒⭑`));
}, 1000 * 60 * 60);
