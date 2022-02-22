const { Birthdays } = require(`${__root}/oggbot/index`)

module.exports = {

    data: {
        name: 'user',
        description: 'View a user birthday.',
        type: 1,
        options: [

            {
                name: 'user',
                description: 'The user whose birthday to view',
                type: 6
            }
        ],
        group: 'view'
    },
    async execute(interaction) {

        try {

            let user = interaction.options.getUser('user') || interaction.user

            let birthday = await Birthdays.fetchBirthday(user)
            let details = Birthdays.calculateDetails(birthday)

            await interaction.editReply({ content: `${user.username}'s birthday: <t:${birthday.valueOf() / 1000}:d> (${details.age})` })
    
        } catch (err) {

            await interaction.editReply({ content: `Failed to get birthday because \`${err}\`.` })
        }
    }
}