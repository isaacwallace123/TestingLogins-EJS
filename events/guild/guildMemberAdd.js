module.exports = async(Discord, bot, member) => {
    try {
        if(member.id === bot.user.id || member.user.bot) return;

        const welcomeChannel = member.guild.channels.cache.find(ch => ch.id.includes(743405427454115860));

        const inviteChannel = member.guild.channels.cache.find(ch => ch.name.includes('invites'));
        if (inviteChannel) {
            member.guild.invites.fetch().then(guildInvites => {
                guildInvites.forEach(invite => {
                    if (invite.inviter.bot) return;
                    if (invite.uses != bot.invites[invite.code]) {
                        const InviteEmbed = new Discord.EmbedBuilder()
                            .setTitle(`Fruit's Invite Tracker`)
                            .setDescription(`Welcome ${member.user.tag}! You were invited by ${invite.inviter.tag}!`)
                            .setColor('0x0099FF')
                            .addFields(
                                { name: "Information", value: [`➤ **Code:** ${invite.code}`,`  ➤ **Created by:** ${invite.inviter.tag}`,`  ➤ **Uses:** ${invite.uses}`,`➤ **Channel:** ${invite.channel}`].join('\n') }
                            )
                            .setImage("https://cdn.discordapp.com/attachments/645706893821476877/882385474759585822/header.png")

                        /*InviteEmbed.setFooter({ text: `Fruit's Invite Tracker` })
                        InviteEmbed.setTimestamp()*/

                        if (invite.inviter.id !== member.guild.fetchOwner().id) {
                            inviteChannel.send({ embeds: [InviteEmbed] });
                        }
                        bot.invites[invite.code] = invite.uses
                    }
                });
            });
        }
    } catch(err) {
        console.log(err);
    }
}