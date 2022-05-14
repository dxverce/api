const config = require('../../config.js');
const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js')
const prefix = config.discord.prefix;
const {errorEmbed , errorEmbed2} = require('../../functions/error')
const {getProfile} = require('../../functions/apiHandler')
const {generateTotp} = require('../../functions/generateTotp')
const emojis = require('../../util/emojis.json')
const fs = require('fs')
const Canvas = require('canvas')
var sha1 = require('sha1');

module.exports = {
    name: 'dump',
    description: 'Dump',
    category: 'gameflip',
    cooldown:2,
    aliases: ['remove'],

    run: async (client, message, args) => {
      let msg;
      try{
      let userFile = './users/'+message.author.id+'.json'
      if (!fs.existsSync(userFile)) return errorEmbed(message,'You are not Logged In')
      let att = new Discord.MessageAttachment(userFile)
      await message.reply(att)
    }catch(e){
      // console.log(e)
      return errorEmbed2(msg,'Some Unknown Error Occurred')
    }
  }
}
