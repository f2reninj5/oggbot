const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')
const path = require('path')

module.exports = {

    data: {

        name: 'profile',
        description: 'Manage or view user profiles.',
        type: 1,
        options: [

            {
                name: 'view',
                description: 'View a user profile.',
                type: 1,
                options: [

                    {
                        name: 'user',
                        description: 'The user whose profile to show.',
                        type: 6
                    }
                ]
            },
            {
                name: 'set',
                description: 'Set details on your profile.',
                type: 1,
                options: [

                    {
                        name: 'title',
                        description: 'Set your title.',
                        type: 3
                    },
                    {
                        name: 'location',
                        description: 'Set your location.',
                        type: 3
                    },
                    {
                        name: 'description',
                        description: 'Set your description.',
                        type: 3
                    },
                    {
                        name: 'style',
                        description: 'Set your profile style.',
                        type: 3
                    }
                ]
            },
            {
                name: 'remove',
                description: 'Remove details from your profile.',
                type: 1,
                options: [

                    {
                        name: 'title',
                        description: 'Remove your title.',
                        type: 5
                    },
                    {
                        name: 'location',
                        description: 'Remove your location.',
                        type: 5
                    },
                    {
                        name: 'description',
                        description: 'Remove your description.',
                        type:5
                    },
                    {
                        name: 'style',
                        description: 'Remove your style.',
                        type:5
                    }
                ]
            }
        ],

        group: 'user'
    },
    async execute(interaction) {

        const subcommands = {

            none: new Discord.Collection()
        }

        oggbot.loadSubcommands(subcommands, path.resolve(__dirname, './subcommands'), true)

        let group
        
        try {

            group = interaction.options.getSubcommandGroup()

        } catch {

            group = 'none'
        }
        
        let subcommand = subcommands[group].get(interaction.options.getSubcommand())

        try {

            subcommand.execute(interaction)

        } catch {

            interaction.editReply({ content: 'Phat error ennit.' })
        }
    }
}