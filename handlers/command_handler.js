const fs = require('fs');

module.exports = async(bot, Discord) => {
    const categories = fs.readdirSync('./commands/');

    for(const category of categories) {
        const commandFiles = fs.readdirSync(`./commands/${category}`).filter(File => File.endsWith('.js'));

        for(const file of commandFiles) {
            const command = require(`../commands/${category}/${file}`);

            if(command.name) {
                bot.commands.set(command.name, command);
                //console.log(`✔️ - ${command.name} Has Loaded Successfully!\n`);
            } else {
                continue;
            }
        }
    }
}