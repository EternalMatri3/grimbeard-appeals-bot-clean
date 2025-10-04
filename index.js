require('dotenv').config({ override: true });
const { SapphireClient, LogLevel } = require('@sapphire/framework');
const { GatewayIntentBits, Partials } = require('discord.js');
const path = require('path');

const client = new SapphireClient({
  logger: { level: LogLevel.Info },
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel] // required for DMs
});

client.stores.get('commands').registerPath(path.join(__dirname, 'commands')); // not used now
client.stores.get('listeners').registerPath(path.join(__dirname, 'listeners'));

client.once('clientReady', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('Login failed:', err);
});
