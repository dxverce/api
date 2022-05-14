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
    name: 'link',
    description: 'Link Your Gameflip Account to Bot.',
    category: 'gameflip',
    cooldown:2,
    aliases: ['i'],

    run: async (client, message, args) => {
      try{
      let userFile = './users/'+message.author.id+'.json'
      if (fs.existsSync(userFile)) return errorEmbed(message,'An Account For This Discord Account Already Exist , Logout and then Login')
      let properUsage = `${prefix}link apiKey apiSecret is Proper Usage for this Command`
      const apiKey = args[0]
      const apiSecret = args[1]
      if (!apiKey) return errorEmbed(message,properUsage)
      if (!apiSecret) return errorEmbed(message,properUsage)
      
      let loading = new MessageEmbed()
          .setColor('RANDOM')
          .setDescription('Connecting to Gameflip '+emojis.loading)
          .setTimestamp()
      let msg = await message.reply(loading)
      
      try{
        await message.delete()
      }catch{}

      let profile = await getProfile(apiKey,apiSecret)
      if (!profile) return await errorEmbed2(msg,'Sorry The Api Key/Secret You Provided is not Valid!')
      let success = new MessageEmbed()
          .setAuthor(message.author.username,message.author.avatarURL({dynamic:true}))
          .setColor('RANDOM')
          .setTimestamp()
          .setTitle(profile.display_name)
          .setURL(`https://gameflip.com/profile/${profile.owner}`)
          if(message.channel.type === 'dm') success.addField('Info' , `First Name - ${profile.first_name}\nLast Name - ${profile.last_name}\nEmail - ${profile.email}\nContact Number - ${profile.phone}`,true)
          if (profile.rating_good && profile.rating_neutral && profile.rating_poor) success.addField('Ratings',`Good - ${profile.rating_good}\nNeutral - ${profile.rating_neutral}\nPoor - ${profile.rating_poor}`,true)
          if (profile.sell) success.addField('Sales',profile.sell,true)
          .setThumbnail(profile.avatar)
      await msg.edit(success)
      
      let userData = JSON.stringify({
        key:apiKey,
        secret:apiSecret,
        username:profile.display_name,
        url:`https://gameflip.com/profile/${profile.owner}`,
        listings:{},
        shipping:3,
        expire:7,
        autoPost:false,
        timeInterval:60,
        premium:false,
        purgeTime:3600,
        priceFactor:1,
        avatar:profile.avatar,
        owner:profile.owner
      },null,4)
      fs.writeFileSync(userFile,userData)

      }catch{
        return await errorEmbed2(msg,'Some Unknown Error Occurred!')
      }
    }
}
