const Discord = require('discord.js')

module.exports = {

    data: {

        name: 'avatar',
        description: 'Displays user avatar.',
        type: 1,
        options: [

            {
                name: 'user',
                description: 'The user whose profile picture you want to view.',
                type: 6
            }
        ],

        group: 'user'
    },
    async execute(interaction) {

        let target = interaction.options.getUser('user') || interaction.user
        let avatarURL = target.avatarURL()

        // check if animated
        if ((/.+a_\w+.\w+/g).test(avatarURL)) {

            let parts = avatarURL.split('.')
            parts[parts.length - 1] = 'gif'

            avatarURL = parts.join('.')
        }

        // create embed
        const avatarEmbed = new Discord.MessageEmbed()
            .setTitle(target.username)
            .setImage(avatarURL)

        // reply embed
        interaction.editReply({ embeds: [avatarEmbed] })
    }
}