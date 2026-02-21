import fs from 'fs'

const DB_FILE = './pizzaDB.json'

global.pizzaDB = fs.existsSync(DB_FILE)
  ? JSON.parse(fs.readFileSync(DB_FILE))
  : {
      users: {},
      clans: {},
      cities: {
        Napoli: { owner: null, difesa: 100 },
        Milano: { owner: null, difesa: 100 },
        Roma: { owner: null, difesa: 100 },
        Tokyo: { owner: null, difesa: 120 },
        "New York": { owner: null, difesa: 150 }
      },
      market: [],
      events: { active: null, ends: 0 },
      royale: null,
      season: { number: 1 }
    }

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(global.pizzaDB, null, 2))
}

const ingredienti = [
  { nome: "Mozzarella 🧀", rarita: 1 },
  { nome: "Salsa 🍅", rarita: 1 },
  { nome: "Salame 🍖", rarita: 2 },
  { nome: "Funghi 🍄", rarita: 2 },
  { nome: "Bufala 🐃", rarita: 3 },
  { nome: "Gorgonzola 🧀", rarita: 3 },
  { nome: "Ananas 🍍", rarita: 4 },
  { nome: "Tartufo Nero 👑", rarita: 5 },
  { nome: "Oro Alimentare ✨", rarita: 6 },
  { nome: "Carbone 💀", rarita: -2 }
]

function createUser() {
  return {
    xp: 0,
    soldi: 300,
    gemme: 0,
    clan: null,
    classe: null,
    inventario: [0,1],
    rating: 1000
  }
}

function scorePizza(lista) {
  let score = 0
  lista.forEach(i => score += ingredienti[i].rarita * 25)
  score += lista.length * 10

  // AI combo
  const nomi = lista.map(i => ingredienti[i].nome)

  if (nomi.includes("Mozzarella 🧀") && nomi.includes("Salsa 🍅") && lista.length === 2)
    score += 100

  if (nomi.includes("Ananas 🍍") && nomi.includes("Carbone 💀"))
    score -= 80

  return score
}

function livello(xp) {
  if (xp >= 5000) return "🌍 Imperatore"
  if (xp >= 2500) return "👑 Dominatore"
  if (xp >= 1000) return "🔥 Maestro"
  if (xp >= 500) return "👨‍🍳 Chef"
  return "🍕 Pizzaiolo"
}

