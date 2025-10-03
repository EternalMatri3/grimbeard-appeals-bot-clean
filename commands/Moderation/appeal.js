const { Command } = require('@sapphire/framework');
const { EmbedBuilder } = require('discord.js');

module.exports = class AppealCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'appeal',
      description: 'Submit a ban appeal (use this in DMs with the bot).',
      preconditions: ['DMOnly'] // only works in DMs
    });
  }

  async messageRun(message, args) {
    const appealText = await args.rest('string').catch(() => null);

    if (!appealText || appealText.trim().length < 10) {
      return message.reply(
        'Please include your appeal reason with some detail (min ~10 characters).\n' +
        `Example: \`${process.env.PREFIX || '!'}appeal I think my ban was a misunderstanding because...\``
      );
    }

    const staffChannelId = process.env.STAFF_CHANNEL_ID;

    const staffChannel =
      this.container.client.channels.cache.get(staffChannelId) ||
      (await this.container.client.channels.fetch(staffChannelId).catch(() => null));

    if (!staffChannel) {
      return message.reply('Sorry — appeals are temporarily unavailable. Please try again later.');
    }

    const embed = new EmbedBuilder()
      .setTitle('📝 New Ban Appeal')
      .setColor(0xF1C40F)
      .addFields(
        { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
        { name: 'Submitted', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        { name: 'Appeal', value: trimTo(appealText, 4096) }
      );

    if (message.attachments.size) {
      const urls = [...message.attachments.values()].map(a => a.url).join('\n');
      embed.addFields({ name: 'Attachments', value: trimTo(urls, 1024) });
    }

    await staffChannel.send({ embeds: [embed] });
    await message.reply('✅ Thanks — your appeal was submitted. Moderators will review it and may DM you for more info.');
  }
};

function trimTo(str, max) {
  return str.length > max ? `${str.slice(0, max - 3)}...` : str;
}
