const config = require('../../config.js');
const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js')
const prefix = config.discord.prefix;
const {errorEmbed , errorEmbed2} = require('../../functions/error')
const {getProfile} = require('../../functions/apiHandler')
const {generateTotp} = require('../../functions/generateTotp')
const emojis = require('../../util/emojis.json')
const fs = require('fs')

module.exports = {
    name: 'purgetime',
    description: 'Change your Auto Purge Interval',
    category: 'gameflip',
    cooldown:2,
    aliases: ['autopurgetime'],

    run: async (client, message, args) => {
      try{
      let userFile = './users/'+message.author.id+'.json'
      if (!fs.existsSync(userFile)) return errorEmbed(message,'You are not Logged In')
      let newTime = args[0]
      if (!newTime) return errorEmbed(message,'Provide a Purge Interval')
      if (604800<newTime) return errorEmbed(message,'You can not set more than 604800s as auto purge interval')
      if (120>newTime) return errorEmbed(message,'You can not set less than 120s as auto purge interval')
      if (!isNaN(newTime)) {
      let userData = JSON.parse(fs.readFileSync(userFile))
      let currentTime = userData['purgeTime']
      userData['purgeTime'] = parseInt(newTime)
      fs.writeFileSync(userFile , JSON.stringify(userData,null,4))
      let embed = new MessageEmbed()
          .setAuthor(message.author.username,message.author.avatarURL({dynamic:true}))
          .setTimestamp()
          .setColor('RANDOM')
          .setFooter(message.author.id)
          .setDescription('Successfully Updated Auto Purge Time from '+currentTime +'s to '+newTime+'s !')
      await message.reply(embed)
      } else return errorEmbed(message,'Thats not a Valid Time')
    }catch(e){
      return errorEmbed(message,'Some Unknown Error Occurred')
    }
  }
}
