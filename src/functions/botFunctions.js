const { bot } = require("../bot.js")
const axios = require("axios")
const fs = require("fs")
const util = require("./utilFunctions.js")

const botFuncs = {
	ping: ({ channelID }) => {
		bot.sendMessage({
			to: channelID,
			message: util.markdownText("Pong!")
		})
	},

	list: ({ channelID }) => {
		fs.readFile("./src/JSON/help.json", "utf-8", (err, data) => {
			if (err) return

			const json = JSON.parse(data)
			let command = ""

			for (const key in json.help) {
				const help = json.help[key]
				command += `${help}\n`
			}

			bot.sendMessage({
				to: channelID,
				message: util.markdownText(command)
			})
		})
	},

	//? Sometimes takes a while to send messages. Perhaps fix it?
	msgme: ({ msgString, userID }) => {
		bot.sendMessage({
			to: userID,
			message: msgString
		})
	},

	kick: ({ channelID, msgString, user }) => {
		const serverid = util.returnServerId(channelID)

		bot.sendMessage({
			to: msgString,
			message: `${user} kicked you from ${bot.servers[serverid].name}`
		})

		//TODO fix: after kicking user, he's still true in server members' list while bot does not reconnect (manually restart server)
		bot.kick({
			serverID: serverid,
			userID: msgString
		})
	},

	getUsers: ({ channelID }) => {
		let res = ""

		for (const member in bot.users) {
			const user = bot.users[member]

			if (!user.bot) {
				const username = user.username

				res += `${username}\n`
			}
		}

		bot.sendMessage({
			to: channelID,
			message: util.markdownText(`\n${res}\n`)
		})
	},

	sufix: ({ msgString, channelID, userID }) => {
		const serverid = util.returnServerId(channelID)

		if (util.checkHighRole(serverid, userID)) {
			if (msgString.length == 1) {
				const sufix = {
					ignite: msgString
				}

				fs.writeFile(
					"./src/JSON/ignite.json",
					JSON.stringify(sufix),
					error => {
						if (error) return
					}
				)

				bot.sendMessage({
					to: channelID,
					message: util.markdownText(`Sufix changed to ${msgString}`)
				})
			} else {
				bot.sendMessage({
					to: channelID,
					message: util.markdownText("Sufix length must equal to 1.")
				})
			}
		} else {
			bot.sendMessage({
				to: channelID,
				message: util.markdownText(
					"You do not have permission to change the sufix."
				)
			})
		}
	},

	serverInfo: ({ channelID }) => {
		const serverid = util.returnServerId(channelID)
		const server = bot.servers[serverid]
		const joiningTime = server.joined_at.substring(0, 10)

		const info = {
			name: `Server name: ${server.name}`,
			id: `Server ID: ${server.id}`,
			member: `${server.member_count - 1} members`,
			join: `Joined at ${joiningTime}`
		}

		let res = ""

		for (const i in info) {
			res += `${info[i]}\n`
		}

		bot.sendMessage({
			to: channelID,
			message: util.markdownText(res)
		})
	},

	join: ({ channelID, userID }) => {
		const serverid = util.returnServerId(channelID)

		if (!util.checkVerification(serverid, userID)) {
			bot.addToRole({
				serverID: serverid,
				userID,
				roleID: "670255661686325251"
			})

			bot.removeFromRole({
				serverID: serverid,
				userID,
				roleID: "670256462731280394"
			})
		} else {
			bot.sendMessage({
				to: channelID,
				message: util.markdownText("You're already verified!")
			})
		}
	},

	github: async ({ channelID, msgString }) => {
		try {
			const apiResponse = await axios.get(
				`https://api.github.com/users/${msgString}`
			)

			const { name = login, id, bio, html_url } = apiResponse.data

			const user = {
				name: `Name: ${name}`,
				id: `ID: ${id}`,
				bio: `BIO: ${bio}`
			}

			let response = ""

			for (const info in user) {
				response += `${user[info]}\n`
			}

			bot.sendMessage({
				to: channelID,
				message: util.markdownText(response) + html_url
			})
		} catch (error) {
			bot.sendMessage({
				to: channelID,
				message: util.markdownText("User not found.")
			})
		}
	}
}

module.exports = {
	botFuncs
}
