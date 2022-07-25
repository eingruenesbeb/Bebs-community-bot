const fs = require('node:fs')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v10')
const { clientId, guildId, token } = require('../config.json')

const commands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

const rest = new REST({ version: '10' }).setToken(token)
try {
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON())
  }

  rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error)
} catch (e) {
  console.log(e)
}
