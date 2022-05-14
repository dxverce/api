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
    name: 'list',
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

            let listingArg = args.join(" ")
            if (!listingArg) {

                let listIndex = 1
                let listingArr = []
                for (let i in listings) {
                    let listing = listings[i]
                    listing['index'] = listIndex
                    listingArr.push(listing)
                    listIndex ++
                }

                if (listingArr.length < 1) return await errorEmbed2(msg, 'No Saved Enabled Listings Found!')
                

                let pages = [];
                let page = 0;
                let pageSize = 30

                for (let i = 0; i <= listingArr.length; i += pageSize) {
                    pages.push({
                        author: {
                            name: message.author.username,
                            icon_url: message.author.avatarURL({
                                dynamic: true
                            })
                        },
                        color: 'RANDOM',
                        thumbnail: {
                            url: profile.avatar
                        },
                        title: profile.display_name,
                        description: listingArr.slice(i, i+pageSize).map(c => {
                            // console.log(c)
                            let {
                                index, name, price, isDisabled
                            } = c
                            return `\`${index}.\` **${name}** (${price} USD)${(isDisabled?' (Disabled)': '')}`
                        }).join('\n'),
                        timestamp: new Date(),
                        footer: {
                            text: 'Page '+(pages.length+1)
                        }
                    });
                }
                pages.forEach(p=> p.footer.text += ' of ' + pages.length)
                await msg.delete()
                new PagedEmbed(message, pages);

            } else {
                if (isNaN(listingArg)) return await errorEmbed2(msg, 'Provide VALID Disabled Listing Index (Number of Listing) that you want to Check')
                listingArg = parseInt(listingArg) - 1
                let chosenListing = []
                let index = 0
                for (let i in listings) {
                    if (index == listingArg) chosenListing.push(listings[i])
                    index ++
                }
                if (chosenListing.length < 1) return await errorEmbed2(msg, 'Sorry No Listing Found with that Name')
                chosenListing = chosenListing[0]

                let success2 = new MessageEmbed()
                .setAuthor(message.author.username, message.author.avatarURL({
                    dynamic: true
                }))
                .setDescription('Saved Listings')
                .setColor('RANDOM')
                .setTimestamp()
                .setTitle(profile.display_name)
                .setURL(`https://gameflip.com/profile/${profile.owner}`)
                .setThumbnail(profile.avatar)
                .addField('Listing Name', chosenListing.name, true)
                .addField('Listing Description', chosenListing.description, true)
                .addField('Listing Price', chosenListing.price, true)
                .addField('Listing Status', (chosenListing.isDisabled?'Disabled': 'Enabled'), true)
                .setImage(chosenListing.image)
                if (chosenListing.tags && chosenListing.tags.length != 0) success2.addField('TAGS', chosenListing.tags, true)
                await msg.edit(success2)
            }
        }catch(e) {
            console.log(e)
            return errorEmbed2(msg, 'Some Unknown Error Occurred')
        }
    }
}