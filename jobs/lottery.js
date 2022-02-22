const oggbot = require(`${__root}/oggbot`)
const { Bank, Lottery } = require(`${__root}/oggbot/index`)
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

            try {

                let guild = await oggbot.fetchHomeGuild()
                let channel = (await guild.channels.fetch()).filter(channel => channel.name == 'announcements').first()

                let winner = await Lottery.drawWinner()

                let winnerEmbed = new Discord.MessageEmbed()
                    .setTitle('This week\'s lottery winner is...')
                    .addField(winner.user.username, Bank.format(winner.winnings))
                    .setThumbnail(winner.user.avatarURL())
                    .setFooter('Type `/lottery ticket` to enter again for the next lottery!')

                await channel.send({ embeds: [winnerEmbed] })

            } catch (err) {

                console.log(err)
            }

        }, { timeZone: 'Europe/London' })

        draw.start()
    }
}