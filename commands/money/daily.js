const { Bank, Claims } = require(`${__root}/oggbot/index`)

module.exports = {

    data: {

        name: 'daily',
        description: 'Pays you your daily allowance.',
        type: 1,

        group: 'money'
    },
    async execute(interaction) {

        try {

            let claim = await Claims.collectDailyClaim(interaction.user)

            await interaction.editReply(`Received ${Bank.format(claim.amount)}.\n\`${Claims.generateStreak(claim.streak.value, claim.streak.max)}\``)

        } catch (err) {

            await interaction.editReply({ content: `Failed to claim daily because \`${err}\`.` })
            await interaction.followUp({ content: `Try again <t:${Claims.calculateNextDailyDate().valueOf() / 1000}:R>`, ephemeral: true })
        }
    }
}