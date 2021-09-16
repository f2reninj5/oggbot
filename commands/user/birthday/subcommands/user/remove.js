const oggbot = require(`${__root}/oggbot`)

module.exports = {

    data: {

        name: 'remove',
        description: 'Remove your birthday.',
        type: 1,
        group: 'user'
    },
    async execute(interaction) {

        const user = await oggbot.fetchUser(interaction.user.id)

        if (!user.birthday) {

            interaction.editReply({ content: 'You already had no set birthday.' })

            return
        }

        user.setBirthday(null)

        interaction.editReply({ content: 'Birthday removed.' })
    }
}