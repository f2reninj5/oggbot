const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')
const { lotteryValues } = require(`${__root}/config.json`)

module.exports = {

    data: {

        name: 'information',
        description: 'View information about the lottery.',
        type: 1
    },
    async execute(interaction) {

        function createNextDrawDate() {

            let targetDay = 6 // saturday
            let now = new Date()
            let nextDrawDate = new Date(now)
            nextDrawDate.setDate(now.getDate() + ((targetDay - now.getDay() + 6) % 7) + 1)
            nextDrawDate.setHours(16, 0, 0, 0)

            return nextDrawDate
        }

        async function getLotteryData() {

            let rows = await oggbot.queryPool('SELECT SUM(amount) AS pot, COUNT(*) AS entries FROM lottery')

            let lotteryData = {

                pot: rows[0].pot || 0,
                entries: rows[0].entries || 0,
                ticket: {

                    price: lotteryValues.ticketPrice,
                    bonus: oggbot.roundMoney(lotteryValues.ticketPrice * lotteryValues.bonusRatio)
                },
                nextDrawDate: createNextDrawDate()
            }

            return lotteryData
        }

        const lottery = await getLotteryData()
        let timestamp = `<t:${lottery.nextDrawDate.valueOf() / 1000}:R>`

        const informationEmbed = new Discord.MessageEmbed()
            .setTitle('Lottery Information')
            .addField('Pot Total', oggbot.formatMoney(lottery.pot))
            .addField('Entries', lottery.entries.toString())
            .addField('Ticket Price', oggbot.formatMoney(lottery.ticket.price))
            .addField('Ticket Bonus', oggbot.formatMoney(lottery.ticket.bonus))
            .addField('Next Draw', timestamp)

        interaction.editReply({ embeds: [informationEmbed] })
    }
}