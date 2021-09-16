const Discord = require('discord.js')

module.exports = {

    data: {

        name: 'emoji',
        description: 'Displays an emoji.',
        type: 1,
        options: [

            {
                name: 'emoji',
                description: 'Emoji to enlarge.',
                type: 3,
                required: true
            }
        ],

        group: 'fun'
    },
    async execute(interaction) {

        let emojiName = interaction.options.getString('emoji')

        try {

            emojiName = emojiName.match(/(?<=<:)\w{1,64}(?=:)/g)[0]

        } catch {}

        let emoji = client.emojis.cache.find(emoji => emoji.name === emojiName)

        // check if emoji found
        if (!emoji) {

            interaction.editReply({ content: 'Custom emoji not found.' })

            return
        }

        // create embed
        const emojiEmbed = new Discord.MessageEmbed()
            .setTitle(emoji.name)
            .setFooter(emoji.id)

        // check if emoji is animated and add it to the embed
        if (!emoji.animated) {

            emojiEmbed
                .setImage(`https://cdn.discordapp.com/emojis/${emoji.id}.png`)

        } else {

            emojiEmbed
                .setImage(`https://cdn.discordapp.com/emojis/${emoji.id}.gif`)
        }

        // reply embed
        interaction.editReply({ embeds: [emojiEmbed] })
    }
}