const trust = require('../trust_system/trust-react.js')

module.exports = {
  name: 'guildMemberUpdate',
  once: false,
  async execute (newMember, oldMember) {
    console.log('Event guildMemberUpdate fired.')
    const blockedUsers = ['962154925255708683', '976987486289018880']
    if (blockedUsers.includes(newMember.id)) return

    trust.trustReactTimeout(newMember, oldMember)
  }
}
