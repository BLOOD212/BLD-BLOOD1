process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';

import './config.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  mkdirSync,
  rmSync,
  watch
} from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import { tmpdir } from 'os';
import { format } from 'util';
import pino from 'pino';
import NodeCache from 'node-cache';

import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import { ripristinaTimer } from './plugins/gp-configgruppo.js';

const { chain } = lodash;

/* ===================== ASYNC WRAPPER ===================== */
async function startBot() {

/* ===================== GLOBAL UTILS ===================== */

global.__filename = function (pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix
    ? /file:\/\/\//.test(pathURL)
      ? fileURLToPath(pathURL)
      : pathURL
    : pathToFileURL(pathURL).toString();
};

global.__dirname = function (pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};

global.__require = function (dir = import.meta.url) {
  return createRequire(dir);
};

const __dirname = global.__dirname(import.meta.url);

/* ===================== INIT ===================== */

protoType();
serialize();

global.timestamp = { start: new Date() };
global.conns = [];
global.isLogoPrinted = false;
global.qrGenerated = false;
global.connectionMessagesPrinted = {};

const PORT = process.env.PORT || 3000;

/* ===================== DATABASE ===================== */

global.db = new Low(new JSONFile('database.json'));

async function loadDatabase() {
  if (global.db.data) return;
  await global.db.read().catch(() => null);
  global.db.data ||= {
    users: {},
    chats: {},
    stats: {},
    settings: {}
  };
}
await loadDatabase();

/* ===================== AUTH ===================== */

const {
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  Browsers,
  jidNormalizedUser,
  makeInMemoryStore
} = await import('@realvare/based');

const authFile = 'bloodsession';
const { state, saveCreds } = await useMultiFileAuthState(authFile);

/* ===================== RETRY MAP FIX ===================== */

const msgRetryCounterMap = {};
const msgRetryCounterCache = new NodeCache();

/* ===================== LOGGER ===================== */

const logger = pino({ level: 'silent' });

/* ===================== STORE ===================== */

global.store = makeInMemoryStore({ logger });

/* ===================== SOCKET OPTIONS ===================== */

const connectionOptions = {
  logger,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger)
  },
  browser: Browsers.macOS('Safari'),
  msgRetryCounterMap,
  msgRetryCounterCache,
  printQRInTerminal: true,
};

/* ===================== CONNECT ===================== */

global.conn = makeWASocket(connectionOptions);
store.bind(conn.ev);

conn.ev.on('creds.update', saveCreds);

/* ===================== LOGO ===================== */

const bloodbotLogo = [
  `██████╗ ██╗      ██████╗  ██████╗ ██████╗ ██████╗`,
  `██╔══██╗██║     ██╔═══██╗██╔═══██╗██╔══██╗██╔══██╗`,
  `██████╔╝██║     ██║   ██║██║   ██║██║  ██║██████╔╝`,
  `██╔══██╗██║     ██║   ██║██║   ██║██║  ██║██╔══██╗`,
  `██████╔╝███████╗╚██████╔╝╚██████╔╝██████╔╝██████╔╝`,
  `╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝`
];

/* ===================== CONNECTION UPDATE ===================== */

conn.ev.on('connection.update', (update) => {
  const { connection, qr } = update;

  if (qr && !global.qrGenerated) {
    console.log(chalk.yellow('\n📲 SCANSIONA IL QR'));
    global.qrGenerated = true;
  }

  if (connection === 'open') {
    if (!global.isLogoPrinted) {
      bloodbotLogo.forEach(l => console.log(chalk.magenta(l)));
      global.isLogoPrinted = true;
    }
    console.log(chalk.green('\n✅ BLOODBOT CONNESSO'));
    ripristinaTimer(conn);
  }

  if (connection === 'close') {
    console.log(chalk.red('❌ CONNESSIONE CHIUSA, RIAVVIO...'));
    process.exit(1);
  }
});

/* ===================== PLUGINS ===================== */

const pluginFolder = join(__dirname, 'plugins');
global.plugins = {};

for (const file of readdirSync(pluginFolder).filter(f => f.endsWith('.js'))) {
  try {
    const module = await import(join(pluginFolder, file));
    global.plugins[file] = module.default || module;
  } catch (e) {
    console.error(`Errore plugin ${file}`, e);
  }
}

/* ===================== CLEANUP ===================== */

setInterval(() => {
  const tmp = join(__dirname, 'tmp');
  if (!existsSync(tmp)) return;
  readdirSync(tmp).forEach(f => rmSync(join(tmp, f), { recursive: true, force: true }));
}, 1000 * 60 * 60);

} // 🔚 FINE startBot

/* ===================== AVVIO ===================== */
startBot().catch(err => {
  console.error('❌ ERRORE FATALE:', err);
});
