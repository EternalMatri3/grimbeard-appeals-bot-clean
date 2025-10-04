const { Listener } = require('@sapphire/framework');
const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const COOLDOWN_MS = 60_000;
const lastAppeal = new Map();

module.exports = class DMAppealListener extends Listener {
  constructor(ctx, opts) { super(ctx, { ...opts, event: Events.MessageCreate }); }

  async run(message) {
    // Only DMs and non-bot
    if (message.guild || message.author.bot) return;

    const prefix = process.env.PREFIX || '!';
    const cmd = `${prefix}appeal`;
    if (!message.content.toLowerCase().startsWith(cmd)) return;

    const now = Date.now();
    if ((now - (lastAppeal.get(message.author.id) || 0)) < COOLDOWN_MS) {
      return message.reply('Please wait a bit before sending another appeal.');
    }
    lastAppeal.set(message.author.id, now);

    const appealText = message.content.slice(cmd.length).trim();
    if (!appealText) {
      return message.reply(`Include your reason, e.g. \`${prefix}appeal I’m sorry because...\``);
    }

    const channelId = process.env.APPEALS_CHANNEL_ID;
    const channel = await this.container.client.channels.fetch(channelId).catch(() => null);
    if (!channel) return message.reply('Appeals channel not set or not visible to me.');

    const embed = new EmbedBuilder()
      .setTitle('🆕 New Ban Appeal')
      .addFields(
        { name: 'User', value: `${message.author} (${message.author.id})`, inline: true },
        { name: 'Submitted', value: `<t:${Math.floor(now/1000)}:F>`, inline: true },
        { name: 'Appeal', value: appealText.slice(0, 4000) }
      )
      .setColor(0x2b2d31);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`appeal:approve:${message.author.id}`).setLabel('Approve').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`appeal:deny:${message.author.id}`).setLabel('Deny').setStyle(ButtonStyle.Danger)
    );

    await channel.send({ embeds: [embed], components: [row] });
    return message.reply('✅ Your appeal was submitted to the staff team.');
  }
};
