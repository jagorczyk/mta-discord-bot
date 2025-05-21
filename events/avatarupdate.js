const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');

const client = require('../index.js');
var socket = require('../socket.js');

const SocketInterval = setInterval(() => {
    if (socket.write) {
        clearInterval(SocketInterval);
    }
    socket = require('../socket.js');
}, 5 * 1000);

async function updateAvatar(user, id) {
	
    if (id) {
        await client.users.fetch(id).then(u => {
            user = u; 
        });
    }

    const avatarURL = user.avatarURL() === null ? `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png` : user.avatarURL();

    const variables = {
        type: "AvatarUpdate",
        user_id: user.id,
        avatarURL: avatarURL
    }
    socket.write(JSON.stringify(variables))
}

//

module.exports = {
    name: 'avatarupdate',
    updateAvatar,
}

client.on('userUpdate', (oldUser, newUser) => {
    if (oldUser.avatarURL() != newUser.avatarURL()) {
        updateAvatar(newUser);
    }
});