const { Bank, Lottery } = require(`${__root}/oggbot/index`)
const Discord = require('discord.js')

module.exports = {

    data: {

        name: 'statistics',
        description: 'View statistics about the lottery.',
        type: 1
    },
    async execute(interaction) {

        try {

            let lottery = await Lottery.fetchStats()
            let timestamp = `<t:${lottery.nextDrawDate.valueOf() / 1000}:R>`

            let statsEmbed = new Discord.MessageEmbed()
                .setTitle('Lottery Information')
                .addField('Pot Total', Bank.format(lottery.potValue))
                .addField('Entries', lottery.entryCount.toString())
                .addField('Ticket Price', Bank.format(lottery.ticket.price))
                .addField('Ticket Bonus', Bank.format(lottery.ticket.bonus))
                .addField('Next Draw', timestamp)

            await interaction.editReply({ embeds: [statsEmbed] })
        
        } catch (err) {

            await interaction.editReply({ content: `Failed to get statistics because \`${err}\`.` })
        }
    }
}