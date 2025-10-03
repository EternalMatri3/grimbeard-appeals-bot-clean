// listeners/appealListener.js
const { Listener } = require('@sapphire/framework');
const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits
} = require('discord.js');

module.exports = class AppealListener extends Listener {
  constructor(context, options) {
    super(context, { ...options, event: Events.InteractionCreate });
  }

  async run(interaction) {
    // === BUTTON CLICK (Approve / Decline) ===
    if (interaction.isButton() && interaction.customId.startsWith('appeal:')) {
      const [_, action, targetId] = interaction.customId.split(':'); // e.g. "appeal:approve:123"

      // Staff check
      const isStaff =
        interaction.member?.permissions.has(PermissionFlagsBits.BanMembers) ||
        interaction.member?.permissions.has(PermissionFlagsBits.ManageGuild);

      if (!isStaff) {
        return interaction.reply({
          content: 'You don’t have permission to decide appeals.',
          ephemeral: true
        });
      }

      // Build a modal to capture the reason
      const originMsgId = interaction.message?.id ?? 'unknown';
      const modal = new ModalBuilder()
        .setCustomId(`appeal_reason:${action}:${targetId}:${originMsgId}`)
        .setTitle(`${action === 'approve' ? 'Approve' : 'Decline'} Appeal`);

      const reasonInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Reason (will be logged/DM’d)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
      return interaction.showModal(modal);
    }

    // === MODAL SUBMIT (Reason entered) ===
    if (interaction.isModalSubmit() && interaction.customId.startsWith('appeal_reason:')) {
      const [_, action, targetId, originMsgId] = interaction.customId.split(':');
      const reason = interaction.fields.getTextInputValue('reason');
      const outcome = action === 'approve' ? 'APPROVED ✅' : 'DECLINED ❌';

      // Disable buttons on the original message (if we can find it)
      try {
        if (originMsgId && originMsgId !== 'unknown') {
          const msg = await interaction.channel.messages.fetch(originMsgId);
          if (msg?.components?.length) {
            const disabledRow = new ActionRowBuilder().addComponents(
              ...msg.components[0].components.map((c) =>
                ButtonBuilder.from(c).setDisabled(true)
              )
            );
            await msg.edit({ components: [disabledRow] });
          }
        }
      } catch {
        // ignore if message fetch/edit fails
      }

      // Optional: actually unban when approved
      // if (action === 'approve') {
      //   try { await interaction.guild.bans.remove(targetId, `Appeal approved: ${reason}`); } catch {}
      // }

      // Public log in channel
      await interaction.reply({
        content: `Appeal for <@${targetId}> **${outcome}** by <@${interaction.user.id}>\n**Reason:** ${reason}`,
        ephemeral: false
      });

      // Best-effort DM to applicant
      try {
        const user = await interaction.client.users.fetch(targetId);
        await user.send(`Your appeal was **${outcome}**.\nReason: ${reason}`);
      } catch {
        // user DMs closed, ignore
      }
    }
  }
};