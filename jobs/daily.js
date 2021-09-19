const oggbot = require(`${__root}/oggbot`)
const cron = require('cron')

module.exports = {

    data: {

        name: 'daily',
        jobs: [

            {
                name: 'reset',
                description: 'Updates the daily column in database to 0.'
            }
        ]
    },
    execute() {

        const reset = new cron.CronJob('0 0 0 * * *', async () => {

            await oggbot.queryPool(`UPDATE users SET dailystreak = 0 WHERE daily = 0`)
            oggbot.queryPool(`UPDATE users SET daily = 0`)

        }, { timeZone: 'Europe/London' })

        reset.start()
    }
}