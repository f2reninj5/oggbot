const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')

module.exports = {

    data: {

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
    },
    async execute(interaction) {

        const user = await oggbot.fetchUser(interaction.user.id)
        const responseEmbed = new Discord.MessageEmbed()
        let title = interaction.options.getBoolean('title')
        let location = interaction.options.getBoolean('location')
        let description = interaction.options.getBoolean('description')
        let style = interaction.options.getBoolean('style')
        let details = {}

        if (!title && !location && !description && !style) {

            interaction.editReply({ content: 'No details provided.' })

            return
        }

        if (title) {

            details.title = ''
        }

        if (location) {

            details.location = ''
        }

        if (description) {

            details.description = ''
        }

        if (Object.keys(details).length > 0) {

            await user.setDetails(details)

            for (key of Object.keys(details)) {

                responseEmbed
                    .addField(`${key[0].toUpperCase()}${key.slice(1, key.length)}`, `Removed ${key} from your profile.`)
            }
        }

        if (style) {

            await user.setStyle(null)
            responseEmbed
                .addField('Style', `Reset style to \`citizen\`.`)
        }

        interaction.editReply({ embeds: [responseEmbed] })
    }
}