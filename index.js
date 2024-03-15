require('dotenv').config();
require('./strategies/discordstrategy');

//All The Discord Stuff
const Discord = require('discord.js');
const bot = new Discord.Client({ intents: ["Guilds","GuildMembers","GuildBans","GuildEmojisAndStickers","GuildIntegrations","GuildWebhooks","GuildInvites","GuildVoiceStates","GuildPresences","GuildMessages","GuildMessageReactions","GuildMessageTyping","DirectMessages","DirectMessageReactions","DirectMessageTyping","MessageContent","GuildScheduledEvents","AutoModerationConfiguration","AutoModerationExecution"] });

bot.invites = new Discord.Collection();
bot.commands = new Discord.Collection();
bot.events = new Discord.Collection();

bot.on('message', async(message) => {
    message.channel.send("Testing");
});

['command_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(bot, Discord)
});

//Website And Discord
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

//WebsiteStuff
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const db = require('./database/database');
const path = require('path');
const app = express();

db.then(() => console.log('Connected to MongoDB.')).catch(err => console.log(err));

//RenderRunning

app.use(session({
    secret: 'Discord Login Cookie',
    cookie: {
        maxAge: 60000 * 60
    },
    saveUninitialized: false,
    resave: false,
    name: 'discord.oauth2',
    store: new MongoStore({ mongooseConnection:  mongoose.connection })
}));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoute = require('./routes/auth');
const dashboardRoute = require('./routes/dashboard');
const applicationRoute = require('./routes/apply');

// Middleware Routes
app.use('/auth', authRoute);
app.use('/dashboard', dashboardRoute);
app.use('/applications', applicationRoute);

app.get('/', (req,res) => {
    res.render('index');
});

app.get('/apply', (req,res) => {
    res.render('apply');
})

app.get('*', function(req, res) {
    res.render('errorpage');
});

function isAuthorized(req, res, next) {
    if(req.user) { //User is logged in
        res.redirect('/dashboard');
    }
    else {
        next();
    }
}

//Listeners for both discord and website
app.listen(process.env.PORT || 5000);
bot.login(process.env.DISCORD_TOKEN);