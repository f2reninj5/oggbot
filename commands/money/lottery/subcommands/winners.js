const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')

module.exports = {
    
    data: {

        name: 'winners',
        description: 'View past lottery winners.',
        type: 1
    },
    async execute(interaction) {

        async function fetchWinners() {

            let rows = await oggbot.queryPool('SELECT user_id, amount, timestamp FROM lottery_winners ORDER BY timestamp DESC LIMIT 6')
            let winners = []

            for (row of rows) {

                winners.push({

                    user: await oggbot.fetchUser(row.user_id),
                    amount: row.amount,
                    timestamp: new Date(row.timestamp)
                })
            }

            return winners
        }
    
        let winners = await fetchWinners()

        const winnersEmbed = new Discord.MessageEmbed()
            .setTitle('Lottery Winners')

        for (winner of winners) {

            winnersEmbed
                .addField(winner.timestamp.toLocaleDateString(), `**${winner.user.username}** - ${oggbot.formatMoney(winner.amount)}`)
        }

        interaction.editReply({ embeds: [winnersEmbed] })
    }
}