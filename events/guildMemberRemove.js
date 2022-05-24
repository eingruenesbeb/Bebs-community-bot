const trust = require('../trust_system/trust-react.js')

/** 
 * @module 
 * @description This module handles the response to a member being removed from a guild.
*/

module.exports = {
  /** The name of the event to listen to */
  name: 'guildMemberRemove',
  /** whether or not this event should be reacted to only once */
  once: false,
  /**
   * Function to react, when a member has left a guild.
   *
   * @param {GuildMember} member - Contains information about the member, that left, and some means to respond.
   * @async
   */
  async execute (member) {
    console.log('Event guildMemberRemove fired.')
    if (member.user.bot) return // Don't react, when the member is a bot
    console.log(`${member.user.tag} left ${member.guild.name}.`)
    trust.trustReactKick(member) // Apply Trust-System
  }
}
