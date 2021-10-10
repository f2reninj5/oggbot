const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')

module.exports = {

    data: {
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
    async execute(interaction) {

        const user = await oggbot.fetchUser(interaction.user.id)
        const responseEmbed = new Discord.MessageEmbed()
        let title = interaction.options.getString('title')
        let location = interaction.options.getString('location')
        let description = interaction.options.getString('description')
        let style = interaction.options.getString('style')
        let details = {}

        if (!title && !location && !description && !style) {

            interaction.editReply({ content: 'No details provided.' })

            return
        }

        if (title) {

            details.title = title
        }

        if (location) {

            details.location = location
        }

        if (description) {

            details.description = description
        }

        if (style) {

            style = style.toLowerCase()
        }

        for (key of Object.keys(details)) {

            try {

                await user.setDetails(details)

                for (key of Object.keys(details)) {

                    responseEmbed
                        .addField(`${key[0].toUpperCase()}${key.slice(1, key.length)}`, `Set ${key} to \`${details[key]}\`.`)
                }

                break
    
            } catch (err) {

                responseEmbed
                    .addField(err[0], `Failed to set ${err[0].toLowerCase()} because \`${err[1]}\`.`)
    
                delete details[err[0]]
            }
        }

        if (style) {

            try {
    
                await user.setStyle(style)
                responseEmbed
                    .addField('Style', `Set style to \`${style}\`.`)

            } catch (err) {

                responseEmbed
                    .addField('Style', `Failed to set style because \`${err}\`.`)
            }
        }

        interaction.editReply({ embeds: [responseEmbed] })
    }
}