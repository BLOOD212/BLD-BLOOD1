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

// --- 1. FUNZIONI GLOBALI ---
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};
global.__require = function require(dir = import.meta.url) {
    return createRequire(dir);
};

// --- 2. INIZIALIZZAZIONE ---
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
protoType();
serialize();

const { useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, makeInMemoryStore } = await import('@realvare/based');
const logger = pino({ level: 'silent' });
global.store = makeInMemoryStore({ logger });

// --- 3. DATABASE ---
global.db = new Low(new JSONFile('database.json'));
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = { users: {}, chats: {}, stats: {}, settings: {}, ...(global.db.data || {}) };
};
await global.loadDatabase();

// --- 4. AUTH & SESSION ---
global.authFile = 'bloodsession';
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);

const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
};

// --- 5. LOGICA DI AVVIO ---
let opzione;
if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
    console.clear();
    const v1 = chalk.hex('#9d00ff'); 
    const v2 = chalk.hex('#00e5ff'); 
    const v3 = chalk.hex('#ff00d4'); 
    console.log(`
${v1('╭━━━━━━━━━━━━━• ✧˚🩸BLD BLOOD🕊️˚✧ •━━━━━━━━━━━━━')}
          ${v3('SELEZIONE METODO DI ACCESSO ✦')}
${v2('   ✦━━━━━━✦✦━━━━━━༺༻━━━━━━༺༻━━━━━━✦✦━━━━━━✦')}
${v1(' ┌─⭓')} ${chalk.bold.white('1. Scansione con QR Code')}
${v1(' └─⭓')} ${chalk.bold.white('2. Codice di 8 cifre')}
${v2('   ✦━━━━━━✦✦━━━━━━༺༻━━━━━━༺༻━━━━━━✦✦━━━━━━✦')}
${v1('╰━━━━━━━━━━━━━• ☾⋆₊✧ 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 ✧₊⋆☽ •━━━━━━━━━━━━━')}`);
    opzione = await question(v3.bold('\n⌯ Inserisci la tua scelta (1 o 2) ---> '));
}

// --- 6. CONNESSIONE ---
const connectionOptions = {
    logger: logger,
    browser: Browsers.macOS('Safari'),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    decodeJid: (jid) => jidNormalizedUser(jid),
    printQRInTerminal: opzione === '1',
    getMessage: async (key) => {
        const jid = jidNormalizedUser(key.remoteJid);
        const msg = await global.store.loadMessage(jid, key.id);
        return msg?.message || undefined;
    }
};

global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn.ev);

// --- 7. CARICAMENTO HANDLER ---
let handler = await import('./handler.js');
global.reloadHandler = async function (restat) {
    try {
        if (restat) {
            const newHandler = await import(`./handler.js?update=${Date.now()}`);
            handler = newHandler;
        }
    } catch (e) { console.error(e); }
};

// --- 8. LISTENER MESSAGGI (FIX DEFINITIVO PROPERTY ID) ---
global.conn.ev.on('messages.upsert', async (chatUpdate) => {
    try {
        const m = chatUpdate.messages[0];
        if (!m) return;
        if (m.key.fromMe && !global.opts['self']) return;
        if (global.db.data == null) await global.loadDatabase();

        // DEEP CLONE: Questo trasforma l'oggetto protetto in un oggetto JS puro e libero
        let msgClone = JSON.parse(JSON.stringify(m));

        // Passiamo il clone libero a serialize
        const msg = await serialize(global.conn, msgClone, global.store);
        
        // Passiamo il messaggio serializzato all'handler
        await handler.handler.call(global.conn, msg, chatUpdate);
    } catch (err) { 
        console.error(chalk.red('Errore nell\'elaborazione:'), err); 
    }
});

// --- 9. PAIRING & STATO ---
if (!fs.existsSync(`./${global.authFile}/creds.json`) && opzione === '2') {
    let phoneNumber = await question(chalk.bgHex('#00e5ff').black.bold(` Inserisci il numero (es: 39347...) `) + '\n' + chalk.hex('#ff00d4')('━━► '));
    let addNumber = phoneNumber.replace(/\D/g, '');
    setTimeout(async () => {
        let codeBot = await global.conn.requestPairingCode(addNumber, 'BLOODBOT');
        codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
        console.log(chalk.bgHex('#9d00ff').white.bold('『 🔗 』– CODICE:'), chalk.hex('#00e5ff').bold(codeBot));
    }, 3000);
}

global.conn.ev.on('connection.update', (update) => {
    const { connection, qr } = update;
    if (qr) console.log(chalk.hex('#00ff88').bold(`\n🪐 QR DISPONIBILE 🪐`));
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
        console.log(chalk.hex('#00e5ff').bold(`⭑⭒━━━✦❘༻☾⋆⁺₊✧ 𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙 ATTIVO ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
    }
    if (connection === 'close') process.exit();
});

global.conn.ev.on('creds.update', saveCreds);
watch('./handler.js', () => global.reloadHandler(true));