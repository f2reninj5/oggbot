const oggbot = require(`${__root}/oggbot`)

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

        const userId = interaction.options.getUser('user').id || interaction.user.id
        const user = await oggbot.fetchUser(userId)
        
        if (!user.birthday) {

            interaction.editReply({ content: 'No birthday set.' })

            return
        }

        interaction.editReply({ content: `${user.username}'s birthday: <t:${user.birthday.valueOf() / 1000}:d> (${user.age})` })
    }
}