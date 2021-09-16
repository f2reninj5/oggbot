const oggbot = require(`${__root}/oggbot`)

module.exports = {

    data: {
        name: 'user',
        description: 'View your own birthday.',
        type: 1,
        group: 'view'
    },
    async execute(interaction) {

        const user = await oggbot.fetchUser(interaction.user.id)
        
        if (!user.birthday) {

            interaction.editReply({ content: 'No birthday set.' })

            return
        }

        interaction.editReply({ content: `<t:${user.birthday.valueOf() / 1000}:d>` })
    }
}