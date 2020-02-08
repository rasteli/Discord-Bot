const { bot } = require("./bot.js")
const { botFuncs } = require("./functions/botFunctions.js")
const fs = require("fs")

let sufix = ""

fs.readFile("./src/JSON/ignite.json", "utf-8", (error, data) => {
	if (error) return
	const json = JSON.parse(data)
	sufix = json.ignite
})

bot.on("ready", () => {
	if (bot.connected) console.log(`Logged in as: ${bot.username}`)
})

//TODO find a way to add the serverID and channelID dynamically
bot.on("guildMemberAdd", member => {
	bot.addToRole({
		serverID: "670254632475557901", //** ServerID
		userID: member.id,
		roleID: "670256462731280394"
	})

	bot.sendMessage({
		to: "670257456672145418", //** ChannelID
		embed: {
			color: 7419530,
			title: "Welcome,",
			description: `<@${member.id}>`,
			fields: [
				{
					name: "---",
					value: `Type ${sufix}join to enjoy the whole server!`
				}
			]
		}
	})
})

bot.on("message", (user, userID, channelID, message, evt) => {
	const ignite = message[0]

	if (ignite == sufix) {
		const command = message.substring(1).split(" ")
		const prompt = command[0]

		const msgArray = command.splice(1)
		const msgString = msgArray.join(" ")

		const botFunc = botFuncs[prompt]

		if (botFunc) {
			botFunc({ channelID, msgString, userID, user })
		} else {
			bot.sendMessage({
				to: channelID,
				embed: {
					color: 7419530,
					description: `<@${userID}>`,
					fields: [
						{
							name: "---",
							value: `Unknown command. Type "${sufix}list" to see available commands.`
						}
					]
				}
			})
		}
	}
})

bot.on("disconnect", () => {
	bot.connect()
})
