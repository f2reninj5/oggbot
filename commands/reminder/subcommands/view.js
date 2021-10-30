const oggbot = require(`${__root}/oggbot`)

module.exports = {

    data: {

        name: 'view',
        description: 'View your active reminders.',
        type: 1,
        options: [

            {
                name: 'id',
                description: 'The ID code of a reminder to view.',
                type: 4
            }
        ]
    },
    async execute(interaction) {

        let user = await oggbot.fetchUser(interaction.user.id)
        let id = interaction.options.getInteger('id')

        if (id !== null) {

            let reminder = await user.fetchReminder(id)

            if (!reminder) {

                interaction.editReply({ content: `Reminder of ID ${id} does not exist.` })

                return
            }

            interaction.editReply({ content: `**Reminder**\n`
            + `ID: ${reminder.id}\n`
            + `Channel: <#${reminder.channelId}>\n`
            + `Date: <t:${reminder.date.valueOf() / 1000}:R> at <t:${reminder.date.valueOf() / 1000}:t>\n`
            + `Message: \`${reminder.message}\`` })

        } else {

            await user.fetchReminders()

            if (!user.reminders) {

                interaction.editReply({ content: `You have no active reminders.` })

                return
            }

            let reminders = []

            for (reminder of user.reminders) {

                reminders.push(`\`#${reminder.id}\` <#${reminder.channelId}> <t:${reminder.date.valueOf() / 1000}:R>`)
            }

            interaction.editReply({ content: `**Reminders**\n${reminders.join('\n')}`})
        }
    }
}