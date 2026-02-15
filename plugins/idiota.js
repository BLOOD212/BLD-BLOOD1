let handler = async (m, { conn }) => {

  const testo = `idiota non è solo un insulto, non solo la parola chiave nei flame di ankush, è il nuovo nome di gaia.
blood la ha incoronata come idiota e idiota resterà 👑`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['idiota'];
handler.tags = ['fun'];
handler.command = ['idiota'];

export default handler;
