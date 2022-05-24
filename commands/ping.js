const { SlashCommandBuilder } = require('@discordjs/builders')

/** 
 * @module 
 * @description This module handles the registration of and response to the /ping command.
*/

// Reaction to the command "/ping"
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Answeres Pong and tells the user, how long that took'),
  /**
   * Executed, when "ping" shlash command was issued. Answers with the amount of time needed for a response.
   * 
   * @param {CommandInteraction} interaction - Contains information about the command issued and the means to respond appropiatly.
   * @async
   */
  async execute (interaction) {
    // Block Bots, from using this command
    if (interaction.user.bot) return
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true })
    interaction.editReply(`Pong! <:peepoPong:962134752977096804>\nCurrent response delay: ${sent.createdTimestamp - interaction.createdTimestamp}ms`)
  }
}
