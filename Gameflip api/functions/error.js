const {MessageEmbed} = require('discord.js')

async function errorEmbed(msg,note){
  let embed = new MessageEmbed()
      .setAuthor(msg.author.username,msg.author.avatarURL({dynamic:true}))
      .setColor('RED')
      .setTimestamp()
      .setFooter('Some Error Occurred')
      .setDescription(note)
  await msg.reply(embed)
}
async function errorEmbed2(msg,note){
  let embed = new MessageEmbed()
      .setColor('RED')
      .setTimestamp()
      .setFooter('Some Error Occurred')
      .setDescription(note)
  await msg.edit(embed)
}

module.exports = {
  errorEmbed,
  errorEmbed2
}