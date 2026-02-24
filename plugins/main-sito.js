const handler = async (m, { conn }) => {
  const jid = m.chat

  await conn.sendMessage(
    jid,
    {
      text: `〖 🌸 〗 \`Benvenuto in BloodBot!\``,
      title: '',
      footer: `BLD-BOT`,
      cards: [
        {
          image: { url: 'https://i.ibb.co/hJW7WwxV/varebot.jpg' },
          title: `\`by sam aka vare\``,
          body: `〖 💫 〗 *Esplora tutte le funzionalità*\n〖 🚀 〗 *Bot sempre aggiornato*`,
          footer: '˗ˏˋ ☾ *BloodBot* ☽ ˎˊ˗',
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: 'Sito - VareBot',
                url: 'https://varebot.com'
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '💻 GitHub',
                url: 'https://github.com/BLOOD212'
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '💬 WhatsApp',
                url: 'https://wa.me/393701330693'
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '📸 Instagram',
                url: 'https://instagram.com/bloodvelith'
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '📧 Email',
                url: 'mailto:non esistente scrivimi sul numero'
              })
            }
          ]
        }
      ]
    },
  { quoted: m }
  )
}

handler.command = ['sito']
handler.tags = ['main']
handler.help = ['sito']
export default handler
