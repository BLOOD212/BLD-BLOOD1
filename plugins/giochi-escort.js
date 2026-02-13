import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ESCORTS_FILE = join(process.cwd(), 'media', 'database', 'escorts.json')
let escorts = []

try {
    escorts = JSON.parse(readFileSync(ESCORTS_FILE, 'utf-8'))
} catch (e) {
    writeFileSync(ESCORTS_FILE, '[]')
    escorts = []
}

let handler = async (m, { conn, text, command }) => {
    try {
        switch (command) {

            case 'escort':
                if (!escorts.length)
                    return m.reply('❌ *Nessuna escort disponibile*')

                let list = escorts.map((escort, i) =>
                    `${i + 1}. @${escort.split('@')[0]}`
                ).join('\n')

                return conn.reply(m.chat,
`📋 *LISTA ESCORT*

${list}`, m, { mentions: escorts })

            case 'addescort':
                if (!m.isGroup)
                    return m.reply('⚠️ Solo nei gruppi')

                let metadata = await conn.groupMetadata(m.chat)
                let isAdmin = metadata.participants.find(p => p.id === m.sender)?.admin

                if (!isAdmin)
                    return m.reply('⚠️ Solo gli admin possono aggiungere escort')

                let user = m.quoted
                    ? m.quoted.sender
                    : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

                if (!user)
                    return m.reply('❌ Tagga qualcuno o rispondi a un messaggio')

                if (escorts.includes(user))
                    return m.reply('⚠️ Questa escort è già in lista')

                escorts.push(user)
                writeFileSync(ESCORTS_FILE, JSON.stringify(escorts, null, 2))

                return conn.reply(
                    m.chat,
                    `✅ @${user.split('@')[0]} aggiunta alla lista escort!`,
                    m,
                    { mentions: [user] }
                )

            case 'delescort':
                if (!m.isGroup)
                    return m.reply('⚠️ Solo nei gruppi')

                let metadataDel = await conn.groupMetadata(m.chat)
                let isAdminDel = metadataDel.participants.find(p => p.id === m.sender)?.admin

                if (!isAdminDel)
                    return m.reply('⚠️ Solo gli admin possono rimuovere escort')

                let userToDel = m.quoted
                    ? m.quoted.sender
                    : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

                if (!escorts.includes(userToDel))
                    return m.reply('⚠️ Questa persona non è nella lista escort')

                escorts = escorts.filter(e => e !== userToDel)
                writeFileSync(ESCORTS_FILE, JSON.stringify(escorts, null, 2))

                return conn.reply(
                    m.chat,
                    `✅ @${userToDel.split('@')[0]} rimossa dalla lista escort!`,
                    m,
                    { mentions: [userToDel] }
                )
        }
    } catch (e) {
        console.error('Errore escort:', e)
        m.reply('❌ Errore durante l\'operazione')
    }
}

handler.help = ['escort', 'addescort', 'delescort']
handler.tags = ['divertimento']
handler.command = /^(escort|addescort|delescort)$/i
handler.admin = true

export default handler