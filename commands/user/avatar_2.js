const Discord = require('discord.js')

module.exports = {

    data: {

        name: 'avatar',
        type: 2,

        group: 'user'
    },
    async execute(interaction) {

        let target = await client.users.fetch(interaction.targetId)
        let avatarURL = target.avatarURL()

        // check if animated
        if ((/.+a_\w+.\w+/g).test(avatarURL)) {

            parts = avatarURL.split('.')
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