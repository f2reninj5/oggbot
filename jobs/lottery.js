const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')
const cron = require('cron')
const path = require('path')
const fs = require('fs')

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
    execute() {

        const draw = new cron.CronJob('0 0 16 * * 6', async () => {

            const guild = await client.guilds.fetch('745569983542853643')
            const channel = (await guild.channels.fetch()).filter(channel => channel.name == 'announcements').first()

            async function drawWinner() {

                let id = (await oggbot.queryPool(`SELECT id FROM lottery ORDER BY RAND() LIMIT 1`))[0].id
                let amount = (await oggbot.queryPool(`SELECT SUM(amount) as amount FROM lottery`))[0].amount
                let timestamp = new Date()
                timestamp.setHours(16, 0, 0, 0)
                let winner = {
                    
                    user: await oggbot.fetchUser(id),
                    amount: amount,
                    timestamp: timestamp.valueOf()
                }

                return winner
            }

            let winner = await drawWinner()

            let winners = await JSON.parse(fs.readFileSync(path.resolve(__dirname, `${__root}/commands/money/lottery/winners.json`)))
            winners.pop()
            winners.unshift({
            
                id: winner.user.id,
                amount: winner.amount,
                timestamp: winner.timestamp
            })

            fs.writeFileSync(path.resolve(__dirname, `${__root}/commands/money/lottery/winners.json`), JSON.stringify(winners))
            
            await oggbot.queryPool(`UPDATE users SET balance = balance + ${winner.amount} WHERE id = '${winner.user.id}'`)
            await oggbot.queryPool(`DELETE FROM lottery`)

            const winnerEmbed = new Discord.MessageEmbed()
                .setTitle('This week\'s lottery winner is...')
                .addField(winner.user.username, oggbot.formatMoney(winner.amount))
                .setThumbnail(winner.user.avatarURL())
                .setFooter('Type `/lottery ticket` to enter again for the next lottey!')

            channel.send({ embeds: [winnerEmbed] })

        }, { timeZone: 'Europe/London' })

        draw.start()
    }
}