const trust = require('../trust_system/trust-react.js')

/**
 * @module
 * @description This module handles the response to a member being updated in a guild.
*/

module.exports = {
  /** The name of the event to listen to */
  name: 'guildMemberUpdate',
  /** whether or not this event should be reacted to only once */
  once: false,
  /**
  * Function to react, when a member was being updated on a guild.
  * @param {GuildMember} oldMember - Contains information about the guild member before the update and some means to respond.
  * @param {GuildMember} newMember - Contains information about the guild member after the update and some means to respond.
  * @async
  */
  async execute (newMember, oldMember) {
    console.log('Event guildMemberUpdate fired.')
    newMember = await newMember.fetch(true)
    if (newMember.user.bot) return // Don't react, when the member is a bot
    trust.trustReactTimeout(newMember) // Apply Trust-System
  }
}
