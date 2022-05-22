const trust = require('../trust_system/trust-react.js')

module.exports = {
  name: 'messageCreate',
  once: false,
  /**
  * Function to react, when a message was sent in one of the guilds the bot is in.
  * @param {Message} message - Contains information about the message and some means to respond.
  */
  async execute (message) {
    if (message.author.bot) return // Don't react, when the user is a bot
    console.log(`Message detected from ${message.author.username} on ${message.guild} in channel ${message.channel}, with content: "${message.content}"`)
    trust.trustReactMessagePosted(message) // Apply Trust-System
  }
}
