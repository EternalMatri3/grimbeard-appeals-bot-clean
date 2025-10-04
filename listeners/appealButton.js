const { Listener } = require('@sapphire/framework');
const { Events, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = class AppealButtonsListener extends Listener {
  constructor(ctx, opts) { super(ctx, { ...opts, event: Events.InteractionCreate }); }

  async run(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('appeal:')) return;

    const [, action, userId] = interaction.customId.split(':');

    // Staff check
    const isStaff =
      interaction.member?.permissions.has(PermissionFlagsBits.BanMembers) ||
      interaction.member?.permissions.has(PermissionFlagsBits.ManageGuild);
    if (!isStaff) {
      return interaction.reply({ content: `You don't have permission to decide appeals.`, ephemeral: true });
    }

    // Disable buttons after decision
    let disabledRow;
    if (interaction.message.components?.[0]) {
      disabledRow = new ActionRowBuilder().addComponents(
        ...interaction.message.components[0].components.map(c => ButtonBuilder.from(c).setDisabled(true))
      );
    }

    if (action === 'approve') {
      await interaction.update({
        content: `✅ Appeal for <@${userId}> **APPROVED** by ${interaction.user}.`,
        components: disabledRow ? [disabledRow] : []
      });
      // Optional unban:
      // try { await interaction.guild.bans.remove(userId, 'Appeal approved'); } catch {}
      try { (await interaction.client.users.fetch(userId)).send('Your ban appeal has been **approved**.'); } catch {}
    } else {
      await interaction.update({
        content: `❌ Appeal for <@${userId}> **DENIED** by ${interaction.user}.`,
        components: disabledRow ? [disabledRow] : []
      });
      try { (await interaction.client.users.fetch(userId)).send('Your ban appeal has been **denied**.'); } catch {}
    }
  }
};
