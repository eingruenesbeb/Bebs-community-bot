const trust = require('../trust_system/trust-react.js')

/** 
 * @module 
 * @description This module handles the response to, when a message was deleted in a guild.
*/

module.exports = {
  /** The name of the event to listen to */
  name: 'messageDelete',
  /** whether or not this event should be reacted to only once */
  once: false,
  /**
  * Function to react, when a message was deleted in one of the guilds the bot is in.
  * @param {Message} message - Contains information about the message and some means to respond.
  * @async
  */
  async execute (message) {
    if (message.author.bot) return // Don't react, when the user is a bot
    console.log(`Message from ${message.author.username} was deleted on ${message.guild} in channel ${message.channel}, with content: "${message.content}"`)
    trust.trustReactMessageDelete(message)
  }
}
