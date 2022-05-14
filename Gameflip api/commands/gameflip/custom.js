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
    getProfile,
    postListing
} = require('../../functions/apiHandler')
const {
    generateTotp
} = require('../../functions/generateTotp')
const emojis = require('../../util/emojis.json')
const fs = require('fs')
const Canvas = require('canvas')
var sha1 = require('sha1');

const imgUrl = "https://cdn.discordapp.com/attachments/918634268610142282/919711737786277888/1639346732277.png"

module.exports = {
    name: 'custom',
    description: 'Post a Custom Listing.',
    category: 'gameflip',
    cooldown: 10,
    premium: true,
    aliases: ['postcustom'],

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

            let listingPrice = args[0]
            if (!listingPrice || isNaN(listingPrice)) return await errorEmbed2(msg, 'Valid Usage : $custom price title')
            args.shift()
            let title;
            if (args && args.length != 0) title = args.join(" ")
            if (!title) title = "Custom Bundle"

            let userData = JSON.parse(fs.readFileSync(userFile))
            let key = userData.key
            let secret = userData.secret
            let listings = userData['listings']

            let profile = await getProfile(key, secret)
            if (!profile) return await errorEmbed2(msg, 'Sorry Your Saved Api Key/Secret is no more Valid , Please Relink your Account!')

            let embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTimestamp()
            .setAuthor(message.author.username, message.author.avatarURL({
                dynamic: true
            }))
            .setFooter(message.author.id)
            .setThumbnail(profile.avatar)
            .setURL(`https://gameflip.com/profile/${profile.owner}`)
            .setTitle(profile.display_name)

            let posted = await postListing(key, secret, title, "Custom Bundle", listingPrice, profile.owner, imgUrl)
            if (!posted) return await errorEmbed2(msg, 'Some Error Occurred Posting the Listing')

            embed.setDescription(`Successfully Posted ${title} (${listingPrice} USD) , It is Available at https://gameflip.com/item/${posted}`)

            await msg.edit(embed)

        }catch(e) {
            return await errorEmbed2(msg, 'Some Unknown Error Occurred')
        }
    }
}