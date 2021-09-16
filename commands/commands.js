const Discord = require('discord.js')

module.exports = {

    data: {

        name: 'commands',
        description: 'Lists all commands.',
        type: 1,
        options: [

            {
                name: 'type',
                description: 'Which command type commands to list.',
                type: 3,
                choices: [

                    {
                        name: 'chat',
                        value: 'chat'
                    },
                    {
                        name: 'user',
                        value: 'user',
                    },
                    {
                        name: 'message',
                        value: 'message'
                    }
                ]
            }
        ]
    },
    async execute(interaction) {

        function createCommandGroups(commands) {

            let groups = {

                general: []
            }

            commands.forEach(command => {

                let group = 'general'

                if (command.data.group) {

                    group = command.data.group

                    if (!groups[group]) {

                        groups[group] = []
                    }
                }

                groups[group].push(command.data.name)
            })

            if (groups.general.length < 1) {

                delete groups.general
            }

            return groups
        }

        async function createCommandEmbed(commands, type) {

            const commandEmbed = new Discord.MessageEmbed()
                .setTitle(`Here is a list of all ${type} commands:`)

            let groups = createCommandGroups(commands)
            let groupKeys = Object.keys(groups)
            
            for (i = 0; i < groupKeys.length; i ++) {

                commandEmbed
                    .addField(groupKeys[i], groups[groupKeys[i]].join(', '))
            }

            return commandEmbed
        }

        const commandCollections = {

            chat: client.chatCommands,
            user: client.userCommands,
            message: client.messageCommands
        }

        let type = interaction.options.getString('type') || 'chat'

        // reply embed
        interaction.editReply({ embeds: [await createCommandEmbed(commandCollections[type], type)] })
    }
}