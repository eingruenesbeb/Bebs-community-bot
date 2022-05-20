/* eslint-disable no-unused-expressions */
const { SlashCommandBuilder } = require('@discordjs/builders')
const { Permissions, MessageActionRow, MessageButton } = require('discord.js')
const data = require('../database-setup')
const { TrustRolesHelper } = require('../trust_system/trust-helpers')

const TrustUserData = data.TrustUserData
const TrustGuildData = data.TrustGuildData

module.exports = {
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
            .setDescription('Wether or not the trust system is active for this server. (Default: false)')
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
            .addChoice('set', 'set')
            .addChoice('modify', 'modify')
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

  async execute (interaction) {
    const blockedUsers = ['962154925255708683']
    if (blockedUsers.includes(interaction.user.id)) return

    try {
      if (interaction.options.getSubcommand() === 'server') {
        if (!interaction.memberPermissions.any(Permissions.FLAGS.MANAGE_GUILD)) return interaction.reply({ content: '⛔ You need the "Manage Server" permission to do this!', ephemeral: true })
        await interaction.deferReply()
        let guildTrust = await TrustGuildData.findOne({ where: { guildid: interaction.guildId } })
        let editedServer = false
        const serverEnabled = interaction.options.getBoolean('enabled')
        const serverKarmaMsg = interaction.options.getNumber('message-karma')
        const serverKarmaVCMin = interaction.options.getNumber('voice-minute-karma')
        const serverKarmaDel = interaction.options.getNumber('message-deleted-karma')
        const serverKarmaTo = interaction.options.getNumber('time-out-karma')
        const serverKarmaKick = interaction.options.getNumber('kick-karma')
        const serverKarmaBan = interaction.options.getNumber('ban-karma')
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
        if (editedServer) {
          serverCmdResponse = `✅ Successfully edited server settings for the Trust-System. The new settings are:\nEnabled: ${!!guildTrust.guild_enabled}\nKarma per message: ${guildTrust.karma_message}
Karma per minute in a voice channel: ${guildTrust.karma_vcminute}\nKarma per message deleted by a moderator: ${guildTrust.karma_message_del}\nKarma per day in time-out: ${guildTrust.karma_time_out}
Karma per kick: ${guildTrust.karma_kick}\nKarma per ban: ${guildTrust.karma_ban}`
          interaction.editReply(serverCmdResponse)
        } else {
          serverCmdResponse = {
            content: `The server settings are:\nEnabled: ${!!guildTrust.guild_enabled}\nKarma per message: ${guildTrust.karma_message}\nKarma per minute in a voice channel: ${guildTrust.karma_vcminute}
Karma per message deleted by a moderator: ${guildTrust.karma_message_del}\nKarma per day in time-out: ${guildTrust.karma_time_out}\nKarma per kick: ${guildTrust.karma_kick}
Karma per ban: ${guildTrust.karma_ban}`,
            ephemeral: true
          }
          interaction.followUp(serverCmdResponse)
          interaction.deleteReply()
        }
      }

      if (interaction.options.getSubcommand() === 'usertoggle') {
        if (!interaction.memberPermissions.any(Permissions.FLAGS.MANAGE_GUILD)) return interaction.reply({ content: '⛔ You need the "Manage Server" permission to do this!', ephemeral: true })
        const target = interaction.options.getMember('target', true)
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
        await interaction.deferReply()
        if (!interaction.memberPermissions.any(Permissions.FLAGS.MODERATE_MEMBERS)) return await interaction.editReply('⛔ You need the "Moderate members" permission to do this!')
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
            TrustRolesHelper.apply(target, amount)
            return await interaction.editReply(`✅ Successfully set ${target.user.tag}'s karma to ${amount}.`)
          case 'modify':
            await TrustUserData.update({ karma: guildUser.karma + amount }, { where: { guild_user_id: interaction.guildId + '|' + target.id } })
            console.log(`The karma for ${target.user.tag} in ${interaction.guild.name} is now ${guildUser.karma + amount}. Reason: Karma modified by "${interaction.user.tag}".`)
            TrustRolesHelper.apply(target, guildUser.karma + amount)
            return await interaction.editReply(`✅ Successfully modified ${target.user.tag}'s karma. It's now at ${guildUser.karma + amount}.`)
        }
      }

      if (interaction.options.getSubcommand() === 'role') {
        await interaction.reply({ content: '⏱️ Managing trust roles...', ephemeral: true })
        const roleIn = interaction.options.getRole('role-selection', true)
        let threshholdIn = interaction.options.getNumber('karma-threshhold')
        let manualIn = interaction.options.getBoolean('manual')
        let invertedIn = interaction.options.getBoolean('inverted')
        let roleOut = TrustRolesHelper.retrieve(roleIn)
        if ([threshholdIn, manualIn, invertedIn].some(item => item !== null) || !TrustRolesHelper.has(roleIn)) {
          if (!interaction.memberPermissions.any(Permissions.FLAGS.MANAGE_GUILD)) return await interaction.editReply('⛔ You need the "Manage Server" permission to do this!')
          if (roleOut) {
            threshholdIn !== null ? {} : threshholdIn = roleOut.threshhold
            manualIn !== null ? {} : manualIn = roleOut.manual
            invertedIn !== null ? {} : invertedIn = roleOut.inverted
          }
          console.log('Creating/editing trust-role...')
          await TrustRolesHelper.edit(roleIn, threshholdIn, manualIn, invertedIn)
          roleOut = TrustRolesHelper.retrieve(roleIn)
          console.log(`Added/edited ${roleOut.id} for use with the trust-system.`)
          return await interaction.editReply(`✅ Successfully setup ${roleIn.name} for use with the trust system, with parameters: threshhold = ${roleOut.threshhold}, manual = ${roleOut.manual}, inverted = ${roleOut.inverted}.`)
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
