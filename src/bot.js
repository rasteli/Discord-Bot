const Discord = require("discord.io")
const auth = require("./JSON/auth.json")

const bot = new Discord.Client({
	token: auth.token,
	autorun: true
})

module.exports = {
	bot
}
