const { bot } = require("./bot.js")
const { botFuncs } = require("./functions/botFunctions.js")
const fs = require("fs")

let prefix = ""

fs.readFile("src/JSON/ignite.json", "utf-8", (error, data) => {
    if (error) return
    const json = JSON.parse(data)
    prefix = json.ignite
})

bot.on("ready", () => {
    if (bot.connected) {
        bot.sendMessage({
            to: "670266538372104222",
            embed: {
                color: 22679,
                title: "Ready!",
                description: `<@${bot.id}> connected to the server.`,
                footer: {
                    text: "Connection",
                    icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
                },
            },
        })
        // const date = new Date(
        //     bot.servers["670254632475557901"].members[
        //         "559152144587161620"
        //     ].joined_at
        // )

        // console.log(date.toDateString().split(" "))
        // console.log(bot.servers["670254632475557901"].members)
    }
})

//TODO find a way to add the serverID dynamically if there is any
bot.on("guildMemberAdd", (member) => {
    bot.addToRole({
        serverID: "670254632475557901", //** ServerID */
        userID: member.id,
        roleID: "670256462731280394",
    })

    bot.sendMessage({
        to: "670257456672145418",
        embed: {
            color: 22679,
            title: "Welcome,",
            description: `<@${member.id}>`,
            fields: [
                {
                    name: "---",
                    value: `Type ${prefix}join to enjoy the whole server!`,
                },
            ],
        },
    })

    bot.sendMessage({
        to: "670266538372104222",
        embed: {
            color: 22679,
            title: "Someone has joined the server!",
            description: `<@${member.id}> joined the server.`,
            footer: {
                text: "Connection",
                icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
            },
        },
    })
})

bot.on("guildMemberRemove", (member) => {
    bot.sendMessage({
        to: "670266538372104222",
        embed: {
            color: 22679,
            title: "Someone has left the server!",
            description: `<@${member.id}> left the server.`,
            footer: {
                text: "Connection",
                icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
            },
        },
    })
})

bot.on("message", (user, userID, channelID, message, event) => {
    const ignite = message[0]
    const botMention = `<@!${bot.id}>`

    if (message === botMention) {
        bot.sendMessage({
            to: channelID,
            message: "I'm here!",
        })
    }

    if (ignite == prefix) {
        //** Complete message */
        const msgArray = message.substring(1).split(" ")

        //** Word(s) positioned after the command */
        const param = msgArray.splice(1).join(" ")

        const command = msgArray[0]

        const botFunc = botFuncs[command]

        if (botFunc) {
            botFunc({ channelID, param, userID, user, prefix, event })
        } else if (command.length != 0) {
            bot.sendMessage({
                to: channelID,
                message: `| <@${userID}> Command ${"`"}${command}${"`"} doesn't exist. Type ${"`"}${prefix}commands${"`"} to see all available commands.`,
            })
        }
    }
})

bot.on("disconnect", () => {
    bot.connect()
})
