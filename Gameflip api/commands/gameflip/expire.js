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
    name: 'expiredays',
    description: 'Change your Listing Expire Days',
    category: 'gameflip',
    cooldown:2,
    aliases: ['expireindays'],

    run: async (client, message, args) => {
      try{
      let userFile = './users/'+message.author.id+'.json'
      if (!fs.existsSync(userFile)) return errorEmbed(message,'You are not Logged In')
      let newDays = args[0]
      if (!newDays) return errorEmbed(message,'What you want to set Expire in Days as?')
      if (30<newDays) return errorEmbed(message,'You can not set more than 30d as Expire in Days')
      if (3>newDays) return errorEmbed(message,'You can not set less than 3d as Expire in Days')
      if (!isNaN(newDays)) {
      let userData = JSON.parse(fs.readFileSync(userFile))
      let currentDays = userData['expire']
      userData['expire'] = parseInt(newDays)
      fs.writeFileSync(userFile , JSON.stringify(userData,null,4))
      let embed = new MessageEmbed()
          .setAuthor(message.author.username,message.author.avatarURL({dynamic:true}))
          .setTimestamp()
          .setColor('RANDOM')
          .setFooter(message.author.id)
          .setDescription('Successfully Updated Expire in Days from '+currentDays +' days to '+newDays+' days!')
      await message.reply(embed)
      } else return errorEmbed(message,'Thats not Valid Days')
    }catch(e){
      return errorEmbed(message,'Some Unknown Error Occurred')
    }
  }
}
