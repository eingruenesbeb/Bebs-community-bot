const data = require('../database-setup.js')
const { TrustRolesHelper, attachTrustProperties } = require('./trust-helpers')

/**
 * Used to initialize the Trust-System on boot, by adding and reading data to and from the database.
 *
 * @module
*/

const TrustGuildData = data.TrustGuildData
const TrustRoleData = data.TrustRoleData

module.exports = {
  /**
   * This function:
   * - Adds all the guilds the bot joined while not online into the database
   * - Loads all the Trust-Roles from the database to the corresponding cache.
   *
   * @param {Client} client The client, the bot is logged in with.
   * @async
   */
  async trustOnInit (client) {
    const botGuilds = Array.from((await client.guilds.fetch()).keys()) // List of all guild-ids the bot is in
    for (const botGuild of botGuilds) {
      console.log(`Initializing Trust System for ID: ${botGuild}`)
      try {
        await TrustGuildData.create({
          guildid: botGuild,
          guild_enabled: false,
          karma_message: 1,
          karma_vcminute: 5,
          karma_message_del: -2,
          karma_time_out: -25,
          karma_kick: -100,
          karma_ban: -1000
        }) // This also determines the default values for guilds.

        console.log(`Guild ${botGuild} sucessfully added into trust system database.`)
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          // Executes, if the guild is already in the database, because the guild-id is the primary key and unique.
          console.log('This server is already in the trust system data base.')
        } else console.error('Something went wrong with adding a tag.')
      }

      // Add the roles, that should be managed by the Trust-System, for that guild to the corresponding cache.
      const guildRoles = await TrustRoleData.findAll({ where: { guild_id: botGuild }, raw: true })
      if (guildRoles) {
        for (const guildRole of guildRoles) {
          const guildRoleMod = attachTrustProperties(client.guilds.cache.get(guildRole.guild_id).roles.cache.get(guildRole.role_id), guildRole.threshhold, guildRole.manual === 1, guildRole.inverted === 1)
          TrustRolesHelper.manage(guildRoleMod)
        }
      }
    }
  }
}
