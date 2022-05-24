// Require the necessary discord.js classes
const fs = require('node:fs')
const { Client, Collection, Intents } = require('discord.js')
const { token } = require('./config.json')
require('log-timestamp')

/**
 * The main module, that centralizes everything and gets everything rollin'.
 * 
 * @module
 */

/**
 * @constant client Creates a new client instance.
 * @type Client
 */
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_VOICE_STATES] })

/**
 * @constant eventFiles Saving event files as a collection
 */
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
  const event = require(`./events/${file}`)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    try {
      client.on(event.name, (...args) => event.execute(...args))
    } catch (error) {
      console.error(error)
    }
  }
}

// Command handling:
client.commands = new Collection()

/**
 * @constant commandFiles Saving command files as a collection
 */
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command)
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return

  const command = client.commands.get(interaction.commandName)

  if (!command) return

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
  }
})

// Login to Discord with your client's token
client.login(token)
