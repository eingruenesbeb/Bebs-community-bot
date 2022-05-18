const trust = require('../trust_system/trust-react.js')

module.exports = {
  name: 'voiceStateUpdate',
  once: false,
  async execute (oldState, newState) {
    const blockedUsers = ['962154925255708683']
    if (blockedUsers.includes(newState.member.id)) return
    console.log(`The voice state of ${newState.member.user.tag} in ${newState.guild.name} changed.`)
    console.log(`Channel: ${oldState.channel} -> ${newState.channel}`)
    trust.trustReactVoiceState(oldState, newState)
  }
}
