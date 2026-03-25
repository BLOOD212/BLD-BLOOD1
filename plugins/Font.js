let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*🫣 Inserisci il testo da trasformare!*\n\nEsempio: _${usedPrefix + command} Ciao_`;

    const styles = [
        { name: "Grassetto Serif", map: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳" },
        { name: "Gotico Moderno", map: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆\u1D5EA\u1D5EB\u1D5EC\u1D5ED\u1D5EE\u1D5EF\u1D5F0\u1D5F1\u1D5F2\u1D5F3\u1D5F4\u1D5F5\u1D5F6\u1D5F7\u1D5F8\u1D5F9\u1D5FA\u1D5FB\u1D5FC\u1D5FD\u1D5FE\u1D5FF\u1D600\u1D601\u1D602\u1D603" },
        { name: "Corsivo Elegante", map: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥\u1D4E6\u1D4E7\u1D4E8\u1D4E9\u1D4EA\u1D4EB\u1D4EC\u1D4ED\u1D4EE\u1D4EF\u1D4F0\u1D4F1\u1D4F2\u1D4F3\u1D4F4\u1D4F5\u1D4F6\u1D4F7\u1D4F8\u1D4F9\u1D4FA\u1D4FB\u1D4FC\u1D4FD\u1D4FE\u1D4FF\u1D500\u1D501\u1D502\u1D503" },
        { name: "Doppia Linea", map: "𝔸𝔹ℂmathbb{D}mathbb{E}mathbb{F}mathbb{G}mathbb{H}mathbb{I}mathbb{J}mathbb{K}mathbb{L}mathbb{M}mathbb{N}mathbb{O}mathbb{P}mathbb{Q}mathbb{R}mathbb{S}mathbb{T}mathbb{U}mathbb{V}mathbb{W}mathbb{X}mathbb{Y}mathbb{Z}𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫" },
        { name: "Macchina da Scrivere", map: "𝙰𝙱\u1D672\u1D673\u1D674\u1D675\u1D676\u1D677\u1D678\u1D679\u1D67A\u1D67B\u1D67C\u1D67D\u1D67E\u1D67F\u1D680\u1D681\u1D682\u1D683\u1D684\u1D685\u1D686\u1D687\u1D688\u1D689\u1D68A\u1D68B\u1D68C\u1D68D\u1D68E\u1D68F\u1D690\u1D691\u1D692\u1D693\u1D694\u1D695\u1D696\u1D697\u1D698\u1D699\u1D69A\u1D69B\u1D69C\u1D69D\u1D69E\u1D69F\u1D6A0\u1D6A1\u1D6A2\u1D6A3" },
        { name: "Gotico Antico", map: "𝔄𝔅\u212D\u1D507\u1D508\u1D509\u1D50A\u210C\u2111\u1D50D\u1D50E\u1D50F\u1D510\u1D511\u1D512\u1D513\u1D514\u211C\u1D516\u1D517\u1D518\u1D519\u1D51A\u1D51B\u1D51C\u1D51D\u1D51E\u1D51F\u1D520\u1D521\u1D522\u1D523\u1D524\u1D525\u1D526\u1D527\u1D528\u1D529\u1D52A\u1D52B\u1D52C\u1D52D\u1D52E\u1D52F\u1D530\u1D531\u1D532\u1D533\u1D534\u1D535\u1D536\u1D537" },
        { name: "Sans Grassetto", map: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦Ｔ𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝒆𝗳𝗴𝗵𝗶𝗷𝗸ｌ𝗺ｎｏｐ𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇" },
        { name: "Sans Corsivo", map: "𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯" },
        { name: "Piccolo Maiuscolo", map: "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ" },
        { name: "Cerchiati", map: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ" },
        { name: "Cerchiati Neri", map: "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩" },
        { name: "Quadratini", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "Quadri Neri", map: "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅚🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅚🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉" },
        { name: "Sottosopra", map: "∀BƆDƎ\u2132פHIſK\u2142WNO\u0500Ό\u1D1AS\u2534∩ΛMX\u2144Zɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz" },
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
        { name: "Piccolo Superiore", map: "ᴬᴮ\u1D9C\u1D30\u1D31\u1D32\u1D33\u1D34\u1D35\u1D36\u1D37\u1D38\u1D39\u1D3A\u1D3C\u1D3E\u1D3F\u1D40\u1D41\u1D42\u1D43\u1D44\u1D45\u1D46\u1D47\u1D48\u1D49\u1D4A\u1D4B\u1D4C\u1D4D\u1D4E\u1D4F\u1D50\u1D51\u1D52\u1D53\u1D54\u1D55\u1D56\u1D57\u1D58\u1D59\u1D5A\u1D5B\u1D5C\u1D5D\u1D5E\u1D5F\u1D60\u1D61" },
        { name: "Neon", map: "ᗩᗷᑕᗪEᖴGᕼIᒍKᒪMᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭YᘔᗩᗷᑕᗪEᖴGᕼIᒍKᒪMᑎOᑭᑫᖇᔕTᑌᐯᗯ᙭Yᘔ" },
        { name: "Monospace", map: "𝙰𝙱\u1D672\u1D673\u1D674\u1D675\u1D676\u1D677\u1D678\u1D679\u1D67A\u1D67B\u1D67C\u1D67D\u1D67E\u1D67F\u1D680\u1D681\u1D682\u1D683\u1D684\u1D685\u1D686\u1D687\u1D688\u1D689\u1D68A\u1D68B\u1D68C\u1D68D\u1D68E\u1D68F\u1D690\u1D691\u1D692\u1D693\u1D694\u1D695\u1D696\u1D697\u1D698\u1D699\u1D69A\u1D69B\u1D69C\u1D69D\u1D69E\u1D69F\u1D6A0\u1D6A1\u1D6A2\u1D6A3" },
        { name: "Blurry", map: "A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Za̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z" },
        { name: "Double Strike", map: "𝔸𝔹ℂmathbb{D}mathbb{E}mathbb{F}mathbb{G}mathbb{H}mathbb{I}mathbb{J}mathbb{K}mathbb{L}mathbb{M}mathbb{N}mathbb{O}mathbb{P}mathbb{Q}mathbb{R}mathbb{S}mathbb{T}mathbb{U}mathbb{V}mathbb{W}mathbb{X}mathbb{Y}mathbb{Z}𝕒\u1D553\u1D554\u1D555\u1D556\u1D557\u1D558\u1D559\u1D55A\u1D55B\u1D55C\u1D55D\u1D55E\u1D55F\u1D560\u1D561\u1D562\u1D563\u1D564\u1D565\u1D566\u1D567\u1D568\u1D569\u1D56A\u1D56B" },
        { name: "Serif Bold Italic", map: "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛" },
        { name: "Sans Bold Italic", map: "𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠\u1D60E\u1D60F\u1D610\u1D611\u1D612\u1D613\u1D614\u1D615\u1D616\u1D617\u1D618\u1D619\u1D61A\u1D61B\u1D61C\u1D61D\u1D61E\u1D61F" },
        { name: "Outline Dots", map: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ" },
        { name: "Creepy", map: "Ⱥβ↻ÐɆ₣ǤĦƗɈꝀŁMꞂØⱣꝖɌꞨ₮ᵾⱩ₩ꝗ¥Ƶąβçđɇfǥħɨʝꝁℓmꞥøᵽꝗꝛꞩŧᵾvɯꝫ¥ƶ" },
        { name: "Bubble", map: "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ" },
        { name: "Stile Russia", map: "ДБСDЁҒGНІЈКLМИОРQЯЅТЦVШХЧZдвсdёfgніјкlмніорqяѕтцvшхчz" },
        { name: "Handwriting", map: "𝒜ℬ𝒞𝒟ℰ\u2131\u1D4A2\u210B\u2110\u1D4A5\u1D4A6\u2112\u2133\u1D4A9\u2134\u1D4AB\u1D4AC\u211B\u1D4AE\u1D4AF\u1D4B0\u1D4B1\u1D4B2\u1D4B3\u1D4B4\u1D4B5\u1D4B6\u1D4B7\u1D4B8\u1D4B9\u212F\u1D4BB\u1D4BC\u1D4BD\u1D4BE\u1D4BF\u1D4C0\u1D4C1\u1D4C2\u1D4C3\u1D4C4\u1D4C5\u1D4C6\u1D4C7\u1D4C8\u1D4C9\u1D4CA\u1D4CB\u1D4CC\u1D4CD\u1D4CE\u1D4CF" },
        { name: "Inverted", map: "zʎxʍʌnʇsɹbdouɯlʞɾıɥƃɟǝpɔqɐZ⅄XMΛ∩⟘SᴚΌԀONW˥⋊ſIHפℲƎᗡƆB∀" },
        { name: "Stile Arabo", map: "ค๒ς๔єŦﻮђเןкℓмภσρףяรՇยשฬאץչค๒ς๔єŦﻮђเןкℓмภσρףяรՇยשฬאץչ" },
        { name: "Script Bold", map: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴\u1D4C1\u1D4C2\u1D4C3\u1D4C4\u1D4C5\u1D4C6\u1D4C7\u1D4C8\u1D4C9\u1D4CA\u1D4CB\u1D4CC\u1D4CD\u1D4CE\u1D4CF\u1D4D0\u1D4D1\u1D4D2\u1D4D3\u1D4D4\u1D4D5\u1D4D6\u1D4D7\u1D4D8\u1D4D9\u1D4DA\u1D4DB\u1D4DC\u1D4DD\u1D4DE\u1D4DF\u1D4E0\u1D4E1\u1D4E2\u1D4E3\u1D4E4\u1D4E5\u1D4E6\u1D4E7\u1D4E8\u1D4E9" },
        { name: "Box Black", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "Slash", map: "A̷B̷C̷D̷E̷F̷G̷H̷I̷J̷K̷L̷M̷N̷O̷P̷Q̷R̷S̷T̷U̷V̷W̷X̷Y̷Za̷b̷c̷d̷e̷f̷g̷h̷i̷j̷k̷l̷m̷n̷o̷p̷q̷r̷s̷t̷u̷v̷w̷x̷y̷z" },
        { name: "Flower", map: "A❃B❃C❃D❃E❃F❃G❃H❃I❃J❃K❃L❃M❃N❃O❃P❃Q❃R❃S❃T❃U❃V❃W❃X❃Y❃Za❃b❃c❃d❃e❃f❃g❃h❃i❃j❃k❃l❃m❃n❃o❃p❃q❃r❃s❃t❃u❃v❃w❃x❃y❃z" },
        { name: "Arrow decor", map: "➵A➵B➵C➵D➵E➵F➵G➵H➵I➵J➵K➵L➵M➵N➵O➵P➵Q➵R➵S➵T➵U➵V➵W➵X➵Y➵Z" },
        { name: "Small Script", map: "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᑫʳˢᵗᵘᵛʷˣʸᶻᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᑫʳˢᵗᵘᵛʷˣʸᶻ" },
        { name: "Medieval Bold", map: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿\u1D5EA\u1D5EB\u1D5EC\u1D5ED\u1D5EE\u1D5EF\u1D5F0\u1D5F1\u1D5F2\u1D5F3\u1D5F4\u1D5F5\u1D5F6\u1D5F7\u1D5F8\u1D5F9\u1D5FA\u1D5FB\u1D5FC\u1D5FD\u1D5FE\u1D5FF\u1D600\u1D601\u1D602\u1D603" },
        { name: "Thin Sans", map: "𝙰𝙱𝙲𝙳𝙴\u1D675\u1D676\u1D677\u1D678\u1D679\u1D67A\u1D67B\u1D67C\u1D67D\u1D67E\u1D67F\u1D680\u1D681\u1D682\u1D683\u1D684\u1D685\u1D686\u1D687\u1D688\u1D689\u1D68A\u1D68B\u1D68C\u1D68D\u1D68E\u1D68F\u1D690\u1D691\u1D692\u1D693\u1D694\u1D695\u1D696\u1D697\u1D698\u1D699\u1D69A\u1D69B\u1D69C\u1D69D\u1D69E\u1D69F\u1D6A0\u1D6A1\u1D6A2\u1D6A3" },
        { name: "Aesthetic", map: "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ" },
        { name: "Bolds", map: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳" }
    ];

    const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    const convert = (t, map) => {
        const mapArr = Array.from(map);
        return t.split('').map(char => {
            const index = normal.indexOf(char);
            return (index > -1 && mapArr[index]) ? mapArr[index] : char;
        }).join('');
    };

    let menu = `✨ *OFFICINA CARATTERI (50 STILI)* ✨\n\n`;
    menu += `Testo: *${text}*\n\n`;
    
    styles.forEach((s, i) => {
        menu += `${i + 1}. ${convert("BLOOD", s.map)} (${s.name})\n`;
    });

    menu += `\n> *Rispondi col numero per trasformare "${text}"*`;

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
                conn.ev.off('messages.upsert', handlerFont);
            }
        }
    });
};

handler.help = ['font <testo>'];
handler.tags = ['utility'];
handler.command = /^(font)$/i;
handler.group = true;

export default handler;
