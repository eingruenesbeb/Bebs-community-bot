const trust = require('../trust_system/trust-react.js')

/**
 * @module
 * @description This module handles the response to, when any setting of any user in a voice chat in a guild is changed.
*/

module.exports = {
  /** The name of the event to listen to */
  name: 'voiceStateUpdate',
  /** whether or not this event should be reacted to only once */
  once: false,
  /**
  * Function to react, when user does anything in a voice channel exept for speaking.
  * @param {VoiceState} oldState - Contains information about the old VoiceState and some methods.
  * @param {VoiceState} newState - Contains information about the new VoiceState and some methods.
  * @async
  */
  async execute (oldState, newState) {
    if (newState.member.user.bot) return // Don't react, when the user is a bot
    console.log(`The voice state of ${newState.member.user.tag} in ${newState.guild.name} changed.`)
    console.log(`Channel: ${oldState.channel} -> ${newState.channel}`)
    trust.trustReactVoiceState(oldState, newState) // Apply Trust-System
  }
}
