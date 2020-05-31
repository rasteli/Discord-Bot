const { bot } = require("../bot.js")
const axios = require("axios")
const util = require("./utilFunctions.js")
const fs = require("fs")

const botFuncs = {
    flags: ({ channelID }) => {
        bot.sendMessage({
            to: channelID,
            embed: {
                color: 22679,
                title: "How flags work",
                fields: [
                    {
                        name: "Mandatory",
                        value: "`<parameter>`",
                    },

                    {
                        name: "Optional",
                        value: "`[parameter]`",
                    },
                ],
                footer: {
                    text: "Commands",
                    icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
                },
            },
        })
    },

    commands: ({ channelID, userID }) => {
        fs.readFile("./src/JSON/help.json", "utf-8", (err, data) => {
            if (err) return

            const json = JSON.parse(data)

            const title = json.title

            const commands = json.help

            bot.sendMessage({
                to: channelID,
                message: `<@${userID}>`,
                embed: {
                    color: 22679,
                    title: title,
                    fields: commands,
                    footer: {
                        text: "Commands",
                        icon_url:
                            "https://cdn.discordapp.com/embed/avatars/0.png",
                    },
                },
            })
        })
    },

    say: ({ userID, channelID, param, prefix, event: { d } }) => {
        if (param.length == 0) {
            bot.sendMessage({
                to: channelID,
                message: `<@${userID}>`,
                embed: util.returnHelpEmbed({
                    prefix,
                    command: "say",
                    description: "Makes Laveo say something.",
                    message: "<message>",
                    example: "The cake is a lie!",
                    author: {
                        username: d.author.username,
                        discriminator: d.author.discriminator,
                        avatar: d.author.avatar,
                        id: d.author.id,
                    },
                }),
            })
        } else {
            bot.sendMessage({
                to: channelID,
                message: param,
            })
        }
    },

    msgme: ({ param, userID, channelID, prefix, event: { d } }) => {
        if (param.length == 0) {
            bot.sendMessage({
                to: channelID,
                message: `<@${userID}>`,
                embed: util.returnHelpEmbed({
                    prefix,
                    command: "msgme",
                    description: "Returns a message to user's DM.",
                    message: "<message>",
                    example: "wassup?",
                    author: {
                        username: d.author.username,
                        discriminator: d.author.discriminator,
                        avatar: d.author.avatar,
                        id: d.author.id,
                    },
                }),
            })
        } else {
            bot.sendMessage({
                to: userID,
                message: param,
            })
        }
    },

    kick: ({ userID, channelID, param, user, prefix, event: { d } }) => {
        if (param.length == 0) {
            bot.sendMessage({
                to: channelID,
                message: `<@${userID}>`,
                embed: util.returnHelpEmbed({
                    prefix,
                    command: "kick",
                    description: "Kicks some shity boi!",
                    message: "<userID>",
                    example: "657329094496616459",
                    author: {
                        username: d.author.username,
                        discriminator: d.author.discriminator,
                        avatar: d.author.avatar,
                        id: d.author.id,
                    },
                }),
            })
        } else {
            const serverid = util.returnServerId(channelID)

            bot.sendMessage({
                to: param,
                message: `${user} kicked you from ${bot.servers[serverid].name}.`,
            })

            //TODO fix: after kicking user, he's still true in server members' list while bot does not reconnect (manually restart server)
            bot.kick({
                serverID: serverid,
                userID: param,
            })
        }
    },

    members: ({ channelID, userID }) => {
        const botEmoji = ":robot:"
        const personEmoji = ":bust_in_silhouette:"

        let res = ""

        for (const member in bot.users) {
            const user = bot.users[member]

            const username = user.username

            res += `${user.bot ? botEmoji : personEmoji} ${username}\n\n`
        }

        bot.sendMessage({
            to: channelID,
            message: `<@${userID}>`,
            embed: {
                color: 22679,
                fields: [
                    {
                        name: "Members:",
                        value: res,
                    },
                ],
            },
        })
    },

    prefix: ({ param, channelID, userID, prefix, event: { d } }) => {
        const server_id = util.returnServerId(channelID)
        const owner_id = util.returnOwnerId(channelID)

        if (util.checkHighRole(server_id, userID) || userID == owner_id) {
            if (param.length == 1) {
                const prefix = {
                    ignite: param,
                }

                fs.writeFile(
                    "./src/JSON/ignite.json",
                    JSON.stringify(prefix),
                    (error) => {
                        if (error) return
                    }
                )

                bot.sendMessage({
                    to: channelID,
                    message: `:white_check_mark: | <@${userID}> Prefix changed to ${"`"}${param}${"`"}`,
                })
            } else if (param.length == 0) {
                bot.sendMessage({
                    to: channelID,
                    message: `<@${userID}>`,
                    embed: util.returnHelpEmbed({
                        prefix,
                        command: "prefix",
                        description: "Changes the prefix used to summon Laveo.",
                        message: "<new prefix>",
                        example: "!",
                        author: {
                            username: d.author.username,
                            discriminator: d.author.discriminator,
                            avatar: d.author.avatar,
                            id: d.author.id,
                        },
                    }),
                })
            } else {
                bot.sendMessage({
                    to: channelID,
                    message: `:warning:| <@${userID}> Prefix length must equal 1.`,
                })
            }
        } else {
            bot.sendMessage({
                to: channelID,
                message: `:x: | <@${userID}> You do not have permission to change the prefix.`,
            })
        }
    },

    serverinfo: ({ channelID, userID }) => {
        const bots = util.returnBotCount()
        const server_id = util.returnServerId(channelID)

        fs.readFile("./src/JSON/roles.json", (error, data) => {
            if (error) throw error

            const roles = JSON.parse(data).roles

            const {
                name,
                id,
                owner_id,
                region,
                icon,
                member_count,
            } = bot.servers[server_id]

            const members = member_count - bots
            const rolesMention = []

            for (const role in roles) {
                roles[role].id = `<@&${roles[role].id}>`

                rolesMention.push(roles[role].id)
            }

            const creationDate = new Date("2020-01-24T13:12:37.111Z")
            const daysOnline = util.returnPassedDays("2020-01-24T13:12:37.111Z")

            bot.sendMessage({
                to: channelID,
                embed: {
                    color: 22679,
                    title: ":computer: " + name.toUpperCase(),
                    thumbnail: {
                        url: `https://cdn.discordapp.com/icons/${id}/${icon}`,
                    },
                    fields: [
                        {
                            name: "\u00bb :file_folder: ID:",
                            value: id,
                        },
                        {
                            name: "\u00bb :busts_in_silhouette: Members:",
                            value: members + " users\n" + bots + " bots",
                        },
                        {
                            name: "\u00bb :calendar: Created at:",
                            value: creationDate.toDateString(),
                            inline: true,
                        },
                        {
                            name: "\u00bb :man_guard: Owner:",
                            value: `<@${owner_id}>`,
                            inline: true,
                        },
                        {
                            name: `:flag_${region.substring(0, 2)}: Region:`,
                            value: region.toUpperCase(),
                            inline: true,
                        },
                        {
                            name: `:calendar: Days online:`,
                            value: `${daysOnline} days`,
                            inline: true,
                        },
                        {
                            name: ":scroll: Roles:",
                            value: rolesMention.join(" "),
                        },
                    ],
                },
            })
        })
    },

    join: ({ channelID, userID }) => {
        const server_id = util.returnServerId(channelID)

        if (!util.checkVerification(server_id, userID)) {
            bot.addToRole({
                serverID: server_id,
                userID,
                roleID: "670255661686325251",
            })

            bot.removeFromRole({
                serverID: server_id,
                userID,
                roleID: "670256462731280394",
            })
        } else {
            bot.sendMessage({
                to: channelID,
                message: `| <@${userID}> You're already verified.`,
            })
        }
    },

    github: async ({ channelID, param, userID, prefix, event: { d } }) => {
        try {
            const apiResponse = await axios.get(
                `https://api.github.com/users/${param}`
            )

            const { name = login, bio, html_url, avatar_url } = apiResponse.data

            bot.sendMessage({
                to: channelID,
                embed: {
                    color: 22679,
                    title: "Github profile",
                    url: html_url,
                    fields: [
                        {
                            name: "Name",
                            value: name,
                        },

                        {
                            name: "BIO",
                            value: bio,
                        },
                    ],

                    thumbnail: {
                        url: avatar_url,
                    },

                    footer: {
                        text: "github",
                        icon_url:
                            "https://img2.gratispng.com/20180704/uxe/kisspng-github-computer-icons-icon-design-desktop-wallpape-5b3d36142dd125.8636932415307381961877.jpg",
                    },
                },
            })
        } catch (error) {
            if (param.length === 0) {
                bot.sendMessage({
                    to: channelID,
                    message: `<@${userID}>`,
                    embed: util.returnHelpEmbed({
                        prefix,
                        command: "github",
                        description: "Returns some github info of a user.",
                        message: "<github username>",
                        example: "rasteli",
                        author: {
                            username: d.author.username,
                            discriminator: d.author.discriminator,
                            avatar: d.author.avatar,
                            id: d.author.id,
                        },
                    }),
                })
            } else {
                bot.sendMessage({
                    to: channelID,
                    message: `:x: | <@${userID}> User ${"`"}${param}${"`"} not found.`,
                })
            }
        }
    },

    addrole: ({ param, userID, channelID, prefix, event: { d } }) => {
        const server_id = util.returnServerId(channelID)
        const owner_id = util.returnOwnerId(channelID)

        if (util.checkHighRole(server_id, userID) || userID == owner_id) {
            if (param.length != 0) {
                const path = "./src/JSON/roles.json"

                fs.readFile(path, "utf-8", (error, data) => {
                    // if (error) return

                    const serverRoles = bot.servers[server_id].roles
                    const roleInfo = param.split(" ")

                    if (!roleInfo[2]) roleInfo[2] = "false"

                    const name = roleInfo[0]
                    const id = roleInfo[1]
                    const highrole = roleInfo[2]

                    let role404 = 0

                    for (const role_id in serverRoles) {
                        if (id !== role_id) role404++
                    }

                    if (role404 === Object.keys(serverRoles).length) {
                        bot.sendMessage({
                            to: channelID,
                            message: `:x: | <@${userID}> Role ${"`"}${name}${"`"} doesn't exist on this server.`,
                        })

                        return
                    }

                    const json = JSON.parse(data)

                    for (const rol in json.roles) {
                        const role = json.roles[rol]

                        if (id === role.id) {
                            bot.sendMessage({
                                to: channelID,
                                message: `:x: | <@${userID}> Role previously added with name <@&${role.id}>`,
                            })

                            return
                        }
                    }

                    json.roles.push({
                        name,
                        id,
                        highrole,
                    })

                    const role = {
                        roles: json.roles,
                    }

                    fs.writeFile(path, JSON.stringify(role), (error) => {
                        bot.sendMessage({
                            to: channelID,
                            message: `:white_check_mark: | <@${userID}> Role <@&${id}> added successfully to bot's list.`,
                        })
                    })
                })
            } else {
                bot.sendMessage({
                    to: channelID,
                    message: `<@${userID}>`,
                    embed: util.returnHelpEmbed({
                        prefix,
                        command: "addrole",
                        description:
                            "Add a server's role to bot's list.\n*It is recommended that, if you created an adm, or owner, or a high-permission role, [high role] be set as true.*",
                        message: "<role name> <role id> [high role]",
                        example: "role1 1234567890 true",
                        author: {
                            username: d.author.username,
                            discriminator: d.author.discriminator,
                            avatar: d.author.avatar,
                            id: d.author.id,
                        },
                    }),
                })
            }
        } else {
            bot.sendMessage({
                to: channelID,
                message: `:x: | <@${userID}> You do not have permission to add a role to bot's list.`,
            })
        }
    },

    connect: ({ userID, channelID }) => {
        util.joinAndLeaveVoiceChannel(channelID, userID, "join")
    },

    disconnect: ({ channelID }) => {
        util.joinAndLeaveVoiceChannel(channelID, bot.id, "leave")
    },

    js: ({ channelID, userID, param, prefix, event: { d } }) => {
        if (param.length === 0) {
            bot.sendMessage({
                to: channelID,
                message: `<@${userID}>`,
                embed: util.returnHelpEmbed({
                    prefix,
                    command: "js",
                    description: "Executes a JavaScript code.",
                    message: "<code>",
                    example: "'Leak'.split('').reverse().join('')",
                    author: {
                        username: d.author.username,
                        discriminator: d.author.discriminator,
                        avatar: d.author.avatar,
                        id: d.author.id,
                    },
                }),
            })
        } else {
            const stringCode = eval(param)

            bot.sendMessage({
                to: channelID,
                message: `:outbox_tray:  Output: ${"```"}${stringCode}${"```"}\n:interrobang:  Type: ${"```"}${typeof stringCode}${"```"}`,
            })
        }
    },

    avatar: ({ param, channelID, event: { d } }) => {
        if (param.length === 0) {
            const avatarMessage = util.returnAvatarMessage({
                user: d.author,
                author: d.author,
                channelID,
            })

            bot.sendMessage(avatarMessage)
        } else {
            if (param.includes("@")) {
                param = param.replace(/[&\/\\#,+()$~%.'":*?<>{}@!]/g, "")
            }

            const { id, avatar, username, discriminator } = bot.users[param]

            const avatarMessage = util.returnAvatarMessage({
                user: { id, avatar, username, discriminator },
                author: d.author,
                channelID,
            })

            bot.sendMessage(avatarMessage)
        }
    },

    userinfo: ({ param, channelID, event: { d } }) => {
        if (param.includes("@")) {
            param = param.replace(/[&\/\\#,+()$~%.'":*?<>{}@!]/g, "")
        }

        const server_id = util.returnServerId(channelID)

        const ID = param.length === 0 ? d.author.id : param

        const { id, joined_at, status = "offline", roles } = bot.servers[
            server_id
        ].members[ID]

        const { username, discriminator, avatar } = bot.users[ID]

        const avatar_url = util.returnAvatarURL(ID, avatar)

        for (const role in roles) {
            roles[role] = `<@&${roles[role]}>`
        }

        const joiningDate = new Date(joined_at)
        const daysInServer = util.returnPassedDays(joined_at)

        bot.sendMessage({
            to: channelID,
            embed: {
                color: 22679,
                title: `\u00bb Information about user: ${username}`,
                thumbnail: {
                    url: avatar_url,
                },
                fields: [
                    {
                        name: "\u00bb :file_folder: ID:",
                        value: id,
                    },
                    {
                        name: "\u00bb :bust_in_silhouette: User:",
                        value: `${username}#${discriminator}`,
                        inline: true,
                    },
                    {
                        name: "\u00bb :pencil2: Nickname:",
                        value: `<@${id}>`,
                        inline: true,
                    },
                    {
                        name: "\u00bb :vertical_traffic_light: Status:",
                        value: status,
                        inline: true,
                    },
                    {
                        name: "\u00bb :calendar: Joined at:",
                        value: joiningDate.toDateString(),
                        inline: true,
                    },
                    {
                        name: "\u00bb :calendar: Days in server:",
                        value: `${daysInServer} days`,
                        inline: true,
                    },
                    {
                        name: `\u00bb :scroll: Roles [${roles.length}]:`,
                        value: roles.join(" "),
                        inline: true,
                    },
                ],
            },
        })
    },
}

module.exports = {
    botFuncs,
}
