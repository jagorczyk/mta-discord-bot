require('dotenv').config()

const NET = require('net');
const fs = require('node:fs');
const server = new NET.Server();
server.listen(process.env.NET_PORT);

const sockets = []
const AllFiles = [];

server.on('connection', function(socket) {
    
    if (sockets.length > 1) { return socket.end(); }

    sockets.push(socket)
    console.log("Connected to socket.");

    getCommands();
    getEvents();
    
    //
    
    socket.on('data', function(chunk) {
        const json = chunk.toString();
        const json_data = JSON.parse(json);
        const data = json_data[0]

        AllFiles[data.command][data.func](...data.args)
    });

    //

    socket.on('end', function() { sockets[socket] = null; });
    
    //
    
    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });

});

function send(code) {
    sockets[0].write(code);
}

module.exports = { write: send }

function getCommands() {

	const folders = fs.readdirSync('./commands').filter(file => !file.endsWith('.js'));
	const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

	for (const folder of folders) {
		const files = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

		for (const file of files) {
			const command = require(`./commands/${folder}/${file}`);
			AllFiles[command.data.name] = command;
		}
	}

	for (const file of files) {
		const command = require(`./commands/${file}`);
		AllFiles[command.data.name] = command;
	}

}

function getEvents() {

	const files = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

	for (const file of files) {
		const event = require(`./events/${file}`);
        AllFiles[event.name] = event;
	}

}

