const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')

module.exports = {
    
    data: {

        name: 'winners',
        description: 'View past lottery winners.',
        type: 1
    },
    async execute(interaction) {

        let winners = await JSON.parse(fs.readFileSync(path.resolve(__dirname, '../winners.json')))

        const winnersEmbed = new Discord.MessageEmbed()
            .setTitle('Lottery Winners')

        for (winner of winners) {

            winnersEmbed
                .addField(new Date(winner.timestamp).toLocaleDateString(), `**${(await oggbot.fetchUser(winner.id)).username}** - ${oggbot.formatMoney(winner.amount)}`)
        }

        interaction.editReply({ embeds: [winnersEmbed] })
    }
}