const fs = require('node:fs')
const data = require('../database-setup.js')
const trust = require('../trust_system/trust-init.js')

module.exports = {
  name: 'ready',
  once: true,
  async execute (client) {
    await data.sequelize.sync()
    // Initializing Trust System:
    trust.trustOnInit(client)
    console.log(`Ready! Logged in as ${client.user.tag}`)
    client.user.setActivity('Sowas wie eine Selbstfindungsphase für Bots...', { type: 'WATCHING' })

    // Uncomment the next block, to send ALL embeds in '../embeds'
    /*
    const embedFiles = fs.readdirSync('../embeds').filter(file => file.endsWith('.js'))
    for (const file of embedFiles) {
      const { embed, channel} = require(`./events/${file}`)
      channel.send(embed)
    }
    */
  }
}
