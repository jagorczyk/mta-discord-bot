const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');

const interactions = []

function replyInteraction(id, user, data) {
    const interaction = interactions[id]
    const avatarURL = user.avatarURL === undefined ? user.defaultAvatarURL : user.avatarURL;

    const embed = {
        color: data.color,
        title: `🤖 Informacje o graczu ${user.tag}`,
        fields: data.fields,
        description: data.desc,
        footer: {
            text: user.tag,
            icon_url: avatarURL,
        },
    }

    interaction.reply({ embeds: [embed] });
    interactions[id] = null;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Informacje o graczu.')
		.addUserOption(option =>
			option.setName('użytkownik')
				.setDescription('Wspomnij gracza.')
				.setRequired(false)),

	replyInteraction,

	async execute(data) {

		const interaction = data.interaction;
		const mysql = data.mysql;
		const socket = data.socket;
		const client = data.client;

		const username = interaction.options.getUser('użytkownik') === null ? interaction.user : interaction.options.getUser('użytkownik');
		const avatarURL = username.avatarURL() === null ? `https://cdn.discordapp.com/embed/avatars/${username.discriminator % 5}.png` : username.avatarURL();
        
        const variables = {
            type: "PlayerInfo",
            interaction_id: interaction.id,
            user: username,
        }

        socket.write(JSON.stringify(variables))
        interactions[interaction.id] = interaction;
	},

	async button(data) {
		const interaction = data.interaction;
		const mysql = data.mysql;
		const client = data.client;
		const socket = data.socket;

	}
}