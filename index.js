// index.js
require('dotenv').config({ override: true });
const { SapphireClient, LogLevel } = require('@sapphire/framework');
const { GatewayIntentBits, Partials } = require('discord.js');
const path = require('path');

const client = new SapphireClient({
  logger: { level: LogLevel.Info },
  intents: [
    GatewayIntentBits.Guilds,            // core guild events
    GatewayIntentBits.GuildMessages,     // read messages in guild channels (for !appeal)
    GatewayIntentBits.DirectMessages,    // read DMs (for DM appeals)
    GatewayIntentBits.MessageContent,    // read message content (required for !appeal)
    GatewayIntentBits.GuildModeration    // fetch/unban via Approve button
  ],
  partials: [Partials.Channel]           // required to receive DMs
});

// load commands & listeners folders
client.stores.get('commands').registerPath(path.join(__dirname, 'commands'));
client.stores.get('listeners').registerPath(path.join(__dirname, 'listeners'));

client.once('clientReady', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('Login failed:', err);
});
