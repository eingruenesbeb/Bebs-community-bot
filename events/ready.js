// const fs = require('node:fs') // Uncomment, when you want to send special one-time messages.
const data = require('../database-setup.js')
const trust = require('../trust_system/trust-init.js')

module.exports = {
  name: 'ready',
  once: true,
  /**
  * Function to react, once the bot is successfully logged-in and ready to recieve data.
  * @param {Client} client - Contains information about the bots discord client and varios methods.
  */
  async execute (client) {
    await data.sequelize.sync()
    trust.trustOnInit(client) // Initializing Trust System
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
