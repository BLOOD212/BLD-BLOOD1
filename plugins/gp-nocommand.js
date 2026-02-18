const handler = m => m;

handler.all = async function (m) {
  if (!m.text) return;

  const prefixRegex = /^[!./#$%^&?]/; // metti qui i tuoi prefissi
  if (!prefixRegex.test(m.text)) return;

  const prefix = m.text[0];
  const command = m.text.slice(1).trim().split(' ')[0].toLowerCase();

  // lista comandi registrati
  const plugins = Object.values(global.plugins || {});
  const commands = [];

  for (let plugin of plugins) {
    if (!plugin.command) continue;

    if (Array.isArray(plugin.command)) {
      for (let cmd of plugin.command) {
        if (cmd instanceof RegExp) continue;
        commands.push(cmd.toLowerCase());
      }
    } else if (plugin.command instanceof RegExp) {
      continue;
    } else {
      commands.push(plugin.command.toLowerCase());
    }
  }

  if (commands.includes(command)) return;

  // ❌ comando non trovato
  await this.reply(
    m.chat,
    `❌ *BLD-BLOOD non trova questo comando:* *${prefix + command}*.\n\n*Usa _.menu_ per vedere i comandi disponibili*`,
    m
  );
};

export default handler;