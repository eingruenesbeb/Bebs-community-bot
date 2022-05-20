const trust = require('../trust_system/trust-react.js')

module.exports = {
  name: 'messageDelete',
  once: false,
  async execute (message) {
    const blockedUsers = ['962154925255708683', '976987486289018880']
    if (blockedUsers.includes(message.author.id)) return
    console.log(`Message from ${message.author.username} was deleted on ${message.guild} in channel ${message.channel}, with content: "${message.content}"`)
    trust.trustReactMessageDelete(message)
  }
}
