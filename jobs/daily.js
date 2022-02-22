const { Claims } = require(`${__root}/oggbot/index`)
const cron = require('cron')

module.exports = {

    data: {

        name: 'daily',
        jobs: [

            {
                name: 'reset',
                description: 'Resets daily claims and streaks.'
            }
        ]
    },
    async execute() {

        const reset = new cron.CronJob('0 0 0 * * *', async () => {

            try {

                await Claims.progressDailies()

            } catch (err) {

                console.log(err)
            }

        }, { timeZone: 'Europe/London' })

        reset.start()
    }
}