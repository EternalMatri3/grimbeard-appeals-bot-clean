// listeners/guildAppeal.js
const { Listener } = require('@sapphire/framework');
const {
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = class GuildAppealListener extends Listener {
  constructor(ctx, opts) { super(ctx, { ...opts, event: Events.MessageCreate }); }

  async run(message) {
    // Only handle guild messages from humans
    if (!message.guild || message.author.bot) return;

    const prefix = process.env.PREFIX || '!';
    const appealsGuildId   = process.env.APPEALS_GUILD_ID;   // the Appeals **server** ID
    const appealsChannelId = process.env.APPEALS_CHANNEL_ID; // the specific channel ID

    // Enforce server + channel
    if (appealsGuildId && message.guild.id !== appealsGuildId) return;
    if (appealsChannelId && message.channel.id !== appealsChannelId) return;

    // Must start with !appeal
    const cmd = `${prefix}appeal`;
    if (!message.content.toLowerCase().startsWith(cmd)) return;

    const reason = message.content.slice(cmd.length).trim();
    if (!reason) {
      return message.reply(`Include your reason, e.g. \`${prefix}appeal I'm sorry because...\``);
    }

    // Staff channel in your **main** server
    const staffChannelId = process.env.STAFF_CHANNEL_ID;
    const staffChannel = await this.container.client.channels.fetch(staffChannelId).catch(() => null);
    if (!staffChannel) {
      return message.reply('Staff channel is not configured or I cannot see it.');
    }

    // Build the appeal embed + buttons
    const embed = new EmbedBuilder()
      .setTitle('🆕 New Ban Appeal')
      .addFields(
        { name: 'User', value: `${message.author} (${message.author.id})`, inline: true },
        { name: 'Submitted', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true },
        { name: 'Appeal', value: reason.slice(0, 4000) }
      )
      .setColor(0x2b2d31);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`appeal:approve:${message.author.id}`).setLabel('Approve').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`appeal:deny:${message.author.id}`).setLabel('Deny').setStyle(ButtonStyle.Danger)
    );

    await staffChannel.send({ embeds: [embed], components: [row] });
    return message.reply('✅ Your appeal has been sent to the staff team.');
  }
};
