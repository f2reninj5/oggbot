const oggbot = require(`${__root}/oggbot`)

module.exports = {

    data: {

        name: 'delete',
        description: 'Delete an active reminder.',
        type: 1,
        options: [

            {
                name: 'id',
                description: 'The ID code of a reminder to delete',
                type: 4,
                required: true
            }
        ]
    },
    async execute(interaction) {

        let user = await oggbot.fetchUser(interaction.user.id)
        let id = interaction.options.getInteger('id')

        try {

            await user.deleteReminder(id)

            global.reminders = global.reminders.filter(reminder => reminder.authorId != user.id && reminder.id != id)

            if (global.reminders.length < 1) {

                global.reminders = await oggbot.fetchUpcomingReminders()
            }

        } catch (err) {

            interaction.editReply(`Failed to delete reminder because \`${err}\`.`)

            return
        }

        interaction.editReply(`Successfully deleted reminder \`#${id}\`.`)
    }
}