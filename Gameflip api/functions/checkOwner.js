const config = require('../config');

async function checkOwner(id) {
    if (config.discord.ownerIDs.includes(id)) {
        return true;
    } else {
        return false;
    }
}

module.exports= {
  checkOwner
};