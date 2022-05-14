const config = require('../../config.js');
const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js')

module.exports = {
    name: 'help',
    description: 'Shows a list of available commands.',
    category: 'info',
    cooldown:2,
    aliases: ['h'],

    run: async (client, message, args) => {

        const prefix = config.discord.prefix;

        const commands = {
            info: client.commands.filter(x => x.category === 'info'),
            gameflip: client.commands.filter(x => x.category === 'gameflip'),
        }

        let command = client.commands.get(args[0]);
        if (!command) command = client.commands.get(client.aliases.get(args[0]));

        if (command) {
            const cmdEmbed = new MessageEmbed()
                .setColor('RANDOM')
                .setAuthor(command.name)
                .setDescription(command.description)
                .setTimestamp()
                .addField('Category',command.category)
                if(command.aliases) cmdEmbed.addField('Aliases',command.aliases ? command.aliases.map(x => x).join(', ') : 'None')
            message.reply(cmdEmbed);
        } else {
            const embed = new MessageEmbed()
                .setColor('RANDOM')
                .setAuthor('Commands')
                .setDescription(`Bot Command List`)
                .addField(`Info [${commands.info.size}]`, commands.info.map(x => `\`${x.name}\``).join(' , '))
                .addField(`Gameflip [${commands.gameflip.size}]`, commands.gameflip.map(x => `\`${x.name}\``).join(' , '))
                .setFooter(`${prefix}help <command name> to get help on command`);
            message.reply(embed);
        }
    }
}
