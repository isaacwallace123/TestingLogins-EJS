module.exports = (Discord, bot) => {
    try {
        bot.guilds.cache.forEach(guild => {
            guild.invites.fetch().then(guildInvites => {
                bot.invites[guild.id] = guildInvites;
            })
        })

        function pickStatus() {
            let status = [`Fruit's. Finest Juice.`,`Use ${process.env.PREFIX}h for help!`];
            let RandomPick = Math.floor(Math.random() * status.length);

            bot.user.setActivity(status[RandomPick], { type: "WATCHING" });
        }

        bot.user.setStatus('dnd');
        setInterval(pickStatus, 8000);

        //console.log(bot.user);
    } catch(err) {
        console.log(err);
    }
}