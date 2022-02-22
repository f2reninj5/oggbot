const { Birthdays } = require(`${__root}/oggbot/index`)

module.exports = {

    data: {

        name: 'remove',
        description: 'Remove your birthday.',
        type: 1,
        group: 'user'
    },
    async execute(interaction) {

        try {

            let user = interaction.user

            await Birthdays.setBirthday(user, null)

            await interaction.editReply({ content: `Removed birthday.` })
        
        } catch (err) {

            await interaction.editReply({ content: `Failed to remove birthday because \`${err}\`.` })
        }
    }
}