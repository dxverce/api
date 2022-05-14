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
const emojis = require('../../util/emojis.json')
const fs = require('fs')

module.exports = {
    name: 'pricefactor',
    description: 'Change your Price Factor.',
    category: 'gameflip',
    cooldown: 2,
    aliases: ['pf'],

    run: async (client, message, args) => {
        try {
            let userFile = './users/'+message.author.id+'.json'
            if (!fs.existsSync(userFile)) return errorEmbed(message, 'You are not Logged In')
            let newFactor = args[0]
            if (!newFactor) return errorEmbed(message, 'What you want to set Price Factor?')
            if (!isNaN(newFactor)) {
                let userData = JSON.parse(fs.readFileSync(userFile))
                let current = userData['priceFactor']
                userData['priceFactor'] = newFactor
                fs.writeFileSync(userFile, JSON.stringify(userData, null, 4))
                let embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.avatarURL({
                    dynamic: true
                }))
                .setTimestamp()
                .setColor('RANDOM')
                .setFooter(message.author.id)
                .setDescription('Successfully Updated Price Factor from '+current +' to '+newFactor+'!')
                await message.reply(embed)
            } else return errorEmbed(message, 'Thats not Valid Price Factor')
        }catch(e) {
            return errorEmbed(message, 'Some Unknown Error Occurred')
        }
    }
}