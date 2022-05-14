const config = require('../../config.js');
const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js')
const prefix = config.discord.prefix;
const {errorEmbed , errorEmbed2} = require('../../functions/error')
const {getProfile, getSales} = require('../../functions/apiHandler')
const {generateTotp} = require('../../functions/generateTotp')
const emojis = require('../../util/emojis.json')
const fs = require('fs')

module.exports = {
    name: 'sales',
    description: 'Shows your Gameflip Sales.',
    category: 'gameflip',
    cooldown:2,
    aliases: ['gfsales'],

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
      let sales = await getSales(key,secret,profile.sell)
      if (!sales) return await errorEmbed2(msg,'Some Unknown Error Occurred ,Please Report The Error!')
      sales = sales.exchanges
      // console.log(sales.length)
      // console.log(JSON.stringify(sales)) 
        const generateEmbed = start => {
            const current = Object.keys(sales).slice(start, start + 10)

            let currentArray = []
            current.forEach(g => {
                index = g
                currentArray.push(sales[g])
            })
            
        let success = new MessageEmbed()
          .setAuthor(message.author.username,message.author.avatarURL({dynamic:true}))
          .setDescription('Top 100 Sales Data')
          .setColor('RANDOM')
          .setTimestamp()
          .setTitle(profile.display_name)
          .setURL(`https://gameflip.com/profile/${profile.owner}`)
          if (profile.sell) success.addField('Sales',profile.sell,true)
          .setThumbnail(profile.avatar)

            let newFieldName;
            for (var ii = 0; ii < currentArray.length; ii += 5) {
                let field_value = ''
                for (var jj = ii; jj < Math.min(currentArray.length, ii + 5); jj += 1) {
                    if (jj > 5) newFieldName = "Sales (Continued)"
                    else newFieldName = "Sales"

                    let sale = currentArray[jj];
                    let base = 'https://gameflip.com/profile/'
                    // console.log(sale)
                    field_value += sale.name + ` (${sale.price/100}${sale.accept_currency}) [BUYER](${base+sale.buyer})`;
                    field_value += '\n';
                }
                success.addField(
                    newFieldName,
                    field_value
                )
            }

            return success;
        }

        const author = message.author

        msg.edit(generateEmbed(0)).then(message => {

            if (sales.length <= 10) return

            message.react('◀️')
            message.react('▶️')

            const collector = message.createReactionCollector(
                (reaction, user) => ['◀️', '▶️'].includes(reaction.emoji.name) && user.id === author.id,
                { time: 300000 }
            )

            let currentIndex = 0
            collector.on('collect', async reaction => {

                try {
                    await reaction.users.remove(author)
                } catch { }

                reaction.emoji.name === '◀️' ? (currentIndex <= 10 ? currentIndex = 0 : currentIndex -= 10) : (currentIndex + 10 <= Object.keys(sales).length ? currentIndex += 10 : currentIndex = currentIndex)

                msg.edit(generateEmbed(currentIndex))

                if (currentIndex !== 0) await message.react('◀️')

                if (currentIndex + 10 < Object.entries(sales).length) message.react('▶️')

            })
        })  
          
    }catch(e){
       console.log(e)
      return errorEmbed2(msg,'Some Unknown Error Occurred')
    }
  }
}
