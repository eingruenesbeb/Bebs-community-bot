const data = require('../database-setup.js')
const { TrustRolesHelper, attachTrustProperties } = require('./trust-helpers')

const TrustGuildData = data.TrustGuildData
const TrustRoleData = data.TrustRoleData

module.exports = {
  async trustOnInit (client) {
    const botGuilds = Array.from((await client.guilds.fetch()).keys())
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
        })

        console.log(`Guild ${botGuild} sucessfully added into trust system database.`)
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.log('This server is already in the trust system data base.')
        } else console.error('Something went wrong with adding a tag.')
      }

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
