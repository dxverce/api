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
var sha1 = require('sha1');

module.exports = {
    name: 'edit',
    description: 'Edit any of your Saved Listing.',
    category: 'gameflip',
    cooldown: 2,
    aliases: ['ed'],

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

            if (Object.keys(listings).length == 0) return await errorEmbed2(msg, 'No Saved Listing Found:(')

            let ListingNum = args[0]
            if (!ListingNum) return await errorEmbed2(msg, 'Provide Listing Index (Number of Listing) that you want to Edit')
            if (isNaN(ListingNum)) return await errorEmbed2(msg, 'Provide VALID Listing Index (Number of Listing) that you want to Edit')
            ListingNum = parseInt(ListingNum) - 1

            let type = args[1]
            if (!type) return await errorEmbed2(msg, 'Specify a Valid Type of Edit Name/Description/Price/Tags!')
            type.toLowerCase()

            let listingArg = args.splice(2).join(" ")
            if (!listingArg) return await errorEmbed2(msg, `What do you want to keep new ${type} to , you didnt told that try again!`)

            let chosenListing = []
            let listingId;
            let h = 0
            for (let i in listings) {
                // console.log(h , i)
                if (h == ListingNum) {
                    chosenListing.push(listings[i])
                    listingId = i
                }
                h++
            }

            if (chosenListing.length < 1) return await errorEmbed2(msg, 'Sorry No Listing Found with that Number')
            chosenListing = chosenListing[0]
            let edit = listings[listingId]

            if (!edit['tags']) {
                edit['tags'] = []
                fs.writeFileSync(userFile, JSON.stringify(userData, null, 4))
                userData = JSON.parse(fs.readFileSync(userFile))
                listings = userData['listings']
                edit = listings[listingId]
            }

            switch (type) {

                case "name":
                    edit['name'] = listingArg
                    break;

                case "description":
                    edit['description'] = listingArg
                    break;

                case "price":
                    edit['price'] = listingArg
                    break;

                case "tags":
                    if (listingArg.toLowerCase() === 'null') {
                        edit['tags'] = []
                    } else{
                    listingArg = listingArg.split(':')
                    if (!listingArg || !listingArg[0] || !listingArg[1]) return await errorEmbed2(msg, 'Proper Usage : \`$edit <listing number> tags key:value\`\nReplace Key And Value with your Tag Name and Description\nTo Remove all tags on a Listing \`$edit <listing number> tags null')
                    if (edit['tags'].length > 10) return await errorEmbed2(msg, 'You can not add more than 10 Tags to a Listing')
                    edit['tags'].push(`${listingArg[0]} : ${listingArg[1]}`)
                    }
                    break;

                default:
                    return await errorEmbed2(msg, 'Specify a Valid Type of Edit Name/Description/Price/Tags!')
                    break;
            }

            fs.writeFileSync(userFile, JSON.stringify(userData, null, 4))

            let success2 = new MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL({
                dynamic: true
            }))
            .setDescription('Successfully Edited Listing !')
            .setColor('RANDOM')
            .setTimestamp()
            .setTitle(profile.display_name)
            .setURL(`https://gameflip.com/profile/${profile.owner}`)
            .setThumbnail(profile.avatar)
            .addField('Listing Name', edit.name, true)
            .addField('Listing Description', edit.description, true)
            .addField('Listing Price', edit.price, true)
            if (edit.tags && edit.tags.length != 0) success2.addField('TAGS', edit.tags, true)
            .setImage(edit.image)

            await msg.edit(success2)

        }catch(e) {
            console.log(e)
            return errorEmbed2(msg, 'Some Unknown Error Occurred')
        }
    }
}