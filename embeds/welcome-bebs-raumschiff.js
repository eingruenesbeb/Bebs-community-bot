// at the top of your file
const { MessageEmbed } = require('discord.js');
const { client } = require('../main.js')

// inside a command, event listener, etc.
const welcomeEmbed = new MessageEmbed()
	.setColor('#0ce504')
	.setTitle('Nachricht an neue Passagiere:')
	.setDescription('Sehr geehrter Passagier, \nbevor Sie Zugang zum Schiff und weiteren Systemen erhalten lesen und akzeptieren \nSie sich diese wichtigen Nachrichten durch!')
	.addFields(
		{ name: 'Willkommen an Bord!', value: 'Im Namen des Captains begrüß ich Sie hier an Bord unseres Schiffes. Wir freuen uns darauf mit Ihnen durch die Weiten des Raums zu reisen und alles nur Erdenkliche zu \nerleben. Hier können sie über aktuelle Geschehnisse informieren und sich mit Ihren \nMitreisenden austauschen.\nBevor Sie aber die weiteren Decks erkunden und Zugriff auf das interne \nKommunikationsnetzwerk erhalten lesen Sie sich die Richtlinien zu unser aller Sicherheit\ndurch! Auch zu empfehlen ist ein Blick ins #informationsterminal .' },
	)
	.setTimestamp();

const channel_ = client.channels.cache.get('961622988741050450')

module.exports = {
	channel: channel_,
	embed: welcomeEmbed
}  