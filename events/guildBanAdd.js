const trust = require('../trust_system/trust-react.js')

module.exports = {
  name: 'guildBanAdd',
  once: false,
  async execute (ban) {
    console.log('Event guildAddBan fired.')
    console.log(`${ban.user.tag} was banned on ${ban.guild.name}.`)
    trust.trustReactBan(ban)
  }
}
