const { SlashCommandBuilder } = require('@discordjs/builders');

//

const codes = []
const interactions = []

function addCode(code, sid, username) {
    if (!codes[code]) {
        return codes[code] = {sid, username, code};
    }
    return false
}

function checkCode(code) {
    if (codes[code]) {
        return codes[code];
    }
    return false;
}

function removeCode(code) {
    if (codes[code]) {
        return codes[code] = null;
    }
    return false
}

//

module.exports = {
	data: new SlashCommandBuilder()
		.setName('polacz')
		.setDescription('kod')
		.addStringOption(option =>
			option.setName('kod')
				.setDescription('Podaj swój kod.')
				.setRequired(true)),
    addCode,
    checkCode,
    removeCode,
                
	async execute(data) {
		const interaction = data.interaction;
		const mysql = data.mysql;
		const socket = data.socket;

        if (interaction.guildId !== null) {
			const embed = {
                color: "#ff0000",
                title: "🚫  Łączenie MTA -> DC",
                description: `Napisz do mnie we wiadomości prywatnej.`,
                footer: {
                    text: interaction.user.tag,
                    icon_url: interaction.user.avatarURL(),
                },
            }
            await interaction.reply({ embeds: [embed], ephemeral: true })
            return;
        }

        await mysql.query(`Select * from prpg_users where user_id=${interaction.user.id} LIMIT 1;`).then(rows => {
            if (rows[0]) {
                const embed = {
                    color: 15548997,
                    title: "🚫  Łączenie MTA -> DC",
                    description: `Twoje konto jest już połączone z MTA **(${rows[0].login})**.`,
                    footer: {
                        text: interaction.user.tag,
                        icon_url: interaction.user.avatarURL(),
                    },
                }
                interaction.reply({ embeds: [embed] });
                throw `${interaction.user.tag} ma już połączone konto z loginem ${rows[0].login}.`;
            }
        });

		const code = interaction.options.getString('kod');
		const CodeChecked = checkCode(code)
        
		if (CodeChecked) {
            const avatarURL = interaction.user.avatarURL() === null ? `https://cdn.discordapp.com/embed/avatars/${interaction.user.discriminator % 5}.png` : interaction.user.avatarURL();
			const variables = {
                type: "Connecting",
                username: CodeChecked.username,
                sid: CodeChecked.sid,
                user_id: interaction.user.id,
                avatarURL: avatarURL,
                code: CodeChecked.code,
            }
            socket.write(JSON.stringify(variables))

			const embed = {
                color: 15548997,
                title: "🟢  Łączenie MTA -> DC",
                description: `Pomyślnie połączono konto **${interaction.user.tag}** z **${CodeChecked.username} [${CodeChecked.sid}]**. 🤙`,
                footer: {
                    text: interaction.user.tag,
                    icon_url: interaction.user.avatarURL(),
                },
            }
            interaction.reply({ embeds: [embed] })
		} else {
            const embed = {
                color: 15548997,
                title: "🚫  Łączenie MTA -> DC",
                description: `Kod nieaktywny lub nie istnieje.`,
                footer: {
                    text: interaction.user.tag,
                    icon_url: interaction.user.avatarURL(),
                },
            }
            interaction.reply({ embeds: [embed] })
            return;
        }
	}
}