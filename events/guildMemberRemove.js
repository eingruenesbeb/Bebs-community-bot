const trust = require('../trust_system/trust-react.js')

module.exports = {
  name: 'guildMemberRemove',
  once: false,
  /**
  * Function to react, when a member has left a guild.
  * @param {GuildMember} member - Contains information about the member, that left, and some means to respond.
  */
  async execute (member) {
    console.log('Event guildMemberRemove fired.')
    if (member.user.bot) return // Don't react, when the member is a bot
    console.log(`${member.user.tag} left ${member.guild.name}.`)
    trust.trustReactKick(member) // Apply Trust-System
  }
}
