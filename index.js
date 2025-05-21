require('dotenv').config()

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

module.exports = client;

const socket = require('./socket.js');
const mysql = require('./mysql.js');
const fs = require('node:fs');

client.on('ready', () => {
 	console.log(`Logged in as ${client.user.tag}!`);
});

client.commands = new Collection();
client.events = new Collection();

getCommands();
getEvents();

// SLASH COMMANDS

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute({
			interaction: interaction, 
			socket: socket, 
			mysql: mysql, 
			client: client
		});
	} catch (error) {
		console.error(error);
	}
});

// MENUS

client.on('interactionCreate', async interaction => {
	if (!interaction.isSelectMenu()) return;

	const command = client.commands.get(interaction.message.interaction.commandName);

	if (!command) return;

	try {
		await command.menu({
			interaction: interaction, 
			socket: socket, 
			mysql: mysql, 
			client: client
		});
	} catch (error) {
		console.error(error);
	}
});

// BUTTONS

client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;

	const command = client.commands.get(interaction.message.interaction.commandName);
	
	if (!command) return;

	try {
		await command.button({
			interaction: interaction, 
			socket: socket, 
			mysql: mysql, 
			client: client
		});
	} catch (error) {
		console.error(error);
	}
});

//

function getCommands() {

	const folders = fs.readdirSync('./commands').filter(file => !file.endsWith('.js'));
	const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

	for (const folder of folders) {
		const files = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

		for (const file of files) {
			const command = require(`./commands/${folder}/${file}`);
			client.commands.set(command.data.name, command);
		}
	}

	for (const file of files) {
		const command = require(`./commands/${file}`);
		client.commands.set(command.data.name, command);
	}

}

function getEvents() {

	const files = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

	for (const file of files) {
		const event = require(`./events/${file}`);
		client.events.set(event.name, event);
	}

}

client.login(process.env.token);
