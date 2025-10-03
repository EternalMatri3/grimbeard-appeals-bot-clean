const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('appealpost')
    .setDescription('Post a ban-appeal card with Approve/Decline buttons.')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User who appealed').setRequired(true))
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Appeal text/reason').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const appealText = interaction.options.getString('reason');

    if (typeof interaction.client.sendAppealCard !== 'function') {
      return interaction.reply({ content: 'Appeal helper not available.', ephemeral: true });
    }

    await interaction.client.sendAppealCard(interaction.guild, user.id, appealText);
    return interaction.reply({ content: 'Appeal card posted to the staff channel.', ephemeral: true });
  }
};