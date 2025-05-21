const { SlashCommandBuilder } = require('@discordjs/builders');
const { users, ranks } = require('./config.json');

const interactions = [];

function replyInteraction(id, data) {
    const interaction = interactions[id]
    const avatarURL = interaction.user.avatarURL() === null ? `https://cdn.discordapp.com/embed/avatars/${interaction.user.discriminator % 5}.png` : interaction.user.avatarURL();
    const ephemeral = data.ephemeral ? data.ephemeral : false;

    const embed = {
        color: data.color,
        title: data.title,
        description: data.desc,
        footer: {
            text: interaction.user.tag,
            icon_url: avatarURL,
        },
    }

    interaction.reply({ embeds: [embed], ephemeral: ephemeral });
    interactions[id] = null;
}

//

function getUserFromMention(mention, client) {
	if (!mention) return;

    if (mention.startsWith('<@') && !mention.endsWith('>')) return 'err';

	if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.split(" ")
        mention = mention[0];
        
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
}

//

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setrank')
		.setDescription('Ustawia rangę w grze.')
		.addStringOption(option =>
			option.setName('użytkownik')
				.setDescription('Wpisz nick z MTA lub wspomnij gracza.')
				.setRequired(true))
		.addRoleOption(option =>
			option.setName('ranga')
				.setDescription('Wybierz rangę do nadania.')
				.setRequired(true)),

	replyInteraction,

	async execute(data) {

		const interaction = data.interaction;
		const mysql = data.mysql;
		const socket = data.socket;
		const client = data.client;

		if (!users.includes(interaction.user.id)) return;

		const username = interaction.options.getString('użytkownik');
		const rank = interaction.options.getRole('ranga').name;

		if (!ranks[rank]) return;

        const mentioned = getUserFromMention(username, client);
        if (mentioned === 'err') return;

        if (mentioned) {

            mysql.query(`Select * from pystories_users where user_id=${mentioned.id} LIMIT 1;`).then(rows => {
                var embed;

                if (rows[0]) {

                    embed = {
                        color: "#00bb00",
                        title: "✅  Ustawianie rangi",
                        description: `Pomyślnie zmieniono rangę <@${mentioned.id}> na <@&${interaction.options.getRole('ranga').id}>.`,
                        footer: {
                            text: interaction.user.tag,
                            icon_url: interaction.user.avatarURL(),
                        },
                    }

                   	mysql.query(`Select * from pystories_admins where serial='${rows[0].register_serial}' LIMIT 1;`).then(a => {
						if (a[0]) {
							mysql.query(`UPDATE pystories_admins SET level='${ranks[rank]}' WHERE serial='${a[0].serial}' LIMIT 1;`);
						} else {
							mysql.query(`INSERT INTO pystories_admins (serial, date, level) VALUES ('${rows[0].register_serial}', '${rows[0].login}', ${ranks[rank]})`);
						}
					});

					const nick = rows[0].login2 ? rows[0].login2 : rows[0].login;

					const variables = {
						type: "Notification",
						username: nick,
						n_type: "info",
						desc: `Twoja ranga została zmieniona na ${rank.charAt(0).toUpperCase() + rank.slice(1)} przez ${interaction.user.tag}`
					}
		
					socket.write(JSON.stringify(variables))

                } else {
                    embed = {
                        color: "#ff0000",
                        title: "🚫  Ustawianie rangi",
                        description: `Konto nie jest połączone z MTA.`,
                        footer: {
                            text: interaction.user.tag,
                            icon_url: interaction.user.avatarURL(),
                        },
                    }

                }

                interaction.reply({ embeds: [embed] })
                return;
			});

        } else {

			const variables = {
			    type: "Ranks",
				user_tag: interaction.user.tag,
			    interaction_id: interaction.id,
			    username: username,
				rank: {
					index: ranks[rank],
					name: rank.charAt(0).toUpperCase() + rank.slice(1),
					id: interaction.options.getRole('ranga').id,
				}
			}

			socket.write(JSON.stringify(variables))
			interactions[interaction.id] = interaction;
	    }
        
	}
}
