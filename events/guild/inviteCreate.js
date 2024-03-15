module.exports = async(discord, bot, invite) => {
    bot.invites.set(invite.guild.id, await invite.guild.invites.fetch());
}