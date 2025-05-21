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
		.setName('dutyinfo')
		.setDescription('Informacje o duty administratora.')
		.addUserOption(option =>
			option.setName('admin')
				.setDescription('Wspomnij admina.')
				.setRequired(false)),

	replyInteraction,

	async execute(data) {

		const interaction = data.interaction;
		const mysql = data.mysql;
		const socket = data.socket;
		const client = data.client;

		const admin = interaction.options.getUser('admin') === null ? interaction.user : interaction.options.getUser('admin');
        
        const variables = {
            type: "DutyInfo",
            interaction_id: interaction.id,
            user: interaction.user.id,
            admin: admin,
        }

        socket.write(JSON.stringify(variables))
        interactions[interaction.id] = interaction;
	},

}