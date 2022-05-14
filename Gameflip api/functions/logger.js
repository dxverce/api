var colors = require('colors')
const Discord = require('discord.js')
async function logger(type,user,content,client){
  switch(type){
    case "error":
      console.log((`${user} got an Error : "${content}"`).red)
      break;
    case "command":
      console.log((`${user} used command : "${content}"`).cyan)
      break;
    case "dm":
      console.log((`${user} did a DM to Gameflip Bot : "${content.content}"`).blue)
      break;
    case "publish":
      console.log((`Published a Message from ${user} : "${content}"`).yellow)
      break;
    case "event":
      console.log((content).green)
      break;
  }
}
module.exports={
  logger
}