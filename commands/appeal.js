const { Command } = require('@sapphire/framework');
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = class AppealCommand extends Command {
  registerApplicationCommands(registry) {
    const builder = new SlashCommandBuilder()
      .setName('appeal')
      .setDescription('Submit a ban appeal (sends to staff channel)')
      .addStringOption(opt =>
        opt.setName('reason')
          .setDescription('Why should staff reconsider your ban?')
          .setRequired(true));

    if (process.env.GUILD_ID) {
      registry.registerChatInputCommand(builder, { guildIds: [process.env.GUILD_ID] });
    } else {
      registry.registerChatInputCommand(builder);
    }
  }

  async chatInputRun(interaction) {
    const appealText = interaction.options.getString('reason', true);
    const staffChannel = interaction.guild.channels.cache.get(process.env.STAFF_CHANNEL_ID);

    if (!staffChannel) {
      return interaction.reply({ content: '❌ Staff channel not found!', ephemeral: true });
    }

    // Build buttons
    const approveBtn = new ButtonBuilder()
      .setCustomId(`appeal:approve:${interaction.user.id}`)
      .setLabel('Approve')
      .setStyle(ButtonStyle.Success);

    const declineBtn = new ButtonBuilder()
      .setCustomId(`appeal:decline:${interaction.user.id}`)
      .setLabel('Decline')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(approveBtn, declineBtn);

    // Send to staff channel
    await staffChannel.send({
      content: `**Ban Appeal** submitted by <@${interaction.user.id}>\n> ${appealText}`,
      components: [row]
    });

    // Confirm to the user
    return interaction.reply({ content: '✅ Your appeal has been submitted to staff.', ephemeral: true });
  }
};

registerApplicationCommands(registry) {
  const builder = new SlashCommandBuilder()
    .setName('appeal')
    .setDescription('Submit a ban appeal (sends to staff channel)')
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Why should staff reconsider your ban?')
        .setRequired(true));

  if (process.env.GUILD_ID) {
    console.log(`[SlashCmd] Registering /appeal to guild ${process.env.GUILD_ID}`);
    registry.registerChatInputCommand(builder, { guildIds: [process.env.GUILD_ID] });
  } else {
    console.log('[SlashCmd] Registering /appeal globally (may take up to 1h)');
    registry.registerChatInputCommand(builder);
  }
}
