const fs = require('fs')
async function checkPremium(id){
  let userFile = './users/'+id+'.json'
  if (!fs.existsSync(userFile)) return false
  let userData = JSON.parse(fs.readFileSync(userFile))
  let premium = userData['premium']
  if(!premium) return false
  else return true
}
module.exports = {
  checkPremium
}