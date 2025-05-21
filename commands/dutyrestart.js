const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');

function OptionsCounter(...options) {
    let a = 0;
    options.forEach(element => {
        if (element !== null) {
            a++;
        }
    });
    return a;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dutyrestart')
		.setDescription('Restartuje wszystkie statystyki adminów i wypłaca im pieniądze.'),

	async execute(data) {

		const interaction = data.interaction;
		const mysql = data.mysql;
		const socket = data.socket;
		const client = data.client;
        
        const variables = {
            type: "DutyRestart",
            admin: interaction.user,
        }

        socket.write(JSON.stringify(variables))
        interactions[interaction.id] = interaction;
	},

}