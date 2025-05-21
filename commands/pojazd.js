const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');

const interactions = [];

function replyInteraction(id, data) {
    const interaction = interactions[id]
    const avatarURL = interaction.user.avatarURL() === null ? `https://cdn.discordapp.com/embed/avatars/${interaction.user.discriminator % 5}.png` : interaction.user.avatarURL();
    const ephemeral = data.ephemeral ? data.ephemeral : false;

    const embed = {
        color: data.color,
        title: data.title,
        fields: data.fields,
        description: data.desc,
        footer: {
            text: interaction.user.tag,
            icon_url: avatarURL,
        },
    }

    interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    interactions[id] = null;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pojazd')
		.setDescription('Informacje o pojeździe.')
        .addIntegerOption(option => 
			option.setName('id')
				.setDescription('Id pojazdu.')
				.setRequired(true)),

    replyInteraction,

	async execute(data) {
		const interaction = data.interaction;
		const mysql = data.mysql;
		const socket = data.socket;

		const id = interaction.options.getInteger('id');
        
        const variables = {
            type: "VehicleInfo",
            interaction_id: interaction.id,
            id: id
        }

        socket.write(JSON.stringify(variables))
        interactions[interaction.id] = interaction;

    }

}