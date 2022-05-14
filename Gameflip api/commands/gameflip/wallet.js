const config = require('../../config.js');
const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js')
const prefix = config.discord.prefix;
const {errorEmbed , errorEmbed2} = require('../../functions/error')
const {getProfile, getWallet} = require('../../functions/apiHandler')
const {generateTotp} = require('../../functions/generateTotp')
const emojis = require('../../util/emojis.json')
const fs = require('fs')

module.exports = {
    name: 'wallet',
    description: 'Shows your Gameflip Wallet.',
    category: 'gameflip',
    cooldown:2,
    aliases: ['gfwallet'],

    run: async (client, message, args) => {
    let msg;
      try{
      let userFile = './users/'+message.author.id+'.json'
      if (!fs.existsSync(userFile)) return errorEmbed(message,'You are not Logged In')
      
      let loading = new MessageEmbed()
          .setColor('RANDOM')
          .setDescription('Connecting to Gameflip '+emojis.loading)
          .setTimestamp()
      msg = await message.reply(loading)
      
      let userData = JSON.parse(fs.readFileSync(userFile))
      let key = userData.key
      let secret = userData.secret
      let profile = await getProfile(key,secret)
      if (!profile) return await errorEmbed2(msg,'Sorry Your Saved Api Key/Secret is no more Valid , Please Relink your Account!')
      let wallet = await getWallet(key,secret)
      if (!wallet) return await errorEmbed2(msg,'Sorry Your Saved Api Key/Secret is no more Valid , Please Relink your Account!')

      let success = new MessageEmbed()
          .setAuthor(message.author.username,message.author.avatarURL({dynamic:true}))
          .setColor('RANDOM')
          .setTimestamp()
          .setTitle(profile.display_name)
          .setURL(`https://gameflip.com/profile/${profile.owner}`)
          if (wallet.balance) success.addField('Balance' , `USD - ${wallet.balance.USD/100}USD\nFLP - ${wallet.balance.FLP}\nCash Balance - ${wallet.cash_balance/100}USD\nBonus Balance - ${wallet.bonus_balance/100}USD`,true)
          if (profile.rating_good && profile.rating_neutral && profile.rating_poor) success.addField('Ratings',`Good - ${profile.rating_good}\nNeutral - ${profile.rating_neutral}\nPoor - ${profile.rating_poor}`,true)
          if (profile.sell) success.addField('Sales',profile.sell,true)
          .setThumbnail(profile.avatar)
      await msg.edit(success)
    }catch(e){
      return errorEmbed2(msg,'Some Unknown Error Occurred')
    }
  }
}
