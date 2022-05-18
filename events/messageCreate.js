const trust = require('../trust_system/trust-react.js')

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute (message) {
    const blockedUsers = ['962154925255708683']
    if (blockedUsers.includes(message.author.id)) return
    console.log(`Message detected from ${message.author.username} on ${message.guild} in channel ${message.channel}, with content: "${message.content}"`)
    trust.trustReactMessagePosted(message)
  }
}
