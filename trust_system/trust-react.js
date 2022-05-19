const data = require('../database-setup')

const { TrustVoiceHelper, TrustRolesHelper } = require('./trust-helpers')

const TrustUserData = data.TrustUserData
const TrustGuildData = data.TrustGuildData

module.exports = {
  async trustReactMessagePosted (message) {
    if (!message.guild) return
    const guildTrust = await TrustGuildData.findOne({ where: { guildid: message.guildId } })
    if (guildTrust.guild_enabled === 1) {
      const [guildUser, created] = await TrustUserData.findOrCreate({
        where: { guild_user_id: message.guildId + '|' + message.author.id },
        defaults: {
          guild_user_id: message.guildId + '|' + message.author.id,
          user_enabled: true,
          karma: 0
        }
      })
      if (created) {
        console.log(`Added ${guildUser} to the trust database.`)
      }
      if (guildUser.user_enabled === 1) {
        await TrustUserData.update({ karma: guildUser.karma + guildTrust.karma_message }, { where: { guild_user_id: message.guildId + '|' + message.author.id } })
        TrustRolesHelper.apply(message.member, guildUser.karma + guildTrust.karma_message)
        console.log(`The karma for ${message.author.id} in ${message.guildId} is now ${guildUser.karma + guildTrust.karma_message}. Reason: Posted message`)
      }
    }
  },
  async trustReactMessageDelete (message) {
    if (!message.guild) return
    const guildTrust = await TrustGuildData.findOne({ where: { guildid: message.guildId } })
    if (guildTrust.guild_enabled === 1) {
      const [guildUser, created] = await TrustUserData.findOrCreate({
        where: { guild_user_id: message.guildId + '|' + message.author.id },
        defaults: {
          guild_user_id: message.guildId + '|' + message.author.id,
          user_enabled: true,
          karma: 0
        }
      })
      if (created) {
        console.log(`Added ${guildUser} to the trust database.`)
      }
      const fetchedLogs = await message.guild.fetchAuditLogs({
        limit: 1,
        type: 'MESSAGE_DELETE'
      })

      const deletionLog = fetchedLogs.entries.first()

      if (!deletionLog) return console.log(`A message by ${message.author.tag} was deleted, but no relevant audit logs were found.`)

      const { executor, target } = deletionLog

      if (guildUser.user_enabled === 1 && target.id === message.author.id) {
        await TrustUserData.update({ karma: guildUser.karma + guildTrust.karma_message_del }, { where: { guild_user_id: message.guildId + '|' + message.author.id } })
        TrustRolesHelper.apply(message.member, guildUser.karma + guildTrust.karma_message_del)
        console.log(`The karma for ${message.author.id} in ${message.guildId} is now ${guildUser.karma + guildTrust.karma_message_del}. Reason: Message was deleted by "${executor.tag}".`)
      } else console.log('The message was either deleted by a bot (because, that sadly isn\'t be detectable), or the author itself, therefore the karma will not be modified.')
    }
  },
  async trustReactKick (member) {
    const guildTrust = await TrustGuildData.findOne({ where: { guildid: member.guild.id } })
    if (guildTrust.guild_enabled === 1) {
      const [guildUser, created] = await TrustUserData.findOrCreate({
        where: { guild_user_id: member.guild.id + '|' + member.id },
        defaults: {
          guild_user_id: member.guild.id + '|' + member.id,
          user_enabled: true,
          karma: 0
        }
      })
      if (created) {
        console.log(`Added ${guildUser} to the trust database.`)
      }
      const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_KICK'
      })

      const kickLog = fetchedLogs.entries.first()

      if (!kickLog) return console.log(`${member.user.tag} left the guild, most likely of their own will.`)

      const { executor, target } = kickLog

      if (guildUser.user_enabled === 1 && target.id === member.id) {
        await TrustUserData.update({ karma: guildUser.karma + guildTrust.karma_kick }, { where: { guild_user_id: member.guild.id + '|' + member.id } })
        console.log(`The karma for ${member.user.tag} in ${member.guild.name} is now ${guildUser.karma + guildTrust.karma_kick}. Reason: User was kicked out of the guild by "${executor.tag}".`)
      } else console.log(`${member.user.tag} left the guild, audit log fetch was inconclusive.`)
    }
  },
  async trustReactTimeout (newMember, oldMember) {
    if (oldMember.communicationDisabledUntilTimestamp === newMember.communicationDisabledUntilTimestamp) return
    const guildTrust = await TrustGuildData.findOne({ where: { guildid: newMember.guild.id } })
    if (guildTrust.guild_enabled === 1) {
      const [guildUser, created] = await TrustUserData.findOrCreate({
        where: { guild_user_id: newMember.guild.id + '|' + newMember.id },
        defaults: {
          guild_user_id: newMember.guild.id + '|' + newMember.id,
          user_enabled: true,
          karma: 0
        }
      })
      if (created) {
        console.log(`Added ${guildUser} to the trust database.`)
      }

      const timeOutLenght = Math.floor((newMember.communicationDisabledUntilTimestamp - oldMember.communicationDisabledUntilTimestamp) / 8640000) // Time-Out lenght in days (rounded down to the next integer)

      if (guildUser.user_enabled === 1) {
        await TrustUserData.update({ karma: guildUser.karma + guildTrust.karma_time_out }, { where: { guild_user_id: newMember.guild.id + '|' + newMember.id } })
        TrustRolesHelper.apply(newMember, guildUser.karma + guildTrust.karma_time_out + guildTrust.karma_time_out * timeOutLenght)
        console.log(`The karma for ${newMember.user.tag} in ${newMember.guild.name} is now ${guildUser.karma + guildTrust.karma_time_out + guildTrust.karma_time_out * timeOutLenght}. Reason: User was given a time-out for ${timeOutLenght} days.`)
      }
    }
  },
  async trustReactBan (ban) {
    const guildTrust = await TrustGuildData.findOne({ where: { guildid: ban.guild.id } })
    if (guildTrust.guild_enabled === 1) {
      const [guildUser, created] = await TrustUserData.findOrCreate({
        where: { guild_user_id: ban.guild.id + '|' + ban.user.id },
        defaults: {
          guild_user_id: ban.guild.id + '|' + ban.user.id,
          user_enabled: true,
          karma: 0
        }
      })
      if (created) {
        console.log(`Added ${guildUser} to the trust database.`)
      }

      if (guildUser.user_enabled === 1) {
        await TrustUserData.update({ karma: guildUser.karma + guildTrust.karma_ban }, { where: { guild_user_id: ban.guild.id + '|' + ban.user.id } })
        console.log(`The karma for ${ban.user.tag} in ${ban.guild.name} is now ${guildUser.karma + guildTrust.karma_ban}. Reason: User was banned from the guild.`)
      }
    }
  },
  async trustReactVoiceState (oldState, newState) {
    if (oldState.channel === newState.channel) return
    const guildTrust = await TrustGuildData.findOne({ where: { guildid: newState.guild.id } })
    if (guildTrust.guild_enabled === 1) {
      const [guildUser, created] = await TrustUserData.findOrCreate({
        where: { guild_user_id: newState.guild.id + '|' + newState.member.id },
        defaults: {
          guild_user_id: newState.guild.id + '|' + newState.member.id,
          user_enabled: true,
          karma: 0
        }
      })
      if (created) {
        console.log(`Added ${guildUser} to the trust database.`)
      }

      const minutesActive = TrustVoiceHelper.manageActive(newState.member.id) / 60000
      console.log(`Amount of minutes spent in VC: ${minutesActive}`)

      if (guildUser.user_enabled === 1) {
        await TrustUserData.update({ karma: guildUser.karma + guildTrust.karma_vcminute * minutesActive }, { where: { guild_user_id: newState.guild.id + '|' + newState.member.id } })
        TrustRolesHelper.apply(newState.member, guildUser.karma + guildTrust.karma_vcminute * minutesActive)
        console.log(`The karma for ${newState.member.user.tag} in ${newState.guild.name} is now ${guildUser.karma + guildTrust.karma_vcminute * minutesActive}. Reason: User was in a VC for ${minutesActive} minutes.`)
      }
    } else TrustVoiceHelper.manageActive(newState.member.id)
  }
}
