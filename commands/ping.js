const Discord = require('discord.js')

module.exports = {

    data: {

        name: 'ping',
        description: 'Pong!',
        type: 1
    },
    async execute(interaction) {

        // create embed
        const pongEmbed = new Discord.MessageEmbed()
            .setTitle('Pong!')
            .setImage('https://piskel-imgstore-b.appspot.com/img/787e2d80-68a4-11eb-8838-294b1cf06c40.gif')
            .setFooter(`Latency: ${Date.now() - interaction.createdTimestamp} ms`)

        // reply embed
        interaction.editReply({ embeds: [pongEmbed] })
    }
}