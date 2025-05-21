const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');

const interactions = [];

function replyInteraction(id, user, data) {
    const interaction = interactions[id]
    const avatarURL = user.avatarURL === undefined ? user.defaultAvatarURL : user.avatarURL;
    const ephemeral = data.ephemeral ? data.ephemeral : false;

    const embed = {
        color: data.color,
        title: `🚗  Pojazdy gracza ${user.tag}`,
        description: data.desc,
        footer: {
            text: user.tag,
            icon_url: avatarURL,
        },
    }

    interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    interactions[id] = null;
}

function getVehicles(user, site, interaction, socket) {
    const variables = {
        type: "CheckVehicles",
        user: user,
        site: site,
        interaction_id: interaction.id,
    }

    socket.write(JSON.stringify(variables));
    interactions[interaction.id] = interaction;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pojazdy')
		.setDescription('Informacje o pojazdach gracza.')
		.addUserOption(option =>
			option.setName('użytkownik')
				.setDescription('Wspomnij gracza.')
				.setRequired(false))
        .addIntegerOption(option => 
			option.setName('strona')
				.setDescription('Strona z pojazdami.')
				.setRequired(false)),

    getVehicles,
    replyInteraction,

	async execute(data) {
		const interaction = data.interaction;
		const mysql = data.mysql;
		const socket = data.socket;

        const username = interaction.options.getUser('użytkownik') === null ? interaction.user : interaction.options.getUser('użytkownik');
		const site = interaction.options.getInteger('strona') === null ? 1 : interaction.options.getInteger('strona');
		
        await getVehicles(
            username, 
            site, 
            interaction, 
            socket
        );

    }

}