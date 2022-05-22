module.exports = {
  name: 'interactionCreate',
  once: false,
  /**
  * Function to react, when some interaction with interactive elements, that is not a command, happens.
  * @param {Interaction} member - Contains information about the interaction and some means to respond.
  */
  async execute (interaction) {
    if (interaction.member.user.bot) return // Don't react, when the member is a bot
    if (interaction.isButton()) {
      // Listen here, for all the buttons, you have on your embeds and custom messages.
      // Example:
      if (interaction.customId === 'Regeln akzeptiert') {
        if (!interaction.member.roles.cache.some(role => role.name === 'Check-in vollständig ✔️')) {
          console.log('Jemand hat die Regeln akzeptiert.')
          await interaction.member.roles.add('963449550960463932')
          interaction.reply({ content: '✅ Check-In erfolgreich', ephemeral: true })
        } else {
          await interaction.reply({ content: '❗ Error: Du hast doch schon die Regeln akzeptiert!', ephemeral: true })
        }
      }
    }
  }
}
