const oggbot = require(`${__root}/oggbot`)

module.exports = {

    data: {

        name: 'create',
        description: 'Schedule a new reminder.',
        type: 1,
        options: [

            {
                name: 'days',
                description: 'The number of days until your reminder is due.',
                type: 4,
                required: true
            },
            {
                name: 'hour',
                description: 'The hour at which your reminder is due.',
                type: 4,
                required: true
            },
            {
                name: 'minute',
                description: 'The minute at which your reminder is due.',
                type: 4,
                required: true
            },
            {
                name: 'message',
                description: 'The contents of your reminder.',
                type: 3,
                required: true
            }
        ]
    },
    async execute(interaction) {

        let user = await oggbot.fetchUser(interaction.user.id)
        let channel = interaction.channel
        let days = interaction.options.getInteger('days')
        let hour = interaction.options.getInteger('hour') % 24
        let minute = interaction.options.getInteger('minute') % 60
        let message = interaction.options.getString('message')
        let timestamp = new Date()

        timestamp.setDate(timestamp.getDate() + days)
        timestamp.setHours(hour, minute, 0, 0)

        let reminder
        
        try {

            reminder = await user.createReminder(channel.id, timestamp, message)

            if (global.reminders.length < 1 || reminder.date < global.reminders[0].date) {

                global.reminders.unshift(reminder)
            }

        } catch (err) {

            interaction.editReply({ content: `Failed to create reminder because \`${err}\`.` })

            return
        }

        interaction.editReply({ content: `**Scheduled New Reminder**\n`
            + `ID: ${reminder.id}\n`
            + `Channel: <#${reminder.channelId}>\n`
            + `Date: <t:${reminder.date.valueOf() / 1000}:R> at <t:${reminder.date.valueOf() / 1000}:t>\n`
            + `Message: \`${reminder.message}\`` })
    }
}