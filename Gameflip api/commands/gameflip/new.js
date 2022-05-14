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

function parseArguments(args) {
    try {
        args = args.join(" ")
        const regex = new RegExp('"[^"]+"|[\\S]+', 'g');
        const parsed = [];
        args.match(regex).forEach(element => {
            if (!element) return;
            return parsed.push(element.replace(/"/g, ''));
        });
        let final = {}
        final['title'] = parsed[0]
        final['description'] = parsed[1]
        final['price'] = parsed[2]
        final['img'] = parsed[3]
        return final
    }catch(e) {
        return false
    }
}

function encode(secret, length) {
    const hash = sha1(`${new Date()}${secret}`);
    const split = hash.match(new RegExp('.{1,' + length + '}', 'g'));
    let final = '';

    let id = '';

    for (let i in split) {
        if (i > length-1) continue;
        id += split[i];
        id += '-';
    }

    for (let i = 0; i < length; i++) {
        if (i !== 0 && i < length) final += '-';
        final += split[i];
    }

    return final;
}

async function compressImage(img, client) {
    try {
        const canvas = Canvas.createCanvas(512,
            512)
        const ctx = canvas.getContext('2d')
        const image = await Canvas.loadImage(img)
        ctx.drawImage(image,
            0,
            0,
            512,
            512)
        const buffer = await canvas.toBuffer('image/jpeg')
        let att = new Discord.MessageAttachment(buffer,
            'gameflip.png')
        const imgChannel = client.channels.cache.find(c=> c.id === '919202867909386260')
        let imgMsg = await imgChannel.send(att)
        let imgUrl = await imgMsg.attachments.first().url
        return imgUrl
    }catch(e) {
        console.log(e)
        return false
    }
}

module.exports = {
    name: 'new',
    description: 'Create a New Listing and Save.',
    category: 'gameflip',
    cooldown: 2,
    aliases: ['newlisting'],

    run: async (client,
        message,
        args) => {
        try {
            let userFile = './users/'+message.author.id+'.json'
            if (!fs.existsSync(userFile)) return errorEmbed(message, 'You are not Logged In')

            let loading = new MessageEmbed()
            .setColor('RANDOM')
            .setDescription('Connecting to Gameflip '+emojis.loading)
            .setTimestamp()
            let msg = await message.reply(loading)

            const validUsage = `Proper Usage : $new "listing-title" "listing description" price-in-usd image-url`

            args = parseArguments(args)

            if (!args || !args.title || !args.description || !args.price || isNaN(args.price) || !args.img) return await errorEmbed2(msg, validUsage)

            let listingName = args.title
            let listingDescr = args.description
            let listingPrice = args.price
            let img = args.img

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

            let imgUrl = await compressImage(img, client)
            if (!imgUrl) return await errorEmbed2(msg, 'Thats not an Image!')

            embed.addField('Listing Name', listingName, true)
            .addField('Listing Description', listingDescr, true)
            .addField('Listing Price', listingPrice, true)
            .setImage(imgUrl)

            let hash = encode(listingName, 4)
            var obj = {}
            obj['name'] = listingName
            obj['description'] = listingDescr
            obj['price'] = listingPrice
            obj['image'] = imgUrl
            obj['tags'] = []
            obj['isPosted'] = false
            listings[hash] = obj
            embed.setDescription('Successfully Saved Your Listing, Listing Id - '+hash)
            fs.writeFileSync(userFile, JSON.stringify(userData, null, 4))

            await msg.delete()
            await message.reply(embed)


        }catch(e) {
            // console.log(e)
            return await errorEmbed2(msg, 'Some Unknown Error Occurred')
        }
    }
}