/* eslint-disable no-unused-expressions */
const { SlashCommandBuilder } = require('@discordjs/builders')
const { Permissions, MessageActionRow, MessageButton } = require('discord.js')
const data = require('../database-setup')
const { TrustRolesHelper } = require('../trust_system/trust-helpers')

/**
 * @module
 * @description This module handles the registration of and response to the /trust command.
*/

const TrustUserData = data.TrustUserData
const TrustGuildData = data.TrustGuildData

module.exports = {
  /** The data used, to register this command. */
  data: new SlashCommandBuilder()
    .setName('trust')
    .setDescription('The base command for all things Trust system.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('server')
        .setDescription('Changes the servers settings for the trust system.')
        .addBooleanOption(option =>
          option
            .setName('enabled')
            .setDescription('Whether or not the trust system is active for this server. (Default: false)')
        )
        .addNumberOption(option =>
          option
            .setName('message-karma')
            .setDescription('The amount of karma a user gains per message sent. (Default: 1)')
        )
        .addNumberOption(option =>
          option
            .setName('voice-minute-karma')
            .setDescription('The amount of karma a user gains per minute spent in a voice channel (Default: 5)')
        )
        .addNumberOption(option =>
          option
            .setName('message-deleted-karma')
            .setDescription('The amount of karma a user gains per message deleted by a mod. (Default: -2)')
        )
        .addNumberOption(option =>
          option
            .setName('time-out-karma')
            .setDescription('The amount of karma a user gains per day of time-out. (Default: -25)')
        )
        .addNumberOption(option =>
          option
            .setName('kick-karma')
            .setDescription('The amount of karma a user gains per kick from the server. (Default: -100)')
        )
        .addNumberOption(option =>
          option
            .setName('ban-karma')
            .setDescription('The amount of karma a user gains per ban from the server. (Default: -1000)')
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('usertoggle')
        .setDescription('Toggle, if the trust system applies to a user or adds a user with this option off. (Default: on)')
        .addUserOption(option =>
          option
            .setDescription('The target user')
            .setName('target')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('show')
        .setDescription("Shows yours or any other person's karma on this server.")
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('The target user (If omitted, this command will show your own karma.)')
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('edit')
        .setDescription('A command to edit a users karma.')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('The target of this operation')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('operation')
            .setDescription('"set" will let you set the amount, "modify" will let you modify the current amout of karma.')
            .addChoices('set', 'set')
            .addChoices('modify', 'modify')
            .setRequired(true)
        )
        .addNumberOption(option =>
          option
            .setName('amount')
            .setDescription("The amount by wich the target's karma is set to/modified by")
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('role')
        .setDescription('Create, edit or delete a role, you want to be managed via the trust system.')
        .addRoleOption(option =>
          option
            .setName('role-selection')
            .setDescription('The role in question')
            .setRequired(true)
        )
        .addNumberOption(option =>
          option
            .setName('karma-threshhold')
            .setDescription('The threshhold a user has to pass, to get/loose the role (def.: 0)')
        )
        .addBooleanOption(option =>
          option
            .setName('manual')
            .setDescription('Whether the role is assigned to a user automatically (useful for i.e. reaction roles). (def.: false)')
        )
        .addBooleanOption(option =>
          option
            .setName('inverted')
            .setDescription('When true, the role is assigned on subceeding a threshhold. (def.: false)')
        )
    ),

  /**
   * The function, that gets executed, when the command "/trust" is issued.
   * Let's users configure and view user and server settings for the Trust-System.
   *
   * @summary The available sub-commands are: server, usertoggle, show, edit and role.
   * - server: Lets a user modify the settings for the server, he/she/they is/are in. If no additional arguments are given by the user, this command only shows the current settings.
   * - usertoggle: Allows the system to be toggled on or of on a per user basis. (Default: true)
   * - show: Lets users view their or other guild member's trust level. If no additional arguments are given, this command shows the issuer's trust level.
   * - edit: Lets guild moderators edit a user's trust level, by either adding a given value or setting it to it.
   * - role: A command to setup, edit or view or delete a role from the roles automatically managed by the system. If no additional optional arguments are given and the role is already managed by the Trust-System,
   * the user will be prompted to either view or delete the role.
   * @param {CommandInteraction} interaction - Contains information about the command issued and the means to respond appropiatly.
   * @function
   * @async
   */
  async execute (interaction) {
    // Block bots from using this command:
    if (interaction.user.bot) return

    try {
      if (interaction.options.getSubcommand() === 'server') {
        /*
        Necessary user permissions: Manage guild
        Options:
          - enabled (optional): Whether or not the Trust-System is active in the server. (Default is false);
          - message-karma (optional): The amount of karma, that a user recieves for sending a text message anywhere in the server. (Default is 1);
          - voice-minute-karma (optional): The amount of karma a user recieves for being in a voice channel for a minute. (Default is 5);
          - message-deleted-karma (optional): The amount of karma a user recieves, when one of his/her/their messages gets deleted by a server moderator. (Default is -2)
          - time-out-karma (optional): The amount of karma a user recieves, when he/she/they is/are given a time-out times the lenght of the time-out in days rounded down to the next integer. (Default is -25)
          - kick-karma (optional): The amount of karma someone recieves, when being kicked from the server. (Default is -100)
          - ban-karma (optional): The amount of karma someone recieves from being banned from the server. (Default is -1000)
        */
        if (!interaction.memberPermissions.any(Permissions.FLAGS.MANAGE_GUILD)) return interaction.reply({ content: '⛔ You need the "Manage Server" permission to do this!', ephemeral: true })
        let guildTrust = await TrustGuildData.findOne({ where: { guildid: interaction.guildId } })
        let editedServer = false
        const serverEnabled = interaction.options.getBoolean('enabled')
        const serverKarmaMsg = interaction.options.getNumber('message-karma')
        const serverKarmaVCMin = interaction.options.getNumber('voice-minute-karma')
        const serverKarmaDel = interaction.options.getNumber('message-deleted-karma')
        const serverKarmaTo = interaction.options.getNumber('time-out-karma')
        const serverKarmaKick = interaction.options.getNumber('kick-karma')
        const serverKarmaBan = interaction.options.getNumber('ban-karma')
        // If all variables are null, the database entry is not modified
        if ([serverEnabled, serverKarmaMsg, serverKarmaVCMin, serverKarmaDel, serverKarmaTo, serverKarmaKick, serverKarmaDel].some(item => item !== null)) {
          await TrustGuildData.update(
            {
              guild_enabled: serverEnabled !== null ? serverEnabled : guildTrust.guild_enabled,
              karma_message: serverKarmaMsg !== null ? serverKarmaMsg : guildTrust.karma_message,
              karma_vcminute: serverKarmaVCMin !== null ? serverKarmaVCMin : guildTrust.karma_vcminute,
              karma_message_del: serverKarmaDel !== null ? serverKarmaDel : guildTrust.karma_message_del,
              karma_time_out: serverKarmaTo !== null ? serverKarmaTo : guildTrust.karma_time_out,
              karma_kick: serverKarmaKick !== null ? serverKarmaKick : guildTrust.karma_kick,
              karma_ban: serverKarmaBan !== null ? serverKarmaBan : guildTrust.karma_ban
            },
            { where: { guildid: interaction.guildId } }
          )
          guildTrust = await TrustGuildData.findOne({ where: { guildid: interaction.guildId } })
          editedServer = true
        }
        let serverCmdResponse = ''
        // Send out a non ephemeral response, if something was changed.
        if (editedServer) {
          serverCmdResponse = `✅ Successfully edited server settings for the Trust-System. The new settings are:\nEnabled: ${!!guildTrust.guild_enabled}\nKarma per message: ${guildTrust.karma_message}
Karma per minute in a voice channel: ${guildTrust.karma_vcminute}\nKarma per message deleted by a moderator: ${guildTrust.karma_message_del}\nKarma per day in time-out: ${guildTrust.karma_time_out}
Karma per kick: ${guildTrust.karma_kick}\nKarma per ban: ${guildTrust.karma_ban}`
          interaction.reply(serverCmdResponse)
        } else {
          serverCmdResponse = {
            content: `The server settings are:\nEnabled: ${!!guildTrust.guild_enabled}\nKarma per message: ${guildTrust.karma_message}\nKarma per minute in a voice channel: ${guildTrust.karma_vcminute}
Karma per message deleted by a moderator: ${guildTrust.karma_message_del}\nKarma per day in time-out: ${guildTrust.karma_time_out}\nKarma per kick: ${guildTrust.karma_kick}
Karma per ban: ${guildTrust.karma_ban}`,
            ephemeral: true
          }
          interaction.reply(serverCmdResponse)
        }
      }

      if (interaction.options.getSubcommand() === 'usertoggle') {
        /*
        Necessary user permissions: Manage guild
        Options:
          - target: The guild member this command should change the "user_enabled" value.
        */
        if (!interaction.memberPermissions.any(Permissions.FLAGS.MANAGE_GUILD)) return interaction.reply({ content: '⛔ You need the "Manage Server" permission to do this!', ephemeral: true })
        const target = interaction.options.getMember('target', true)
        // If the target isn't found in the database, create an entry for it with the opposite of the default for "user_enabled".
        const [guildUser, created] = await TrustUserData.findOrCreate({
          where: { guild_user_id: interaction.guildId + '|' + target.id },
          defaults: {
            guild_user_id: interaction.guildId + '|' + target.id,
            user_enabled: false,
            karma: 0
          }
        })
        if (created) {
          interaction.reply(`✅ Added ${target.user.tag} to the database, with the option off.`)
          return console.log(`Added ${guildUser} to the trust database.`)
        }

        switch (guildUser.user_enabled) {
          case 1:
            await TrustUserData.update({ user_enabled: 0 }, { where: { guild_user_id: interaction.guildId + '|' + target.id } })
            interaction.reply(`✅ ${target.user.tag} is now exempt from the Trust-System.`)
            return console.log(`${target.user.tag} is now exempt from the Trust-System in ${interaction.guildId}.`)
          case 0:
            await TrustUserData.update({ user_enabled: 1 }, { where: { guild_user_id: interaction.guildId + '|' + target.id } })
            interaction.reply(`✅ ${target.user.tag} is no longer exempt from the Trust-System.`)
            return console.log(`${target.user.tag} is no longer exempt from the Trust-System in ${interaction.guildId}.`)
          default:
            await interaction.reply(`❗ Something went wrong, when trying to toggle the trust system for ${target.user.tag}!`)
            return console.error(`Something went wrong, when trying to toggle the trust system for ${target.id}.`)
        }
      }

      if (interaction.options.getSubcommand() === 'show') {
        /*
        Options:
          - target (optional): The target guild member. If omitted, the target will be set to the command issuer.
        */
        let target = interaction.member
        if (interaction.options.getMember('target') !== null) {
          target = interaction.options.getMember('target')
        }

        const [guildUser, created] = await TrustUserData.findOrCreate({
          where: { guild_user_id: interaction.guildId + '|' + target.id },
          defaults: {
            guild_user_id: interaction.guildId + '|' + target.id,
            user_enabled: true,
            karma: 0
          }
        })
        if (created) {
          console.log(`Added ${guildUser} to the trust database.`)
        }

        return await interaction.reply(`${target.user.tag} has ${guildUser.karma} karma on this server.`)
      }

      if (interaction.options.getSubcommand() === 'edit') {
        /*
        Necessary user permissions: Moderate Members
        Options:
          - target: The target guild member
        */
        await interaction.deferReply()
        if (!interaction.memberPermissions.any(Permissions.FLAGS.MODERATE_MEMBERS)) return interaction.editReply('⛔ You need the "Moderate members" permission to do this!')
        const target = interaction.options.getMember('target', true)
        const operation = interaction.options.getString('operation', true)
        const amount = interaction.options.getNumber('amount', true)

        const [guildUser, created] = await TrustUserData.findOrCreate({
          where: { guild_user_id: interaction.guildId + '|' + target.id },
          defaults: {
            guild_user_id: interaction.guildId + '|' + target.id,
            user_enabled: true,
            karma: amount
          }
        })
        if (created) {
          console.log(`Added ${guildUser} to the trust database.`)
        }

        switch (operation) {
          case 'set':
            await TrustUserData.update({ karma: amount }, { where: { guild_user_id: interaction.guildId + '|' + target.id } })
            console.log(`The karma for ${target.user.tag} in ${interaction.guild.name} is now ${amount}. Reason: Karma modified by "${interaction.user.tag}".`)
            TrustRolesHelper.apply(target, amount) // Apply/remove roles, that might be applicable now.
            return await interaction.editReply(`✅ Successfully set ${target.user.tag}'s karma to ${amount}.`)
          case 'modify':
            await TrustUserData.update({ karma: guildUser.karma + amount }, { where: { guild_user_id: interaction.guildId + '|' + target.id } })
            console.log(`The karma for ${target.user.tag} in ${interaction.guild.name} is now ${guildUser.karma + amount}. Reason: Karma modified by "${interaction.user.tag}".`)
            TrustRolesHelper.apply(target, guildUser.karma + amount) // Apply/remove roles, that might be applicable now.
            return await interaction.editReply(`✅ Successfully modified ${target.user.tag}'s karma. It's now at ${guildUser.karma + amount}.`)
        }
      }

      if (interaction.options.getSubcommand() === 'role') {
        /*
        Necessary user permissions: Manage Guild (create, edit, delete), None (view)
        Options:
          - role-selection: The role in question
          - threshhold (optional): Set, if this property should be changed. Controls the amount of karma, at which a user is given the/revoked of the role.
          - manual (optional): Set, if this property should be changed. Controls whether or not the role is given to the user manually.
          - inverted (optional): Set, if this property should be changed. Controls whether or not the karma of a user having this role should be over (false) or below (true) the threshhold set.
        */
        await interaction.reply({ content: '⏱️ Managing trust roles...', ephemeral: true })
        const roleIn = interaction.options.getRole('role-selection', true)
        let threshholdIn = interaction.options.getNumber('karma-threshhold')
        let manualIn = interaction.options.getBoolean('manual')
        let invertedIn = interaction.options.getBoolean('inverted')
        let roleOut = TrustRolesHelper.retrieve(roleIn)
        if ([threshholdIn, manualIn, invertedIn].some(item => item !== null) || !TrustRolesHelper.has(roleIn)) {
          // Create or edit, when no optional options are given.
          if (!interaction.memberPermissions.any(Permissions.FLAGS.MANAGE_GUILD)) return await interaction.editReply('⛔ You need the "Manage Server" permission to do this!')
          // Ensure, that, if the role is already managed by the Trust-System, only properties, that are explicitly given, are overwritten.
          if (roleOut) {
            threshholdIn !== null ? {} : threshholdIn = roleOut.threshhold
            manualIn !== null ? {} : manualIn = roleOut.manual
            invertedIn !== null ? {} : invertedIn = roleOut.inverted
          }
          console.log('Creating/editing trust-role...')
          await TrustRolesHelper.edit(roleIn, threshholdIn, manualIn, invertedIn)
          roleOut = TrustRolesHelper.retrieve(roleIn)
          console.log(`Added/edited ${roleOut.id} for use with the trust-system.`)
          return await interaction.followUp(`✅ Successfully setup ${roleIn.name} for use with the trust system, with parameters: threshhold = ${roleOut.threshhold}, manual = ${roleOut.manual}, inverted = ${roleOut.inverted}.`)
        } else {
          // Executes, when the role was found in "TrustRolesHelper.availableRoles" and no input parameters were given.
          console.log('Sending question to view or remove.')
          const buttons = new MessageActionRow()
            .addComponents(
              [new MessageButton()
                .setCustomId('view')
                .setLabel('View')
                .setStyle('PRIMARY'),
              new MessageButton()
                .setCustomId('delete')
                .setLabel('Remove')
                .setStyle('DANGER')]
            )
          const prompt = await interaction.followUp({ content: '❔ What do you want to do?', components: [buttons] })
          const collector = prompt.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 }) // Collector waiting for user input...
          collector.on('collect', async i => {
            if (interaction.user.id === i.user.id) {
              // Executes only when the user who pressed the button is the one, who issued the command.
              collector.stop('One time Event') // Stop collector to only register first button input.
              if (i.customId === 'view') {
                return await i.reply({ content: `The parameters for ${roleIn.name} are: threshhold = ${roleOut.threshhold}, manual = ${roleOut.manual}, inverted = ${roleOut.inverted}.`, ephemeral: true })
              } else if (i.customId === 'delete') {
                if (!interaction.memberPermissions.any(Permissions.FLAGS.MANAGE_GUILD)) return await interaction.editReply('⛔ You need the "Manage Server" permission to do this!')
                TrustRolesHelper.del(roleIn)
                console.log(`Removed role ${roleIn.id} from the trust-system.`)
                return await i.reply(`✅ The role ${roleIn.name} was successfully removed from the trust system.`)
              } else {
                return i.reply({ content: '❗ ... h-how?', ephemeral: true }) // Should never trigger, as there is no interaction with any other id, that should be collected here.
              }
            }
          })
          collector.once('end', async (collected, reason) => {
            // Delete prompt and edit initial message.
            let conclusion = ''
            reason === 'One time Event' ? conclusion = '❕ Option has already been chosen. You can dispose of this message now 🙃' : conclusion = '❕ Response time limit exceeded! You can delete this message now 🙃'
            await prompt.delete()
            return interaction.editReply({ content: conclusion })
          })
        }
      }
    } catch (error) {
      await interaction.reply({ content: '❗ Something went wrong', ephemeral: true })
        .catch(async () => await interaction.channel.send({ content: '❗ Something went wrong', ephemeral: true }))
      console.error(`Something went wrong, with /trust. Details:\n${error}`)
    }
  }
}
