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
const {
    autoPoster,
    autoPurger
} = require(`../../functions/autoPost`)
const emojis = require('../../util/emojis.json')
const fs = require('fs')

module.exports = {
    name: 'autopost',
    description: 'autopost on or off',
    category: 'gameflip',
    premium: true,
    cooldown: 2,
    aliases: ['auto'],

    run: async (client, message, args) => {
        try {
            let userFile = './users/'+message.author.id+'.json'
            if (!fs.existsSync(userFile)) return errorEmbed(message, 'You are not Logged In')

            let newSetting = args[0]
            if (!newSetting)  return await errorEmbed(message, 'Provide a Setting , Valid Settings are On/Off')
            newSetting = newSetting.toLowerCase()

            let userData = JSON.parse(fs.readFileSync(userFile))

            let currentSetting = userData['autoPost']

            if (newSetting === 'on') {
                userData['autoPost'] = true
            } else if (newSetting === 'off') userData['autoPost'] = false
            else return await errorEmbed(message, 'That is not a Valid Setting , Valid Settings are On/Off')

            fs.writeFileSync(userFile, JSON.stringify(userData, null, 4))

            let embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL({
                dynamic: true
            }))
            .setTimestamp()
            .setColor('RANDOM')
            .setFooter(message.author.id)
            .setDescription('Successfully Updated Auto Post Settings from '+(currentSetting?'On': 'Off') +' to '+newSetting.toUpperCase()+' !')
            await message.reply(embed)

            autoPoster(message.author.id, client)
            autoPurger(message.author.id, client)

        }catch(e) {
            return await errorEmbed(message, 'Some Unknown Error Occurred')
        }
    }
}