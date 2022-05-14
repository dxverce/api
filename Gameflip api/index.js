const Discord = require("discord.js");
const fetch = require("node-fetch");
const config = require("./config");
const { Client, Collection, Intents } = require("discord.js");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const { checkPremium } = require("./functions/checkPremium");
const { checkOwner } = require("./functions/checkOwner");
const emojis = require("./util/emojis.json");
const { logger } = require("./functions/logger");
const { autoPostAll } = require("./functions/autoPost");
const dotenv = require("dotenv")
dotenv.config()


const intents = new Intents(32509);
const client = new Client({ intents: intents, partials: ["CHANNEL"] });
const guildID = "guildID"
const guild = bot.guild.cache.get(guildID)

client.commands = new Collection();
client.aliases = new Collection();
client.cooldowns = new Discord.Collection();
client.snipes = new Map();

(async () => {
    ["command"].forEach((handler) => {
        require(`./${handler}`)(client);
    });

    client.on("message", async (message) => {
        // console.log(message);
        switch (message.channel.type) {
            case "dm":
                if (message.author.bot) return;
                await logger("dm", message.author.username, message, client);
                break;
        }

        if (message.author.bot) return;
        if (!message.content.startsWith(config.discord.prefix)) return;

        const args = message.content
            .slice(config.discord.prefix.length)
            .trim()
            .split(" ");
        const Cmd = args.shift().toLowerCase();
        if (Cmd.length === 0) return;
        let command = client.commands.get(Cmd);
        if (!command) command = client.commands.get(client.aliases.get(Cmd));
        if (command) {
            await logger("command", message.author.username, message.content);
            let errorEmbed = new MessageEmbed().setColor("RED").setTimestamp();
            if (command.guildOnly && message.channel.type === "dm") {
                errorEmbed.setDescription(
                    "This command can not be Executed in DM's !"
                );
                return await message.reply(errorEmbed);
            }
            if (command.dmOnly && !(message.channel.type === "dm")) {
                errorEmbed.setDescription(
                    "This Command Can Not Be Executed in Servers !"
                );
                return await message.reply(errorEmbed);
            }
            if (command.permissions) {
                const authorPerms = message.channel.permissionsFor(
                    message.author
                );
                if (!authorPerms || !authorPerms.has(command.permissions)) {
                    errorEmbed.setDescription(
                        "You dont have enough Permissions to Execute this Command!"
                    );
                    return await message.reply(errorEmbed);
                }
            }
            if (command.premium) {
                const isPremium = await checkPremium(message.author.id);
                if (!isPremium) {
                    errorEmbed.setDescription(
                        "This Command Requires Premium Access, Premium is just 5$ you can Purchase it by DM'ing Bot Owner (EZ)"
                    );
                    return await message.reply(errorEmbed);
                }
            }
            if (command.ownerOnly) {
                const isOwner = await checkOwner(message.author.id);
                if (!isOwner) {
                    errorEmbed.setDescription("This is an Owner Only Command");
                    return await message.reply(errorEmbed);
                }
            }

            command.run(client, message, args);
        }
    });

    client.login(config.discord.token);

    client.on("ready", async () => {
        await logger("event", "EZ GAMEFLIP", "Ez Gameflip Bot Is Now Ready ");
        await logger("event", "EZ GAMEFLIP", "Auto Poster Started");
        autoPostAll(client);

        client.user.setActivity("Gameflip AutoListing", { type: "PLAYING" });
    });
})();
