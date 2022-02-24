const { Profiles } = require(`${__root}/oggbot/index`)

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
    async execute(interaction) { // separate into multiple commands?

        try {

            let user = interaction.user
            let title = interaction.options.getString('title')
            let location = interaction.options.getString('location')
            let description = interaction.options.getString('description')
            let style = interaction.options.getString('style')

            if (!title && !location && !description && !style) {

                throw 'no details were provided'
            }

            if (title) {

                await Profiles.setTitle(user, title)
            }

            if (location) {

                await Profiles.setLocation(user, location)
            }

            if (description) {

                await Profiles.setDescription(user, description)
            }

            if (style) {

                await Profiles.setStyle(user, style)
            }

            await interaction.editReply({ content: 'Set new profile details.' })

        } catch (err) {

            await interaction.editReply({ content: `Failed to set profile details because \`${err}\`.` })
        }
    }
}