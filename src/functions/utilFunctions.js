const { bot } = require("../bot.js")

function returnServerRoles(serverid, userID) {
	return bot.servers[serverid].members[userID].roles
}

function returnServerId(channelID) {
	return bot.channels[channelID].guild_id
}

function checkHighRole(serverid, userID) {
	const roles = returnServerRoles(serverid, userID)

	const highRoles = {
		owner: "670254979906404402",
		moderator: "670255185267916810"
	}

	for (const role in roles) {
		if (
			roles[role] == highRoles.owner ||
			roles[role] == highRoles.moderator
		) {
			return true
		}
	}
}

function checkVerification(serverid, userID) {
	const roles = returnServerRoles(serverid, userID)

	const verifiedRole = "670255661686325251"

	for (const role in roles) {
		if (roles[role] == verifiedRole) {
			return true
		}
	}
}

function markdownText(text) {
	return `>>> ${"```"}${text}${"```"}`
}

module.exports = {
	returnServerId,
	checkHighRole,
	checkVerification,
	markdownText
}
