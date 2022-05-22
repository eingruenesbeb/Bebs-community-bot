const trust = require('../trust_system/trust-react.js')

module.exports = {
  name: 'voiceStateUpdate',
  once: false,
  /**
  * Function to react, when user does anything in a voice channel exept for speaking.
  * @param {VoiceState} oldState - Contains information about the old VoiceState and some methods.
  * @param {VoiceState} newState - Contains information about the new VoiceState and some methods.
  */
  async execute (oldState, newState) {
    if (newState.member.user.bot) return // Don't react, when the user is a bot
    console.log(`The voice state of ${newState.member.user.tag} in ${newState.guild.name} changed.`)
    console.log(`Channel: ${oldState.channel} -> ${newState.channel}`)
    trust.trustReactVoiceState(oldState, newState) // Apply Trust-System
  }
}
