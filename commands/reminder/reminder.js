const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')
const path = require('path')

module.exports = {

    data: {

        name: 'reminder',
        description: 'Manage your personal scheduled reminders.',
        type: 1,
        options: [

            {
                name: 'create',
                description: 'Schedule a new reminder.',
                type: 1,
                options: [

                    {
                        name: 'days',
                        description: 'The number of days until your reminder is due.',
                        type: 4,
                        required: true
                    },
                    {
                        name: 'hour',
                        description: 'The hour at which your reminder is due.',
                        type: 4,
                        required: true
                    },
                    {
                        name: 'minute',
                        description: 'The minute at which your reminder is due.',
                        type: 4,
                        required: true
                    },
                    {
                        name: 'message',
                        description: 'The contents of your reminder.',
                        type: 3,
                        required: true
                    }
                ]
            },
            {
                name: 'view',
                description: 'View your active reminders.',
                type: 1,
                options: [

                    {
                        name: 'id',
                        description: 'The ID code of a reminder to view.',
                        type: 4
                    }
                ]
            },
            {
                name: 'delete',
                description: 'Delete an active reminder.',
                type: 1,
                options: [

                    {
                        name: 'id',
                        description: 'The ID code of a reminder to delete',
                        type: 4,
                        required: true
                    }
                ]
            }
        ]
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