const trust = require('../trust_system/trust-react.js')

module.exports = {
  name: 'guildBanAdd',
  once: false,
  /**
  * Function to react, when a member was being banned on a guild.
  * @param {GuildBan} ban - Contains information about the ban and some means to respond.
  */
  async execute (ban) {
    if (ban.member.user.bot) return // Don't react, if the banned user was a bot
    console.log('Event guildAddBan fired.')
    console.log(`${ban.user.tag} was banned on ${ban.guild.name}.`)
    trust.trustReactBan(ban) // Apply Trust-System
  }
}
