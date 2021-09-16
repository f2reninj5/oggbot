const Discord = require('discord.js')

module.exports = {
    
    data: {

        name: 'icon',
        description: 'Displays server icon.',
        type: 1
    },
    async execute(interaction) {

        let iconURL = interaction.guild.iconURL()

        // check if animated
        if ((/.+a_\w+.\w+/g).test(iconURL)) {

            let parts = iconURL.split('.')
            parts[parts.length - 1] = 'gif'

            iconURL = parts.join('.')
        }

        // create embed
        const iconEmbed = new Discord.MessageEmbed()
            .setTitle(interaction.guild.name)
            .setImage(iconURL)
        
        // reply embed
        interaction.editReply({ embeds: [iconEmbed] })
    }
}