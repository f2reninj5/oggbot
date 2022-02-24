const oggbot = require(`${__root}/oggbot`)

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
            }
        ]
    },
    async execute(interaction) {

        try {

            let user = interaction.user
            let title = interaction.options.getBoolean('title')
            let location = interaction.options.getBoolean('location')
            let description = interaction.options.getBoolean('description')
    
            if (!title && !location && !description) {

                throw 'no details were provided'
            }
    
            if (title) {

                await Profiles.setTitle(user, '')
            }

            if (location) {

                await Profiles.setLocation(user, '')
            }

            if (description) {

                await Profiles.setDescription(user, '')
            }
    
            await interaction.editReply({ content: 'Removed selected profile details.' })
            
        } catch (err) {

            await interaction.editReply({ content: `Failed to remove profile details because \`${err}\`.` })
        }
    }
}