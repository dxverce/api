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
    postListing,
    getListings
} = require('../../functions/apiHandler')
const {
    generateTotp
} = require('../../functions/generateTotp')
const emojis = require('../../util/emojis.json')
const fs = require('fs')
const Canvas = require('canvas')
var sha1 = require('sha1');

module.exports = {
    name: 'post',
    description: 'Post any of your Saved Listing.',
    category: 'gameflip',
    cooldown: 20,
    premium: true,
    aliases: ['publish'],

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
            let ship = userData['shipping']
            let expire = userData['expire']
            let factor = userData.priceFactor
            if (!factor) factor = 1
            
            let profile = await getProfile(key, secret)
            if (!profile) return await errorEmbed2(msg, 'Sorry Your Saved Api Key/Secret is no more Valid , Please Relink your Account!')

            if (listings.length < 1) return await errorEmbed2(msg, 'No Saved Listing Found:(')

            let ListingNum = args[0]
            if (!ListingNum) return await errorEmbed2(msg, 'Provide Listing Index (Number of Listing) that you want to Edit')
            if (isNaN(ListingNum)) return await errorEmbed2(msg, 'Provide VALID Listing Index (Number of Listing) that you want to Delete')
            ListingNum = parseInt(ListingNum) - 1

            let chosenListing = []
            let h = 0
            for (let i in listings) {
                if (h == ListingNum) {
                    chosenListing.push(listings[i])
                    listingId = i
                }
                h++
            }
            if (chosenListing.length < 1) return await errorEmbed2(msg, 'Sorry No Listing Found with that Index')
            chosenListing = chosenListing[0]
            
            listingTags = false
            if (chosenListing.tags && chosenListing.tags.length != 0) listingTags = chosenListing.tags
            if (!listingTags) listingTags = [`Name : ${chosenListing.name}` , `Price : ${chosenListing.price * factor}` , `Delivery : Fast`]
            
            console.log(factor , chosenListing.price , chosenListing.price * factor)
            
            let posted = await postListing(key, secret, chosenListing.name, chosenListing.description, (chosenListing.price*factor), profile.owner, chosenListing.image, ship, expire , listingTags)
            if (!posted) return await errorEmbed2(msg, 'Some Error Occurred Posting the Listing')
            // console.log(posted)

            let success2 = new MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL({
                dynamic: true
            }))
            .setDescription('Successfully Posted this Listing from your Saved Listings!')
            .setColor('RANDOM')
            .setTimestamp()
            .setTitle(profile.display_name)
            .setURL(`https://gameflip.com/profile/${profile.owner}`)
            .setThumbnail(profile.avatar)
            .addField('Listing Name', chosenListing.name, true)
            .addField('Listing Description', chosenListing.description, true)
            .addField('Listing Price', chosenListing.price, true)
            .setImage(chosenListing.image)

            await msg.edit(success2)

        }catch(e) {
            // console.log(e)
            return errorEmbed2(msg, 'Some Unknown Error Occurred')
        }
    }
}