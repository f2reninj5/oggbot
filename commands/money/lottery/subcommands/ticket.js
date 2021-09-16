const oggbot = require(`${__root}/oggbot`)
const { lotteryValues } = require(`${__root}/config.json`)

module.exports = {

    data: {

        name: 'ticket',
        description: 'Purchase a lottery ticket.',
        type: 1
    },
    async execute(interaction) {

        const user = await oggbot.fetchUser(interaction.user.id)
        
        if (user.lottery.tickets) {

            interaction.editReply({ content: 'You have already entered the lottery.' })

            return
        }

        if (user.balance < lotteryValues.ticketPrice) {

            interaction.editReply({ content: 'You cannot afford to enter the lottery.' })

            return
        }

        let total = lotteryValues.ticketPrice + oggbot.roundMoney(lotteryValues.ticketPrice * lotteryValues.bonusRatio)

        oggbot.moneyTransaction(user, client.user, lotteryValues.ticketPrice, 'lottery ticket')
        oggbot.queryPool(`INSERT INTO lottery (id, amount) VALUES ('${user.id}', ${total})`)

        interaction.editReply(`Purchased lottery ticket for ${oggbot.formatMoney(lotteryValues.ticketPrice)}`)
    }
}