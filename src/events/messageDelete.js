const trust = require('../trust_system/trust-react.js')
const data = require('../database-setup')
const { AuditLogEvent } = require('discord.js')

const GeneralGuildData = data.GeneralGuildData

/**
 * @module
 * @description This module handles the response to, when a message was deleted in a guild.
*/

module.exports = {
  /** The name of the event to listen to */
  name: 'messageDelete',
  /** whether or not this event should be reacted to only once */
  once: false,
  /**
  * Function to react, when a message was deleted in one of the guilds the bot is in.
  * @param {Message} message - Contains information about the message and some means to respond.
  * @async
  */
  async execute (client, message) {
    /* Known properties of the message partial:
      channel, channelId, createdAt, createdTimestamp, deletable, deleted, guild, guildId, hasThread, id, partial, pinnable
      */
    const guild = await client.guilds.fetch(message.guildId)
    // This next part is a way to possibly get the author of a deleted message, that wasn't cached, via the Audit-Log:
    const delLog = await guild.fetchAuditLogs({
      type: AuditLogEvent.MessageDelete,
      limit: 1
    })
    const delLogEntry = delLog.entries.first()
    if (delLogEntry) {
      // Use data in the general data for guilds to determine, if the entry was checked before and therefore doesn't apply to the message in question.
      const guildData = await GeneralGuildData.findOrCreate({ where: { guild_id: message.guildId }, defaults: { guild_id: message.guildId } })
      const lastChecked = { id: guildData[0].last_checked_audit_log_deleted_id, amount: guildData[0].last_checked_audit_log_deleted_amount }
      const toCheck = { id: delLogEntry.id, amount: delLogEntry.extra.count }
      if ((toCheck.id !== lastChecked.id) || ((toCheck.id === lastChecked.id) && (toCheck.amount !== lastChecked.amount))) {
        // That means, that the deletion was indeed recorded in the audit-log, that the author is the target and the message was deleted by a moderator.
        message.author = delLogEntry.target
        message.member = await message.guild.members.fetch(message.author)
        message.deletedByMod = true
      }
      await GeneralGuildData.update({ last_checked_audit_log_deleted_id: delLogEntry.id, last_checked_audit_log_deleted_amount: delLogEntry.extra.count },
        { where: { guild_id: message.guildId } })
    }

    if (!message.author) return // Everything beyond this point requires the author of a message to be known.
    // Additional message properties: author, member, deletedByMod
    if (message.author.bot) return // Don't react, when the user is a bot.
    trust.trustReactMessageDelete(message)
  }
}
