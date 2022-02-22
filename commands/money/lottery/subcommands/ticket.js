const { Bank, Lottery } = require(`${__root}/oggbot/index`)

module.exports = {

    data: {

        name: 'ticket',
        description: 'Purchase a lottery ticket.',
        type: 1
    },
    async execute(interaction) {
        
        try {

            let user = interaction.user
            let ticket = await Lottery.buyTicket(user)
            
            await interaction.editReply(`Purchased lottery ticket for ${Bank.format(ticket.price)}.`)

        } catch (err) {

            await interaction.editReply({ content: `Failed to purchase ticket because \`${err}\`.` })
        }
    }
}