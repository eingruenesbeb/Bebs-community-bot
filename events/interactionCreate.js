module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute (interaction) {
    const blockedUsers = ['962154925255708683', '976987486289018880']
    if (blockedUsers.includes(interaction.user.id)) return
    if (interaction.isButton()) {
      // Listen here, for all the buttons, you have on your embeds and custom messages. 
      console.log('Jemand hat einen Knopf gedrückt.')
      // Example:
      if (interaction.customId === 'Regeln akzeptiert') {
        if (!interaction.member.roles.cache.some(role => role.name === 'Check-in vollständig ✔️')) {
          console.log('Jemand hat die Regeln akzeptiert.')
          await interaction.member.roles.add('963449550960463932')
          interaction.reply({ content: '✅ Check-In erfolgreich', ephemeral: true })
        } else {
          console.log('Da drückt jemand gerne Knöpfe...')
          await interaction.reply({ content: '❗ Error: Du hast doch schon die Regeln akzeptiert!', ephemeral: true })
        }
      }
    }
  }
}
