const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')
const cron = require('cron')

module.exports = {

    data: {

        name: 'lottery',
        jobs: [

            {
                name: 'draw',
                description: 'Draws a lottery winner.'
            }
        ]
    },
    async execute() {

        const draw = new cron.CronJob('0 0 16 * * 6', async () => {

            const guild = await client.guilds.fetch('745569983542853643')
            const channel = (await guild.channels.fetch()).filter(channel => channel.name == 'announcements').first()

            async function drawWinner() {

                let id = (await oggbot.queryPool(`SELECT id FROM lottery ORDER BY RAND() LIMIT 1`))[0].id
                let amount = (await oggbot.queryPool(`SELECT SUM(amount) as amount FROM lottery`))[0].amount
                let winner = {
                    
                    user: await oggbot.fetchUser(id),
                    amount: amount
                }

                return winner
            }

            let winner = await drawWinner()

            oggbot.queryPool(`INSERT INTO lottery_winners VALUES ('${winner.user.id}', ${winner.amount}, DATE_FORMAT(CURRENT_TIMESTAMP(), '%Y-%m-%d %H:00:00'))`)

            await oggbot.moneyTransaction(client.user, winner.user, winner.amount, 'lottery winner')
            await oggbot.queryPool(`DELETE FROM lottery`)

            const winnerEmbed = new Discord.MessageEmbed()
                .setTitle('This week\'s lottery winner is...')
                .addField(winner.user.username, oggbot.formatMoney(winner.amount))
                .setThumbnail(winner.user.avatarURL())
                .setFooter('Type `/lottery ticket` to enter again for the next lottery!')

            channel.send({ embeds: [winnerEmbed] })

        }, { timeZone: 'Europe/London' })

        draw.start()
    }
}