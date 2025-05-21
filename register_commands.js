require('dotenv').config()
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const token = process.env.token;
const fs = require('node:fs');

const clientId = '876177457907118170';

//

const commands = [];

const folders = fs.readdirSync('./commands').filter(file => !file.endsWith('.js'));
const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const folder of folders) {
	const files = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

	for (const file of files) {
		const command = require(`./commands/${folder}/${file}`);
		commands.push(command.data.toJSON());
	}
}

for (const file of files) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

//

const rest = new REST({ version: '9' }).setToken(token);


(async () => {
	try {
		console.log(Routes.applicationCommand(clientId))

		console.log('Refreshing commands.')
		
		await rest.put(Routes.applicationCommands(clientId), {body: commands}).then(() => {
		  console.log('Reloaded commands.');
		})

	} catch (error) {
		console.error(error);
	}
})();