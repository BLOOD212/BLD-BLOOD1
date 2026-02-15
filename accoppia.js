let handler = async (m, { conn, usedPrefix, command }) => {

    // Determina target
    let target = m.quoted ? m.quoted.sender : m.mentionedJid?.[0];
    if (!target) return m.reply(
        `⭔ \`Tagga qualcuno o rispondi a un messaggio\`\n\n*Esempio:* ${usedPrefix + command} @utente`
    );

    // Prendi nomi reali
    let nome1 = await conn.getName(m.sender);
    let nome2 = await conn.getName(target);

    // 🔹 Funzione per dividere in “blocchi” di 2 o 3 lettere
