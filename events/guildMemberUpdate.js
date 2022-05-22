const trust = require('../trust_system/trust-react.js')

module.exports = {
  name: 'guildMemberUpdate',
  once: false,
  /**
  * Functionto react, when a member was being updated on a guild.
  * @param {GuildMember} oldMember - Contains information about the guild member before the update and some means to respond.
  * @param {GuildMember} newMember - Contains information about the guild member after the update and some means to respond.
  */
  async execute (newMember, oldMember) {
    console.log('Event guildMemberUpdate fired.')
    if (newMember.user.bot) return // Don't react, when the member is a bot
    trust.trustReactTimeout(newMember, oldMember) // Apply Trust-System
  }
}
