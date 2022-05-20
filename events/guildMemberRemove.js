const trust = require('../trust_system/trust-react.js')

module.exports = {
  name: 'guildMemberRemove',
  once: false,
  async execute (member) {
    console.log('Event guildMemberRemove fired.')
    const blockedUsers = ['962154925255708683', '976987486289018880']
    if (blockedUsers.includes(member.id)) return
    console.log(`${member.user.tag} left ${member.guild.name}.`)
    trust.trustReactKick(member)
  }
}
