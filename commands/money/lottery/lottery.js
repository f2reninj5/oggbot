const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')
const path = require('path')

module.exports = {

    data: {

        name: 'lottery',
        description: 'Purchase a lottery ticket and view statistics or winners.',
        type: 1,
        options: [

            {
                name: 'statistics',
                description: 'View statistics about the lottery.',
                type: 1
            },
            {
                name: 'ticket',
                description: 'Purchase a lottery ticket.',
                type: 1
            },
            {
                name: 'winners',
                description: 'View past lottery winners.',
                type: 1
            }
        ],

        group: 'money'
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