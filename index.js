require('dotenv').config();

const { SapphireClient, LogLevel } = require('@sapphire/framework');
const { GatewayIntentBits, Partials } = require('discord.js');
const path = require('path');

const client = new SapphireClient({
  logger: { level: LogLevel.Info },
  defaultPrefix: process.env.PREFIX || '!',
  loadMessageCommandListeners: true, // enable prefix (message) commands
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel] // needed to receive DMs
});

// Tell Sapphire where your commands are
client.stores.get('commands').registerPath(path.join(__dirname, 'commands'));

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error('Login failed:', err);
});
