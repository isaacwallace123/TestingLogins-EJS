const { TimestampStyles } = require('discord.js');
const { cooldown } = require('../../commands/moderation/help');

require('dotenv').config();

const cooldowns = new Map();

let AS = {};

const timeAS = 4;
const msgsAS = 4;

const validPermissions = [
    "CREATE_INSTANT_INVITE",
    "KICK_MEMBERS",
    "BAN_MEMBERS",
    "ADMINISTRATOR",
    "MANAGE_CHANNELS",
    "MANAGE_GUILD",
    "ADD_REACTIONS",
    "VIEW_AUDIT_LOG",
    "PRIORITY_SPEAKER",
    "STREAM",
    "VIEW_CHANNEL",
    "SEND_MESSAGES",
    "SEND_TTS_MESSAGES",
    "MANAGE_MESSAGES",
    "EMBED_LINKS",
    "ATTACH_FILES",
    "READ_MESSAGE_HISTORY",
    "MENTION_EVERYONE",
    "USE_EXTERNAL_EMOJIS",
    "VIEW_GUILD_INSIGHTS",
    "CONNECT",
    "SPEAK",
    "MUTE_MEMBERS",
    "DEAFEN_MEMBERS",
    "MOVE_MEMBERS",
    "USE_VAD",
    "CHANGE_NICKNAME",
    "MANAGE_NICKNAMES",
    "MANAGE_ROLES",
    "MANAGE_WEBHOOKS",
    "MANAGE_EMOJIS",
]

module.exports = async(Discord, bot, message) => {
    if(message.author.bot || !message.guild) return;
    if(!AS[message.author.id]) AS[message.author.id] = {};
    if(!AS[message.author.id][message.guild.id]) AS[message.author.id][message.author.id] = 1, setTimeout(() => { delete AS[message.author.id][message.guild.id] }, timeAS * 1000);
    else if(AS[message.author.id][message.guild.id] < msgsAS) AS[message.author.id][message.guild.id]++;
    else if(AS[message.author.id][message.guild.id] >= msgsAS) return message.delete(), message.reply(`Don't spam!`).then(e => e.delete({ timeout: 3000 }));
    else AS[message.author.id] = {}, AS[message.author.id][message.guild.id] = 1;

    const blacklist = require('../../blacklist.json');
    const blacklistUsers = Object.keys(blacklist);
    let listed = false;

    blacklistUsers.forEach(id => {
        if(message.author.id === id) listed = true;
    })
    if(listed) return message.channel.send(`You are a blacklist user!`);

    const args = message.content.slice(process.env.PREFIX.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const commands = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    console.log(commandName)
    if (!commands) return;
    
    if(commands.permissions.length) {
        let invalidPerms = [];
        for(const perm of commands.permissions) {
            if(!validPermissions.includes(perm)) {
                return console.log(`Invalid Permissions. ${perm}`);
            }

            if(!message.member.hasPermission(perm)) {
                invalidPerms.push(perm);
            }
        }
        if(invalidPerms.length) {
            return message.channel.send(`Missing Permissions: \`${invalidPerms}\``);
        }
    }

    if(!cooldowns.has(commands.name)) {
        cooldowns.set(commands.name, new Discord.Collection());
    }

    const current_time = Date.now();
    const time_stamps = cooldowns.get(commands.name);
    const cooldown_amount = (commands.cooldown) * 1000;

    if(time_stamps.has(message.author.id)) {
        const expiration_time = time_stamps.get(message.author.id) + cooldown_amount;

        if(current_time < expiration_time) {
            const time_left = (expiration_time - current_time) / 1000;

            return message.reply(`Please wait ${time_left.toFixed(1)} more seconds before using the "${commandName}" command!`);
        }
    }
    
    time_stamps.set(message.author.id, current_time);
    setTimeout(() => time_stamps.delete(message.author.id), cooldown_amount);

    try {
        commands.execute(bot, message, args, Discord, commandName, message.author);
    } catch(err) {
        await message.react("❌");
        message.reply(`There was an error trying to run this command!`);
        console.log(err);
    }
}