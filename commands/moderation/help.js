require('dotenv').config();

module.exports = {
    name: 'help',
    aliases: ['h'],
    cooldown: 5,
    permissions: [],
    usage: `${process.env.PREFIX}help`,
    description: 'This command is to help you use the discord bot!',
    async execute(bot, message, args, Discord, cmd, user) {
        const HelpEmbed = new Discord.EmbedBuilder()
            .setTitle('**Help Command Usage**')
            .setColor('0x0099FF')
            .setDescription(`Hello There! You need help? Well I got you! Here is a list of things I can help you with!`)
            .addFields(
                { name: 'Finding Command List', value: `If you would like to look at a list of commands that this Discord bot can use, then simply type the following command: \n\n ${process.env.PREFIX}cmds <Category (economy, fun, help, moderation)>`, inline: false }
            )
            .setFooter({ text: 'Wall-Y Helper', iconURL: null })
            .setTimestamp()
        return message.channel.send({ embeds: [HelpEmbed] });
    }
}