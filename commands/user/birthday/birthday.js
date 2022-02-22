const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')
const path = require('path')

module.exports = {

    data: {

        name: 'birthday',
        description: 'Manage your birthday or view birthdays.',
        type: 1,
        options: [

            {
                name: 'user',
                description: 'Manage your birthday.',
                type: 2,
                options: [

                    {
                        name: 'set',
                        description: 'Set your birthday.',
                        type: 1,
                        options: [
        
                            {
                                name: 'year',
                                description: 'The year when you were born.',
                                type: 4,
                                required: true
                            },
                            {
                                name: 'month',
                                description: 'The month when you were born.',
                                type: 3,
                                required: true,
                                choices: [
        
                                    {
                                        name: 'January',
                                        value: 'jan'
                                    },
                                    {
                                        name: 'February',
                                        value: 'feb'
                                    },
                                    {
                                        name: 'March',
                                        value: 'mar'
                                    },
                                    {
                                        name: 'April',
                                        value: 'apr'
                                    },
                                    {
                                        name: 'May',
                                        value: 'may'
                                    },
                                    {
                                        name: 'June',
                                        value: 'jun'
                                    },
                                    {
                                        name: 'July',
                                        value: 'jul'
                                    },
                                    {
                                        name: 'August',
                                        value: 'aug'
                                    },
                                    {
                                        name: 'September',
                                        value: 'sep'
                                    },
                                    {
                                        name: 'October',
                                        value: 'oct'
                                    },
                                    {
                                        name: 'November',
                                        value: 'nov'
                                    },
                                    {
                                        name: 'December',
                                        value: 'dec'
                                    }
                                ]
                            },
                            {
                                name: 'day',
                                description: 'The day of the month when you were born.',
                                type: 4,
                                required: true
                            }
                        ]
                    },
                    {
                        name: 'remove',
                        description: 'Remove your birthday.',
                        type: 1
                    }
                ]
            },
            {
                name: 'view',
                description: 'View birthdays.',
                type: 2,
                options: [

                    {
                        name: 'all',
                        description: 'View all birthdays.',
                        type: 1
                    },
                    {
                        name: 'nearest',
                        description: 'View nearest nearest birthdays.',
                        type: 1
                    },
                    {
                        name: 'user',
                        description: 'View a user\'s birthday.',
                        type: 1,
                        options: [

                            {
                                name: 'user',
                                description: 'The user whose birthday to show.',
                                type: 6
                            }
                        ]
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

        oggbot.loadSubcommands(subcommands, path.resolve(__dirname, './subcommands'))

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