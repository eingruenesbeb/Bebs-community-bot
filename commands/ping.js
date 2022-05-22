const { SlashCommandBuilder } = require('@discordjs/builders')

// Reaction to the command "/ping"
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Answeres Pong and tells the user, how long that took'),
  async execute (interaction) {
    // Block Bots, from using this command
    if (interaction.user.bot) return
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true })
    interaction.editReply(`Pong! <:peepoPong:962134752977096804>\nCurrent response delay: ${sent.createdTimestamp - interaction.createdTimestamp}ms`)
  }
}
