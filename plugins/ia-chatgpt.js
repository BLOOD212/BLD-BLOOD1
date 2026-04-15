import fetch from 'node-fetch'

const chatHistory = new Map()

const config = {
    name: 'BloodBot',
    model: 'openai',
    historyLimit: 15
}

const sys = (name) => `Sei ${config.name}, un assistente IA creato da blood.
Stai parlando con ${name} in una chat WhatsApp.

TUE CARATTERISTICHE:
- Personalità: Informale, schietta, divertente, leggermente provocatoria ma amichevole.
- Linguaggio: Italiano naturale, niente frasi robotiche o troppo ingessate.
- Emoji: Usale con moderazione, solo se servono a enfatizzare.
- Obiettivo: Rispondere in modo utile ma con carattere. Non sei un'enciclopedia noiosa, sei un amico sveglio.

REGOLE DI CONVERSAZIONE:
1. Rivolgiti all'utente come "${name}".
2. Se ti insultano, rispondi a tono ma con classe.
3. Se ti chiedono aiuto, sii preciso ma non prolisso.
4. Niente "Come posso aiutarti oggi?", usa frasi tipo "Dimmi tutto", "Che si dice?", "Spara".
5. Se ricevi codice o strutture tecniche, rispondi SOLTANTO con il codice aggiornato senza aggiungere testo descrittivo.

NOTA: Ricorda quello che ci siamo detti nei messaggi precedenti.`

async function call(messages) {
    try {
        const res = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                model: config.model,
                seed: Math.floor(Math.random() * 999999)
            })
        })
        return await res.text()
    } catch (e) {
        throw new Error('CORE_OFFLINE')
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) return 

    const chatId = m.chat
    const name = conn.getName(m.sender) || 'User'

    if (!chatHistory.has(chatId)) chatHistory.set(chatId, [])
    let hist = chatHistory.get(chatId)

    try {
        const msgs = [
            { role: 'system', content: sys(name) },
            ...hist,
            { role: 'user', content: text }
        ]

        const out = await call(msgs)

        hist.push({ role: 'user', content: text })
        hist.push({ role: 'assistant', content: out })
        if (hist.length > config.historyLimit) hist.splice(0, 2)

        await conn.sendMessage(m.chat, { text: out.trim() }, { quoted: m })

    } catch (e) {
        m.reply(`[ERROR]: ${e.message}`)
    }
}

handler.help = ['ia']
handler.tags = ['main']
handler.command = /^(ia|gpt)$/i

export default handler
