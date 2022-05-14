const config = require('../../config.js');
const {
    MessageEmbed
} = require('discord.js');
const Discord = require('discord.js')
const prefix = config.discord.prefix;
const {
    errorEmbed,
    errorEmbed2
} = require('../../functions/error')
const {
    getProfile
} = require('../../functions/apiHandler')
const {
    generateTotp
} = require('../../functions/generateTotp')
const emojis = require('../../util/emojis.json')
const fs = require('fs')
const Canvas = require('canvas')
var sha1 = require('sha1')
const PagedEmbed = require('../../util/PageEmbed.js')

module.exports = {
    name: 'port',
    description: 'Shows your Saved Listings.',
    category: 'gameflip',
    cooldown: 2,
    aliases: ['listinglist'],

    run: async (client, message, args) => {
        let msg;
        try {
            let userFile = './users/'+message.author.id+'.json'
            if (!fs.existsSync(userFile)) return errorEmbed(message, 'You are not Logged In')

            let loading = new MessageEmbed()
            .setColor('RANDOM')
            .setDescription('Connecting to Gameflip '+emojis.loading)
            .setTimestamp()
            msg = await message.reply(loading)

            let userData = JSON.parse(fs.readFileSync(userFile))
            let key = userData.key
            let secret = userData.secret
            let listings = userData['listings']

            let profile = await getProfile(key, secret)
            if (!profile) return await errorEmbed2(msg, 'Sorry Your Saved Api Key/Secret is no more Valid , Please Relink your Account!')

            if (listings.length == 0) return await errorEmbed2(msg, 'No Saved Listing Found:(')

            let ok = Object.values(listings).map(l=> {
                return `/listing new name:${l.name} description:${l.description} price:${l.price} image:${l.image}`
            }).join("\n")

            let att = new Discord.MessageAttachment(Buffer.from(ok), "port.txt")

            await msg.delete()
            await message.reply(att)

        }catch(e) {
            console.log(e)
            return errorEmbed2(msg, 'Some Unknown Error Occurred')
        }
    }
}