const fetch = require('node-fetch');
const fs = require("fs");
const router = require('express').Router();
const Discord = require('discord.js');
const newApplicationWebHook = new Discord.WebhookClient({ url: process.env.APPLICATIONWEBHOOK });

router.post('/send', async function(req, res, next){
    var ApplicantInfo = {};

    await fetch(`https://api.roblox.com/users/get-by-username?username=${req.body.RobloxInfo}`, { method: "Get" }).then(PlrInfo => PlrInfo.json()).then((json) => {
        ApplicantInfo = json.Id;
    });

    await fetch(`https://users.roblox.com/v1/users/${ApplicantInfo}`, { method: "Get" }).then(PlrInfo => PlrInfo.json()).then((json) => {
        ApplicantInfo = json;
    });
    
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
                title: "**Player Applied!**",
                description: `***${ApplicantInfo.name}*** Has Sent An Application On **${("0" + (newDate.getMonth() + 1)).slice(-2) + "/" + ("0" + newDate.getDate()).slice(-2) + "/" + (newDate.getFullYear() - 2000)}** At **${((hours % 12) || 12) + (hours >= 12 ? ' PM' : ' AM')}**.`,
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
                        name: "**What Is Your Discord UserName And Tag?**",
                        value: req.body.DiscordInfo,
                        inline: false,
                    },
                    {
                        name: "**Why Should We Choose YOU For A Staff Member?**",
                        value: req.body.ChooseYou,
                        inline: false,
                    },
                    {
                        name: "**What Inspired You To Work For Us?**",
                        value: req.body.Inpiration,
                        inline: false,
                    },
                    {
                        name: "**How Much Experience Do You Have For This Role?**",
                        value: req.body.Experience,
                        inline: false,
                    },
                    {
                        name: "**Is The Customer Always Right?**",
                        value: req.body.IsTheCustomer,
                        inline: false,
                    },
                    {
                        name: "**Did You Answer Everything Truthfully?**",
                        value: req.body.Verify,
                        inline: false,
                    },
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

    newApplicationWebHook.send(webhook);

    let newData = {
        DiscordInfo: req.body.DiscordInfo,
        Roblox: ApplicantInfo.name,
        UserId: ApplicantInfo.id,
        ChooseYou: req.body.ChooseYou,
        Inpiration: req.body.Inpiration,
        Experience: req.body.Experience,
        IsTheCustomer: req.body.IsTheCustomer,
    }

    if (!fs.existsSync('Data.json')) {
        fs.closeSync(fs.openSync('Data.json', 'w'));
    }

    const data = fs.readFileSync('Data.json');

    if (data.length == 0) {
        fs.writeFileSync("Data.json", JSON.stringify([newData]), err => { if(err) throw err });
    } else {
        const json = JSON.parse(data.toString())
        json.push(newData);
        fs.writeFileSync("Data.json", JSON.stringify(json), err => { if(err) throw err });
    }

    res.redirect('/apply');
});

module.exports = router;