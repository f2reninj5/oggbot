const { Birthdays } = require(`${__root}/oggbot/index`)

module.exports = {

    data: {
        name: 'nearest',
        description: 'View nearest upcoming birthdays.',
        type: 1,
        group: 'view'
    },
    async execute(interaction) {

        try {

            let birthday = await Birthdays.fetchNearestBirthday()
            let users = await Birthdays.fetchUsersByBirthday(birthday)
            let lines = []

            for (let row of users) {

                let user = await client.users.fetch(row.id)
                let details = Birthdays.calculateDetails(row.birthday)

                lines.push(`${user.username} is turning ${details.age + 1}`)
            }
            
            await interaction.editReply({ content: `**<t:${birthday.valueOf() / 1000}:R>**\n${lines.join('\n')}` })
    
        } catch (err) {

            await interaction.editReply({ content: `Failed to get nearest birthday because \`${err}\`.` })
        }
    }
}