let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `🫣 Inserisci il testo!\nEsempio: *${usedPrefix + command} Gaia*`;

    const styles = [
        { name: "Grassetto Serif", map: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔batch𝐕𝐖batch𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢batch𝐣𝐤𝐥𝐦batch𝐧 batch𝐨𝐩𝐪𝐫𝐬𝐭𝐮batch𝐯 batch𝐰 batch𝐱 batch𝐲 batch𝐳" },
        { name: "Gotico", map: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒batch𝖓 batch𝖔 batch𝖕 batch𝖖 batch𝖗 batch𝖘 batch𝖙 batch𝖚 batch𝖛 batch𝖜 batch𝖝 batch𝖞 batch𝖟" },
        { name: "Corsivo Elegante", map: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶 batch𝓷 batch𝓸 batch𝒑 batch𝒒 batch𝓻 batch𝓼 batch𝓽 batch𝓾 batch𝓿 batch𝔀 batch𝔁 batch𝔂 batch𝔃" },
        { name: "Doppia Linea", map: "𝔸mathbb{B}ℂmathbb{D}mathbb{E}mathbb{F}mathbb{G}mathbb{H}mathbb{I}mathbb{J}mathbb{K}mathbb{L}mathbb{M}mathbb{N}mathbb{O}mathbb{P}mathbb{Q}mathbb{R}mathbb{S}mathbb{T}mathbb{U}mathbb{V}mathbb{W}mathbb{X}mathbb{Y}mathbb{Z}𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝐩𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫" },
        { name: "Monospace", map: "𝙰𝙱𝙲𝙳𝙴|𝙵|𝙶|𝙷|𝙸|𝙹|𝙺|𝙻|𝙼|𝙽|𝙾|𝙿|𝚀|𝚁|𝚂|𝚃|𝚄|𝚅|𝚆|𝚇|𝚈|𝚉|𝚊|𝚋|𝚌|𝚍|𝚎|𝚏|𝚐|𝚑|𝚒|𝚓|𝚔|𝚕|𝚖|𝚗|𝚘|𝚙|𝚚|𝚛|𝚜|𝚝|𝚞|𝚟|𝚠|𝚡|𝚢|𝚣" },
        { name: "Sans Bold", map: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤 batch𝗥 batch𝗦 batch𝗧 batch𝗨 batch𝗩 batch𝗪 batch𝗫 batch𝗬 batch𝗭 batch𝗮𝗯𝗰𝗱𝗲 batch𝗳 batch𝗴 batch𝗵 batch𝗶 batch𝐣 batch𝗸 batch𝗹 batch𝗺 batch𝗻 batch𝗼 batch𝗽 batch𝗾 batch𝗿 batch𝘀 batch𝘁 batch𝘂 batch𝘃 batch𝘄 batch𝘅 batch𝘆 batch𝘇" },
        { name: "Piccolo Maiuscolo", map: "ᴀʙᴄᴅᴇғɢʜɪᴊ batchᴋ batchʟ batchᴍ batch batchɴ batchᴏ batchᴘ batchǫ batchʀ batchs batchᴛ batch batchᴜ batch batchᴠ batchᴡ batchx batchʏ batchᴢ" },
        { name: "Cerchiati", map: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ" },
        { name: "Quadratini", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "Quadri Neri", map: "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅚🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅚🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉" },
        { name: "Sottosopra", map: "∀BƆDƎℲפHIſK˥WNOԀΌᴚS┴∩ΛMX⅄Zɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz" },
        { name: "Greco", map: "αвс∂єƒgнιјκℓмиορφяѕτυνωϰуζαвс∂єƒgнιјκℓмиορφяѕτυνωϰуζ" },
        { name: "Ninja", map: "丹乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺ＳＴＵ∨山メㄚ乙丹乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺ＳＴＵ∨山メㄚ乙" },
        { name: "Antico", map: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷" },
        { name: "Hacker", map: "48CD3F6H1JK1MN0PQЯ57UVWXY248cd3f6h1jk1mn0pqя57uvwxy2" },
        { name: "Vaporwave", map: "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ" },
        { name: "Sottolineato", map: "A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Z̲a̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z̲" },
        { name: "Barrato", map: "A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̲U̶V̶W̶X̶Y̶Z̶a̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶" },
        { name: "Puntini", map: "A̤B̤C̤D̤E̤F̤G̤H̤I̤J̤K̤L̤M̤N̤O̤P̤Q̤R̤S̤T̲ṲV̤W̤X̤Y̤Z̤a̤b̤c̤d̤e̤f̤g̤h̤i̤j̤k̤l̤m̤n̤o̤p̤q̤r̤s̤t̤ṳv̤w̤x̤y̤z̤" },
        { name: "Militare", map: "ΛBCDΞFGHIJKLMNθPQRSTUVWXYZΛBCDΞFGHIJKLMNθPQRSTUVWXYZ" }
    ];

    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    const transform = (str, map) => {
        let res = "";
        let mapArr = [...map];
        for (let char of str) {
            let index = alpha.indexOf(char);
            if (index !== -1) {
                res += mapArr[index] || char;
            } else {
                res += char;
            }
        }
        return res;
    };

    let menu = `✨ *OFFICINA FONT (STABILI)* ✨\n\n`;
    menu += `Testo: *${text}*\n\n`;
    
    styles.forEach((s, i) => {
        menu += `${i + 1}. ${transform("BLOOD", s.map)} (${s.name})\n`;
    });

    menu += `\n> *Rispondi con il numero!*`;

    let { key } = await conn.reply(m.chat, menu, m);

    conn.beforeReply = async (m2) => {
        if (!m2.quoted || m2.quoted.id !== key.id) return;
        let choice = parseInt(m2.text.trim());
        if (!isNaN(choice) && styles[choice - 1]) {
            let finalResult = transform(text, styles[choice - 1].map);
            await conn.reply(m.chat, finalResult, m2);
            delete conn.beforeReply;
        }
    };
};

handler.help = ['font <testo>'];
handler.tags = ['utility'];
handler.command = /^(font)$/i;
handler.group = true;

export default handler;