let handler = async (m, { conn, args }) => {

  const text = m.text.trim()
  const user = m.sender

  global.pizzaDB.users[user] = global.pizzaDB.users[user] || createUser()
  const u = global.pizzaDB.users[user]

  // ===== PROFILO =====
  if (/^pizzastats$/i.test(text)) {
    return m.reply(
`👤 PROFILO

XP: ${u.xp}
💰 Soldi: ${u.soldi}
💎 Gemme: ${u.gemme}
🏆 Rating: ${u.rating}
🏅 Livello: ${livello(u.xp)}
🏰 Clan: ${u.clan || "Nessuno"}
🎭 Classe: ${u.classe || "Nessuna"}`
    )
  }

  // ===== CLASSE =====
  if (/^pizzaclasse/i.test(text)) {
    const c = args[0]
    if (!c) return m.reply("Usa: .pizzaclasse classica|gourmet|chaos")

    u.classe = c
    saveDB()
    return m.reply("🎭 Classe impostata: " + c)
  }

  // ===== CLAN =====
  if (/^pizzaclan crea/i.test(text)) {
    const nome = args[1]
    if (!nome) return m.reply("Nome clan mancante")

    global.pizzaDB.clans[nome] = { leader: user, membri: [user], xp: 0 }
    u.clan = nome
    saveDB()
    return m.reply("🏰 Clan creato: " + nome)
  }

  if (/^pizzaclan join/i.test(text)) {
    const nome = args[1]
    if (!global.pizzaDB.clans[nome]) return m.reply("Clan inesistente")

    global.pizzaDB.clans[nome].membri.push(user)
    u.clan = nome
    saveDB()
    return m.reply("🤝 Entrato nel clan " + nome)
  }

  // ===== ATTACCO CITTÀ =====
  if (/^pizzaclan attacca/i.test(text)) {
    const city = args[1]
    if (!global.pizzaDB.cities[city]) return m.reply("Città inesistente")
    if (!u.clan) return m.reply("Devi avere un clan")

    const potere = global.pizzaDB.clans[u.clan].membri.length * 100
    const difesa = global.pizzaDB.cities[city].difesa

    if (potere > difesa) {
      global.pizzaDB.cities[city].owner = u.clan
      global.pizzaDB.cities[city].difesa += 50
      saveDB()
      return m.reply(`🏆 ${u.clan} ha conquistato ${city}!`)
    } else {
      return m.reply("❌ Attacco fallito!")
    }
  }

  // ===== MERCATO =====
  if (/^pizzamarket sell/i.test(text)) {
    const index = parseInt(args[1])
    const prezzo = parseInt(args[2])

    if (!u.inventario.includes(index))
      return m.reply("Non possiedi questo ingrediente")

    global.pizzaDB.market.push({
      id: Date.now(),
      seller: user,
      index,
      prezzo
    })

    saveDB()
    return m.reply("🛒 In vendita!")
  }

  if (/^pizzamarket$/i.test(text)) {
    let msg = "🛒 MERCATO\n\n"
    global.pizzaDB.market.forEach(i => {
      msg += `ID:${i.id} - ${ingredienti[i.index].nome} - 💰${i.prezzo}\n`
    })
    return m.reply(msg)
  }

  if (/^pizzamarket buy/i.test(text)) {
    const id = parseInt(args[1])
    const item = global.pizzaDB.market.find(x => x.id === id)
    if (!item) return m.reply("ID non trovato")

    if (u.soldi < item.prezzo)
      return m.reply("Soldi insufficienti")

    u.soldi -= item.prezzo
    global.pizzaDB.users[item.seller].soldi += item.prezzo
    u.inventario.push(item.index)

    global.pizzaDB.market =
      global.pizzaDB.market.filter(x => x.id !== id)

    saveDB()
    return m.reply("✅ Acquisto completato")
  }

  // ===== LOOTBOX =====
  if (/^pizzaloot$/i.test(text)) {
    if (u.soldi < 200) return m.reply("Servono 200💰")

    u.soldi -= 200
    let roll = Math.random()
    let drop = roll < 0.7 ? 2 :
               roll < 0.9 ? 4 :
               roll < 0.98 ? 7 : 8

    if (!u.inventario.includes(drop))
      u.inventario.push(drop)

    saveDB()
    return m.reply("🎁 Hai trovato: " + ingredienti[drop].nome)
  }

  // ===== BATTLE ROYALE =====
  if (/^pizzaroyale$/i.test(text)) {
    if (!global.pizzaDB.royale)
      global.pizzaDB.royale = []

    global.pizzaDB.royale.push(user)

    if (global.pizzaDB.royale.length >= 3) {
      const winner =
        global.pizzaDB.royale[Math.floor(Math.random()*global.pizzaDB.royale.length)]

      global.pizzaDB.users[winner].gemme += 3
      global.pizzaDB.royale = null
      saveDB()
      return conn.sendMessage(m.chat,{
        text:`🏆 Battle Royale vinta da @${winner.split("@")[0]}! +3💎`,
        mentions:[winner]
      })
    }

    saveDB()
    return m.reply("⚔️ Entrato in Battle Royale")
  }

  // ===== CREA PIZZA =====
  if (/^pizza$/i.test(text)) {

    let lista = u.inventario.map(i=>`${i}. ${ingredienti[i].nome}`).join("\n")

    return m.reply(
`🍕 CREA PIZZA

${lista}

Scrivi numeri separati da virgola.
`)
  }

  // ===== VALUTA PIZZA =====
  if (/^\d+(,\d+)*$/.test(text)) {
    const picks = text.split(",").map(x=>parseInt(x.trim()))
    const valid = picks.every(p=>u.inventario.includes(p))

    if (!valid) return m.reply("Ingrediente non valido")

    let score = scorePizza(picks)
    let bot = scorePizza([Math.floor(Math.random()*ingredienti.length)])

    if (score > bot) {
      u.xp += 150
      u.soldi += 100
      u.rating += 25
    } else {
      u.xp += 30
      u.rating -= 10
    }

    saveDB()

    return m.reply(
`⭐ Tuo punteggio: ${score}
🤖 Bot: ${bot}

XP: ${u.xp}
💰 Soldi: ${u.soldi}
🏆 Rating: ${u.rating}
🏅 ${livello(u.xp)}`
    )
  }

}

handler.command = /^pizza|pizzastats|pizzaclasse|pizzaclan|pizzamarket|pizzaloot|pizzaroyale$/i
handler.group = true
handler.register = true

export default handler