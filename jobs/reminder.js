const oggbot = require(`${__root}/oggbot`)
const cron = require('cron')

module.exports = {

    data: {

        name: 'reminders',
        jobs: [

            {
                name: 'check',
                description: 'Check for reminders to execute.'
            }
        ]
    },
    async execute() {

        const check = new cron.CronJob('0 * * * * *', async () => {

            let now = new Date()

            for (reminder of global.reminders) {

                if (reminder.date < now) {

                    await reminder.fetchAuthor()

                    let channel = await client.channels.fetch(reminder.channelId)
                    
                    channel.send({ content: `**<@${reminder.author.id}>'s Reminder**\n\`${reminder.message}\`` }).catch(err => {

                        console.log(err)
                    })
                    
                    reminder.author.deleteReminder(reminder.id)

                    global.reminders.shift()

                    if (global.reminders.length < 1) {
            
                        global.reminders = await oggbot.fetchUpcomingReminders()

                        break
                    }
                }
            }
        })

        global.reminders = await oggbot.fetchUpcomingReminders()

        check.start()
    }
}