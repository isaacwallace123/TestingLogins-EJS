const router = require('express').Router();
const { getPermissions } = require('../utils/utils');
const fetch = require('node-fetch');
const fs = require("fs");

const Discord = require('discord.js');
const acceptedApplicationWebHook = new Discord.WebhookClient({ url: process.env.ACCEPTEDAPPLICATIONWEBHOOK });

function isAuthorized(req, res, next) {
    if(req.user) {
        next();
    }
    else {
        res.redirect('/');
    }
}

router.get('/', isAuthorized, (req, res) => {
    const { guilds } = req.user;
    const guildMemberPermissions = new Map();

    var fruitsServer = null;

    guilds.forEach(guild => {
        const perm = getPermissions(guild.permissions);
        guildMemberPermissions.set(guild.id, perm);

        if(Number(guild.id) === 645557297199972361) {
            fruitsServer = guild;
        }
    });

    if (!fs.existsSync('Data.json')) {
        fs.closeSync(fs.openSync('Data.json', 'w'));
    }

    const data = fs.readFileSync('Data.json');
    const json = JSON.parse(data.toString())

    res.render('dashboard', {
        username: req.user.username,
        discordId: req.user.discordId,
        guilds: req.user.guilds,
        fruits: fruitsServer,
        permissions: guildMemberPermissions,
        applications: json
    });
});

router.post('/replyApplication', async function(req, res, next) {
    try {
        const raw = JSON.parse("[" + req.body.Output + "]")
        const data = {
            id: raw[0],
            status: (raw[1] == 0 ? true : false)
        }

        const dataFile = fs.readFileSync('Data.json');

        const removeData = async function(index) {
            const json = JSON.parse(dataFile.toString());
            delete json[index];
            let newData = json.filter(item => item !== null); 

            fs.writeFileSync("Data.json", JSON.stringify(newData), err => { if(err) throw err });
        };

        var ApplicantInfo;
        await fetch(`https://users.roblox.com/v1/users/${req.body.UserId}`, { method: "Get" }).then(PlrInfo => PlrInfo.json()).then((json) => {
            ApplicantInfo = json;
        });
        
        const sendWebhook = async function(hired) {
            const AccountCreationDate = ApplicantInfo.created.substring(0, 10).split("-");
            let newDate = new Date();
            var hours = newDate.getHours();

            let webhook = {
                type: "rich",
                embeds: [
                    {
                        author: {
                            name: ApplicantInfo.name,
                            icon_url: `https://www.roblox.com/headshot-thumbnail/image?userId=${ApplicantInfo.id}&width=60&height=60&format=png`
                        },
                        title: "**Player Accepted!**",
                        description: `***${ApplicantInfo.name}*** Was Been Hired On **${("0" + (newDate.getMonth() + 1)).slice(-2) + "/" + ("0" + newDate.getDate()).slice(-2) + "/" + (newDate.getFullYear() - 2000)}** At **${((hours % 12) || 12) + (hours >= 12 ? ' PM' : ' AM')}**.`,
                        color: 1043474,
                        url: `https://www.roblox.com/users/${ApplicantInfo.id}/profile`,
                        fields: [
                            {
                                name: "Account Age",
                                value: (((newDate.getFullYear() * 365) - (Number(AccountCreationDate[0]) * 365)) + (((newDate.getMonth() + 1) * 30) - (Number(AccountCreationDate[1]) * 30)) + (newDate.getDate() - Number(AccountCreationDate[2]))),
                                inline: true,
                            },
                            {
                                name: "UserID",
                                value: ApplicantInfo.id,
                                inline: true,
                            },
                            {
                                name: "Display Name",
                                value: ApplicantInfo.displayName,
                                inline: true,
                            },
                            {
                                name: "**Discord Information**",
                                value: req.body.DiscordInfo,
                                inline: false,
                            }
                        ],
                        image: { 
                            url: "https://cdn.discordapp.com/attachments/645706893821476877/882385474759585822/header.png"
                        },
                        footer: {
                            icon_url: "https://cdn.discordapp.com/attachments/882138040041078804/882167117397520414/image0_1_transparent.png",
                        },
                    }
                ],
            };

            if(!hired) {
                webhook.embeds[0].title = "**Player Denied!**";
                webhook.embeds[0].color = 15548997;
                webhook.embeds[0].description = `Player Application Denied On **${("0" + (newDate.getMonth() + 1)).slice(-2) + "/" + ("0" + newDate.getDate()).slice(-2) + "/" + (newDate.getFullYear() - 2000)}** At **${((hours % 12) || 12) + (hours >= 12 ? ' PM' : ' AM')}**.`;
            }

            await acceptedApplicationWebHook.send(webhook);

            await removeData(data.id);
        }

        await sendWebhook(data.status)

        res.redirect('/dashboard');
    } catch(err) {
        console.log(err);
        res.redirect('/dashboard');
    }
});

module.exports = router;