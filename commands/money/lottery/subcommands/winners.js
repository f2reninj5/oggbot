const { Bank, Lottery } = require(`${__root}/oggbot/index`)
const Discord = require('discord.js')

module.exports = {
    
    data: {

        name: 'winners',
        description: 'View past lottery winners.',
        type: 1
    },
    async execute(interaction) {

        try {

            let winners = await Lottery.fetchWinners()

            let winnersEmbed = new Discord.MessageEmbed()
                .setTitle('Lottery Winners')

            for (winner of winners) {

                winnersEmbed
                    .addField(winner.timestamp.toLocaleDateString(), `**${winner.user.username}** - ${Bank.format(winner.amount)}`)
            }

            await interaction.editReply({ embeds: [winnersEmbed] })

        } catch (err) {

            await interaction.editReply({ content: `Failed to get winners because \`${err}\`.` })
        }
    }
}