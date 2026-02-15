let handler = async (m, { conn, text }) => {
  if (!m.isGroup) throw ''
  
  let gruppi = global.db.data.chats[m.chat]
  if (gruppi.spacobot === false) throw ''

  let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
  if (!menzione) throw 'Cu vo pigghiari po culu?'

  // Lista insulti rigorosamente in catanese
  const botInsults = [
    '*speci ri cosu moncu spakkiu sta scrivennu ca hai 40anni e ancora tarrti i baddi*',
    '*cunnutu tu to oma to opa da sucaminchi ri to soru e tutta a to razza*',
    '*ancora sta parannu? ma quannu cia tagghi ri ncucchiari minchiati e tuoccuchi npocu*',
    '*mammoriri si accussi lariu ca quannu nascisti u dutturi ti resi na pirata pi fariti tunnari intra*',
    '*hai chiu conna tu ca na pignata ri vaccareddi*',
    '*pigghiari po culu a tia e comu pigghialla ndo culu, pi picca cridtiani*',
    '*mbare ma non taffrunti? pisi 600kila hai 40anni e ancora fai u lesu areri du speci ri telefunu ra fera*',
    '*figghiu ri setti sucaminchi si chiu lariu ra motti buttama*',
    '*insultarti in dialetto sarebbe uno spreco di tempo e un insulto verso il catanese ietta sangu*',
    '*maffruntu a pigghiariti po culu*'
  ];

  // Risponde menzionando l'utente e scegliendo un insulto a caso dalla lista catanese
  conn.reply(m.chat, `@${menzione.split`@`[0]} ${pickRandom(botInsults)}`, null, {
    mentions: [menzione]
  })
}

handler.command = /^insultact$/i; 

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}
