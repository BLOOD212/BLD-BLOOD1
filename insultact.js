let handler = async (m, { conn, usedPrefix, command }) => {

    // Determina target: menzione o risposta
    let target = m.quoted ? m.quoted.sender : m.mentionedJid?.[0];
    if (!target) return m.reply(
        `⭔ \`Tagga qualcuno o rispondi a un messaggio\`\n\n*Esempio:* ${usedPrefix + command} @utente`
    );

    // Lista di insulti catanesi
    const insulti = [
        '*speci ri cosu moncu spakkiu sta scrivennu ca hai 40anni e ancora tarrti i baddi*',
        '*cunnutu tu to oma to opa da sucaminchi ri to soru e tutta a to razza*',
        '*ancora sta parannu? ma quannu cia tagghi ri ncucchiari minchiati e tuoccuchi npocu*',
        '*mammoriri si accussi lariu ca quannu nascisti u dutturi ti resi na pirata pi fariti tunnari intra*',
        '*hai chiu conna tu ca na pignata ri vaccareddi*',
        '*pigghiari po culu a tia e comu pigghialla ndo culu,pi picca cridtiani*',
        '*mbare ma non taffrunti? pisi 600kila hai 40anni e ancora fai u lesu areri du speci ri telefunu ra fera*',
        '*figghiu ri setti sucaminchi si chiu lariu ra motti buttama*',
        '*insultarti in dialetto sarebbe uno spreco di tempo e un insulto verso il catanese ietta sangu*',
        '*maffruntu a pigghiariti po culu*'
    ];

    // Scegli insulto random
    const insulto = insulti[Math.floor(Math.random() * insulti.length)];

    // Testo finale
    const testo = `
💥 *INSULTACT!*

👤 @${m.sender.split('@')[0]} ha insultato
👤 @${target.split('@')[0]}

🗯️ Insulto catanese: *${insulto}*
    `.trim();

    await conn.sendMessage(m.chat, {
        text: testo,
        mentions: [m.sender, target]
    }, { quoted: m });

};

handler.help = ['insultact @utente'];
handler.tags = ['fun'];
handler.command = ['insultact'];
handler.register = true;

export default handler;
