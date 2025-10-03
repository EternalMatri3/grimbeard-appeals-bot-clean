// commands/appealpost.js
const { Command } = require('@sapphire/framework');
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = class AppealPostCommand extends Command {
  constructor(context, options) {
    super(context, { ...options, name: 'appealpost' });
  }

  registerApplicationCommands(registry) {
    const builder = new SlashCommandBuilder()
      .setName('appealpost')
      .setDescription('Post a ban-appeal card with Approve/Decline buttons to the staff channel.')
      .addUserOption(opt =>
        opt.setName('user')
          .setDescription('User who appealed')
          .setRequired(true))
      .addStringOption(opt =>
        opt.setName('reason')
          .setDescription('Appeal text/reason')
          .setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

    if (process.env.GUILD_ID) {
      registry.registerChatInputCommand(builder, { guildIds: [process.env.GUILD_ID] });
    } else {
      registry.registerChatInputCommand(builder);
    }
  }

  async chatInputRun(interaction) {
    const applicant = interaction.options.getUser('user', true);
    const appealText = interaction.options.getString('reason', true);

    const channel = interaction.guild.channels.cache.get(process.env.STAFF_CHANNEL_ID);
    if (!channel) {
      return interaction.reply({
        content: '❌ STAFF_CHANNEL_ID missing or not visible to the bot.',
        ephemeral: true
      });
    }

    const approveBtn = new ButtonBuilder()
      .setCustomId(`appeal:approve:${applicant.id}`)
      .setLabel('Approve')
      .setStyle(ButtonStyle.Success);

    const declineBtn = new ButtonBuilder()
      .setCustomId(`appeal:decline:${applicant.id}`)
      .setLabel('Decline')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(approveBtn, declineBtn);

    await channel.send({
      content: `**Ban Appeal** from <@${applicant.id}>\n> ${appealText}`,
      components: [row]
    });

    return interaction.reply({
      content: '✅ Appeal card posted to the staff channel.',
      ephemeral: true
    });
  }
};
