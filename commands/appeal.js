// commands/appeal.js
const { Command } = require('@sapphire/framework');
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = class AppealCommand extends Command {
  constructor(ctx, opts) { super(ctx, { ...opts, name: 'appeal' }); }

  registerApplicationCommands(registry) {
    const b = new SlashCommandBuilder()
      .setName('appeal')
      .setDescription('Submit a ban appeal to the staff team')
      .addStringOption(o =>
        o.setName('reason')
         .setDescription('Why should the ban be reconsidered?')
         .setRequired(true));

    // Register the command **only** in the Appeals server for instant availability
    if (process.env.APPEALS_GUILD_ID) {
      registry.registerChatInputCommand(b, { guildIds: [process.env.APPEALS_GUILD_ID] });
    } else {
      registry.registerChatInputCommand(b); // global fallback (can be slow)
    }
  }

  async chatInputRun(interaction) {
    const reason = interaction.options.getString('reason', true);

    const staffChannelId = process.env.STAFF_CHANNEL_ID;
    const staffChannel = await this.container.client.channels.fetch(staffChannelId).catch(() => null);
    if (!staffChannel) {
      return interaction.reply({ content: 'Staff channel not configured.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🆕 New Ban Appeal')
      .addFields(
        { name: 'User', value: `${interaction.user} (${interaction.user.id})`, inline: true },
        { name: 'Submitted', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true },
        { name: 'Appeal', value: reason.slice(0, 4000) }
      )
      .setColor(0x2b2d31);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`appeal:approve:${interaction.user.id}`).setLabel('Approve').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`appeal:deny:${interaction.user.id}`).setLabel('Deny').setStyle(ButtonStyle.Danger)
    );

    await staffChannel.send({ embeds: [embed], components: [row] });

    return interaction.reply({
      content: '✅ Your appeal has been sent to the staff team. You’ll be DM’d if approved.',
      ephemeral: true
    });
  }
};
