const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        auth: state,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        if (msg.key.fromMe) return;

        const messageText =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

        const normalized = messageText
            .toLowerCase()
            .replace(/[^a-z]/g, ""); // rimuove spazi, punti, simboli ecc.

        if (normalized === "tiamo") {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "💘 Puoi amare tutti tranne Blood… lui appartiene a Velith 💞✨"
            });
        }
    });
}

startBot();