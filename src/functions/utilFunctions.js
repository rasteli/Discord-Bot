const { bot } = require("../bot.js")
const fs = require("fs")
const path = "./src/JSON/roles.json"

const roles = []

fs.readFile(path, "utf-8", (error, data) => {
	const json = JSON.parse(data)

	for (role in json.roles) {
		roles.push(json.roles[role])
	}
})

function returnMemberRoles(server_id, userID) {
	return bot.servers[server_id].members[userID].roles
}

function returnServerId(channelID) {
	return bot.channels[channelID].guild_id
}

function returnOwnerId(channelID) {
	const serverid = returnServerId(channelID)

	return bot.servers[serverid].owner_id
}

function checkHighRole(server_id, userID) {
	const memberRoles = returnMemberRoles(server_id, userID)

	const highRoles = []

	for (const role in roles) {
		if (roles[role].highrole == "true") highRoles.push(roles[role].id)
	}

	for (const mRole in memberRoles) {
		for (const hRole in highRoles) {
			if (memberRoles[mRole] == highRoles[hRole]) return true
		}
	}
}

function checkVerification(server_id, userID) {
	const memberRoles = returnMemberRoles(server_id, userID)

	const verifiedRole = roles[3].id

	for (const role in memberRoles) {
		if (memberRoles[role] == verifiedRole) {
			return true
		}
	}
}

function returnBotCount() {
	let bots = 0

	for (const member in bot.users) {
		const user = bot.users[member]

		if (user.bot) bots++
	}

	return bots
}

function joinAndLeaveVoiceChannel(channelID, ID, command) {
	const server_id = returnServerId(channelID)
	const channels = bot.servers[server_id].channels

	const voiceChannels = []

	for (const channel_id in channels) {
		const channel = channels[channel_id]
		const type = channel.type

		if (type === 2) voiceChannels.push(channel)
	}

	for (const channel_obj in voiceChannels) {
		const channel = voiceChannels[channel_obj]
		const channel_id = channel.id
		const members = channel.members

		if (command === "join" && Object.keys(members).length === 0) {
			bot.sendMessage({
				to: channelID,
				message: `:warning: |<@${ID}> You must be in a voice channel.`
			})

			return
		}

		for (const member_id in members) {
			const user_id = members[member_id].user_id

			if (ID === user_id) {
				if (command === "join") {
					bot.joinVoiceChannel(channel_id)
					return
				}

				if (command === "leave") {
					bot.leaveVoiceChannel(channel_id)
					return
				}
			}
		}
	}
}

function returnHelpEmbed({
	prefix,
	command,
	description,
	message,
	example,
	author
}) {
	return {
		color: 22679,
		title: `:computer: ${"`"}${prefix}${command}${"`"}`,
		description: description,
		author: {
			name: `${author.username}#${author.discriminator}`,
			icon_url: `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}`
		},

		fields: [
			{
				name: "How to use:",
				value: `${prefix}${command} ${"`"}${message}${"`"}`
			},

			{
				name: "Example:",
				value: `${prefix}${command} ${"`"}${example}${"`"}`
			}
		],

		footer: {
			text: "Help",
			icon_url:
				"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Help-browser.svg/1024px-Help-browser.svg.png"
		}
	}
}

module.exports = {
	returnServerId,
	checkHighRole,
	checkVerification,
	returnBotCount,
	returnHelpEmbed,
	returnOwnerId,
	joinAndLeaveVoiceChannel
}
