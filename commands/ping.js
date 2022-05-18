const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Antwortet mit Pong und gibt an, wie lange das gebraucht hat.'),
  async execute (interaction) {
    const blockedUsers = ['962154925255708683']
    if (blockedUsers.includes(interaction.user.id)) return
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true })
    interaction.editReply(`Pong! <:peepoPong:962134752977096804>\nAktuelle Bearbeitungszeit: ${sent.createdTimestamp - interaction.createdTimestamp}ms`)
  }
}
