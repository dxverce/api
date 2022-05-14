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
    name: 'premium',
    description: 'Grant/Ungrant Premium',
    category: 'info',
    cooldown:2,
    ownerOnly:true,
    aliases: ['prem'],

    run: async (client, message, args) => {
      try{
      let mention = message.mentions.members.first()
      if (!mention) return errorEmbed(message, 'Mention Someone')
      mention = mention.id
      let userFile = `./users/${mention}.json`
      if (!fs.existsSync(userFile)) return errorEmbed(message,'User you Mentioned is not Logged In!')
      let userData  = JSON.parse(fs.readFileSync(userFile))
      let currentSetting = userData['premium']
      let newSetting = args[0]
      if (!newSetting) return errorEmbed(message,'Provide a Setting Grant/Ungrant')
      if (newSetting.toLowerCase() === 'grant') userData['premium'] = true
      else if (newSetting.toLowerCase() === 'ungrant') userData['premium'] = false
      else return errorEmbed(message,'That is not a Valid Setting , Valid Settings are Grant/Ungrant')
      fs.writeFileSync(userFile , JSON.stringify(userData,null,4))
      
      let newPremium = userData['premium']
      
      let embed = new MessageEmbed()
          .setAuthor(message.author.username,message.author.avatarURL({dynamic:true}))
          .setTimestamp()
          .setColor('RANDOM')
          .setFooter(message.author.id)
          .setDescription('Successfully Updated Premium of <@'+mention+ '> from '+(currentSetting?'Enabled':'Disabled') +' to '+(newPremium?'Enabled':'Disabled')+' !')
      await message.reply(embed)
      }catch(e){
        // console.log(e)
        return await errorEmbed(message,'Some Unknown Error Occurred!')
      }
    }
}
