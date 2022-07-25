const { MessageEmbed, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { client } = require('../../main.js')

/**
 * @module
 * @description This module provides an example for an embed. Most parts are inspired by this guide: {@link https://discordjs.guide/popular-topics/embeds.html}
 */

/**
 * @constant rulesEmbed This is the embed, that should be sent.
 * @private
 */
const rulesEmbed = new MessageEmbed()
  .setColor('#ff0000')
  .setTitle('Regeln')
  .setDescription('Um ein gutes Miteinander zu garantieren, gelten folgende Schiffsweite Regelungen:')
  .addFields(
    {
      name: '1. Es gilt das intergalaktische Recht (Discord Community Guidlines und TOS)',
      value: '\u200B'
    },
    {
      name: '2. Es ist uns ein wichtiges Anliegen, dass sich jeder hier wohl fühlt. Das heißt, dass es nicht gestattet ist andere zu:',
      value: '- Beleidigen\n- Diskriminieren\n- Übermaßig nerven (u. A. nicht unnötig Pingen)\n- Bedrohen'
    },
    {
      name: '3. Bitte bedenkt, dass alles, was ihr hier postet, mehr oder weniger öffentlich einsehbar ist! Daher gebt keine privaten Informationen weiter und sendet auch keine NSFW oder sonst irgendwie kritischen Inhalt.',
      value: 'Was "kritischer Inhalt ist liegt im Ermessen des Sicherheitsteams.'
    },
    {
      name: '4. Des Weiteren ist untersagt:',
      value: '- Werbung\n- Betrug jeglicher Art\n- Spamming'
    },
    {
      name: '5. Bitte haltet euch an die Themen der einzelnen Kommunikationskanäle. Wir werden versuchen alle wichtigen Themen abzudecken.',
      value: '\u200B'
    },
    {
      name: 'Zusätzliche Anmerkungen:',
      value: '- Diese Regeln gelten für alle Inhalte, die hier einsehbar sind (dazu zählen auch Profile).\n- Die Regeln können jederzeit erweitert und abgeändert werden. Über jegliche Änderungen    werdet ihr informiert.\n- Allumfassende Regelungen sind fast unmöglich zu verfassen, daher ist zu erwähen, dass   nicht alle Sanktionen durch diese begründet sein müssen. Wenn ihr denkt, ihr würdet \n  unfair behandelt werden wendet euch an die <@&961625753995341834>.\n- Um Zugang zum Rest des Schiffes zu erhalten klickt bitte auf "Ich akzeptiere diese \n  Regelungen"'
    }
  )
  .setTimestamp()

/**
 * @constant testButtons This is a action row, you might wanna add
 * @private
 */
const testButtons = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('Regeln akzeptiert')
      .setLabel('Ich akzeptiere')
      .setStyle(ButtonStyle.Success)
  )

const channel_ = client.channels.cache.get('961622988741050450')

module.exports = {
  channel: channel_,
  embed: { embed: rulesEmbed, components: [testButtons] }
}
