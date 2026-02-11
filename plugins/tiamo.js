module.exports = {
    name: "anti-tiamo",
    async execute(sock, msg) {
        if (!msg.message) return;

        const jid = msg.key.remoteJid;
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

        const normalized = text
            .toLowerCase()
            .replace(/[^a-z]/g, "");

        if (normalized.includes("tiamo")) {
            await sock.sendMessage(jid, {
                text: "💘 Puoi amare tutti tranne Blood… lui appartiene a Velith 😈✨"
            });
        }
    }
};