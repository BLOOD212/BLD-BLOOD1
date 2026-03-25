let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*🫣 Inserisci il testo da trasformare!*\n\nEsempio: _${usedPrefix + command} Ciao a tutti_`;

    const styles = [
        { name: "Grassetto Serif", map: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖batch𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳" },
        { name: "Gotico Moderno", map: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟" },
        { name: "Corsivo Calligrafico", map: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃" },
        { name: "Doppia Linea", map: "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫" },
        { name: "Macchina da Scrivere", map: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍标记𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟标记𝚠𝚡𝚢𝚣" },
        { name: "Gotico Antico", map: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷" },
        { name: "Sans Grassetto", map: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜Ｊ𝗞𝗟Ｍ𝗡𝗢𝗣𝗤𝗥𝗦Ｔ𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝗑𝘆𝘇" },
        { name: "Sans Corsivo", map: "𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝓼𝙩𝙪𝙫𝙬𝙭𝙮𝙯" },
        { name: "Piccolo Maiuscolo", map: "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ" },
        { name: "Cerchiati Bianchi", map: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ" },
        { name: "Cerchiati Neri", map: "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩" },
        { name: "Quadratini", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "Quadri Neri", map: "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅚🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅚🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉" },
        { name: "Sottosopra", map: "∀BƆDƎℲפHIſK˥WNOԀΌᴚS┴∩ΛMX⅄Zɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz" },
        { name: "Specchio", map: "AdCdEɟGHIJKLMИOԀQЯƧTUVWXYZɐqdɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz" },
        { name: "Barrato", map: "A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Za̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z" },
        { name: "Sottolineato", map: "A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Za̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z" },
        { name: "Stile Ninja", map: "丹乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺ＳＴＵ∨山メㄚ乙丹乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺ＳＴＵ∨山メㄚ乙" },
        { name: "Stile Greco", map: "αвс∂єƒgнιјκℓмиορφяѕτυνωϰуζαвс∂єƒgнιјκℓмиορφяѕτυνωϰуζ" },
        { name: "Hacker L33t", map: "48CD3F6H1JK1MN0PQЯ57UVWXY248cd3f6h1jk1mn0pqя57uvwxy2" },
        { name: "Curvy", map: "ค๒ς๔єŦﻮђเןкɭ๓ภ๏קợгรՇยงฬאץչค๒ς๔єŦﻮђเןкɭ๓ภ๏קợгรՇยงฬאץչ" },
        { name: "Militare", map: "ÄßÇÐÈfGHÌJKLMñÖPQR§†ÚVWX¥ZäßçÐèfghìjklmñöpqr§†úvwx¥z" },
        { name: "Wavy", map: "αв¢∂єƒgнιʝкℓмησρqяѕтυνωкуչαв¢∂єƒgнιʝкℓмησρqяѕтυνωкуչ" },
        { name: "Spettrale", map: "₳฿₵ĐɆ₣₲Ⱨł J₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱖ₳฿₵ĐɆ₣₲Ⱨł J₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱖ" },
        { name: "Vaporwave", map: "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ" },
        { name: "Giapponese", map: "ﾑ乃ᄃり乇ｷgんﾉﾌズﾚ Create乃刀のｱゐ尺丂ｲひ√Wﾒﾘ乙ﾑ乃ᄃり乇ｷgんﾉﾌズﾚ Create乃刀のｱゐ尺丂ｲひ√Wﾒﾘ乙" },
        { name: "Piccolo Superiore", map: "ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᑫᴿˢᵀᵁᵛᵂˣʸᶻᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᑫʳˢᵗᵘᵛʷˣʸᶻ" },
        { name: "Neon", map: "ᗩᗷᑕᗪEᖴGᕼIᒍKᒪMᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭YᘔᗩᗷᑕᗪEᖴGᕼIᒍKᒪMᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ" },
        { name: "Monospace", map: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄标记𝚅𝚆标记𝚇𝚈𝚉𝚊𝚋标记𝚌标记𝚍𝚎𝚏𝚐𝚑标记𝚒标记𝚓𝚔标记𝚕𝚖标记𝚗标记𝚘标记𝚙𝚚标记𝚛𝚜标记𝚝𝚞标记𝚟标记𝚠𝚡标记𝚢标记𝚣" },
        { name: "Blurry", map: "A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Za̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z" },
        { name: "Double Strike", map: "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫" },
        { name: "Serif Bold Italic", map: "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛" },
        { name: "Sans Bold Italic", map: "𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛发𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯" },
        { name: "Outline", map: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ" },
        { name: "Arrows", map: "➵➷➵➹➵➷➵➹➵➷➵➹➵➷➵➹➵➷➵➹➵➷➵➹➵➷➵➹➵➷➵➹➵➷➵➹➵➷➵➹➵➷➵➹➵➷➵➹➵➷➵➹" }, // Nota: Decorativo
        { name: "Stile Arabo", map: "ค๒ς๔єŦﻮђเןкℓмภσρףяรՇยשฬאץչค๒ς๔єŦﻮђเןкℓмภσρףяรՇยשฬאץչ" },
        { name: "Creepy", map: "Ⱥβ↻ÐɆ₣ǤĦƗɈꝀŁMꞂØⱣꝖɌꞨ₮ᵾⱩ₩ꝗ¥Ƶąβçđɇfǥħɨʝꝁℓmꞥøᵽꝗꝛꞩŧᵾvɯꝫ¥ƶ" },
        { name: "Bubble Text", map: "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ" },
        { name: "Rettangoli", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "Gothic Outline", map: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷" },
        { name: "Bold Script", map: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃" },
        { name: "Heavy Metal", map: "🤘ᏰᏝᎧᎧᎴ🤘🤘ᏰᏝᎧᎧᎴ🤘🤘ᏰᏝᎧᎧᎴ🤘🤘ᏰᏝᎧᎧᎴ🤘🤘ᏰᏝᎧᎧᎴ🤘🤘ᏰᏝᎧᎧᎴ🤘" }, // Decorativo
        { name: "Medieval", map: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟" },
        { name: "Stile Russia", map: "ДБСDЁҒGНІЈКLМИОРQЯЅТЦVШХЧZдвсdёfgніјкlмніорqяѕтцvшхчz" },
        { name: "Handwriting", map: "𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝓋𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏" },
        { name: "Old English", map: "𝔄𝔅𝔆𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷" },
        { name: "Inverted", map: "zʎxʍʌnʇsɹbdouɯlʞɾıɥƃɟǝpɔqɐZ⅄XMΛ∩⟘SᴚΌԀONW˥⋊ſIHפℲƎᗡƆB∀" },
        { name: "Boxed Black", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "Magic", map: "ค๒ς๔єŦﻮђเןкℓмภσρףяรՇยשฬאץչค๒ς๔єŦﻮђเןкℓмภσρףяรՇยשฬאץչ" },
        { name: "Shadow", map: "A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Za̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z" }
    ];

    const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    const convert = (t, map) => {
        let mapArr = Array.from(map); 
        return t.split('').map(char => {
            const index = normal.indexOf(char);
            return index > -1 ? mapArr[index] : char;
        }).join('');
    };

    let menu = `✨ *OFFICINA CARATTERI SUPREMA* ✨\n`;
    menu += `──────────────────\n`;
    menu += `📝 Testo: *${text}*\n`;
    menu += `💡 _Rispondi col numero per trasformare_\n\n`;
    
    styles.forEach((s, i) => {
        // Anteprima fissa "BLOOD" come richiesto
        menu += `*${i + 1}.* ${convert("BLOOD", s.map)} _(${s.name})_\n`;
    });

    menu += `\n──────────────────`;

    let { key } = await conn.reply(m.chat, menu, m);

    conn.ev.on('messages.upsert', async function handlerFont(upsert) {
        let m2 = upsert.messages[0];
        if (!m2.message) return;
        const msgText = m2.message.conversation || m2.message.extendedTextMessage?.text;
        const quoted = m2.message.extendedTextMessage?.contextInfo;

        if (quoted && quoted.stanzaId === key.id) {
            let choice = parseInt(msgText?.trim());
            if (!isNaN(choice) && styles[choice - 1]) {
                let result = convert(text, styles[choice - 1].map);
                await conn.reply(m.chat, result, m2);
                conn.ev.off('messages.upsert', handlerFont); // Chiude il listener
            }
        }
    });
};

handler.help = ['font <testo>'];
handler.tags = ['utility'];
handler.command = /^(font)$/i;
handler.group = true;

export default handler;
