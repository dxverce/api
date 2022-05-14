const { readdirSync } = require('fs');

module.exports = (client) => {
    readdirSync(__dirname + '/commands/').forEach(dir => {
        const commands = readdirSync(__dirname + `/commands/${dir}/`).filter(file => file.endsWith('.js'));

        for (let file of commands) {
            let pull = require(__dirname + `/commands/${dir}/${file}`);

            if (pull.name) {
                client.commands.set(pull.name, pull);
            }
	    console.log(pull.name);

            if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
        }
    });
}