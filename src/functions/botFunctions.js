const { bot } = require("../bot.js")
const axios = require("axios")
const util = require("./utilFunctions.js")
const fs = require("fs")

const botFuncs = {
	ping: ({ channelID }) => {
		bot.sendMessage({
			to: channelID,
			embed: {
				color: 7419530,
				title: "Pong!"
			}
		})
	},

	list: ({ channelID, userID }) => {
		fs.readFile("./src/JSON/help.json", "utf-8", (err, data) => {
			if (err) return

			const json = JSON.parse(data)

			const title = json.title

			const commands = json.help

			bot.sendMessage({
				to: channelID,
				embed: {
					color: 7419530,
					title,
					description: `<@${userID}>`,
					fields: commands
				}
			})
		})
	},

	msgme: ({ msgString, userID }) => {
		bot.sendMessage({
			to: userID,
			embed: {
				color: 7419530,
				title: "Hi!",
				description: msgString
			}
		})
	},

	kick: ({ channelID, msgString, user }) => {
		const serverid = util.returnServerId(channelID)

		bot.sendMessage({
			to: msgString,
			embed: {
				color: 7419530,
				description: `${user} kicked you from ${bot.servers[serverid].name}`
			}
		})

		//TODO fix: after kicking user, he's still true in server members' list while bot does not reconnect (manually restart server)
		bot.kick({
			serverID: serverid,
			userID: msgString
		})
	},

	getUsers: ({ channelID, userID }) => {
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
			embed: {
				color: 7419530,
				description: `<@${userID}>`,
				fields: [
					{
						name: "Users",
						value: res
					}
				]
			}
		})
	},

	prefix: ({ msgString, channelID, userID }) => {
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
					embed: {
						color: 7419530,
						description: `<@${userID}>`,
						fields: [
							{
								name: "---",
								value: `Prefix changed to ${msgString}`
							}
						]
					}
				})
			} else {
				bot.sendMessage({
					to: channelID,
					embed: {
						color: 7419530,
						description: `<@${userID}>`,
						fields: [
							{
								name: "---",
								value: "Prefix length must equal to 1."
							}
						]
					}
				})
			}
		} else {
			bot.sendMessage({
				to: channelID,
				embed: {
					color: 7419530,
					description: `<@${userID}>`,
					fields: [
						{
							name: "---",
							value:
								"You do not have permission to change the prefix."
						}
					]
				}
			})
		}
	},

	serverInfo: ({ channelID, userID }) => {
		const serverid = util.returnServerId(channelID)
		const server = bot.servers[serverid]
		const joiningTime = server.joined_at.substring(0, 10)

		const info =
			`Server name: ${server.name}\n` +
			`Server ID: ${server.id}\n` +
			`${server.member_count - 1} members\n` +
			`Laveo joined at ${joiningTime}`

		bot.sendMessage({
			to: channelID,
			embed: {
				color: 7419530,
				description: `<@${userID}>`,
				fields: [
					{
						name: "Server Info",
						value: info
					}
				]
			}
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
				embed: {
					color: 7419530,
					description: `<@${userID}>`,
					fields: [
						{
							name: "---",
							value: "You're already verified."
						}
					]
				}
			})
		}
	},

	github: async ({ channelID, msgString }) => {
		try {
			const apiResponse = await axios.get(
				`https://api.github.com/users/${msgString}`
			)

			const { name = login, bio, html_url, avatar_url } = apiResponse.data

			const user = {
				name,
				bio
			}

			bot.sendMessage({
				to: channelID,
				embed: {
					color: 7419530,
					title: "Github profile",
					url: html_url,
					fields: [
						{
							name: "Name",
							value: user.name
						},
						{
							name: "BIO",
							value: user.bio
						}
					],
					thumbnail: {
						url: avatar_url
					}
				}
			})
		} catch (error) {
			bot.sendMessage({
				to: channelID,
				embed: {
					color: 7419530,
					description: "User not found."
				}
			})
		}
	}
}

module.exports = {
	botFuncs
}
