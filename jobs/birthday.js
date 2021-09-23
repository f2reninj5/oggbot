const oggbot = require(`${__root}/oggbot`)
const cron = require('cron')

module.exports = {

    data: {

        name: 'birthday',
        jobs: [

            {
                name: 'announce',
                description: 'Announce today\'s birthdays.'
            }
        ]
    },
    async execute() {

        const announce = new cron.CronJob('0 0 12 * * *', async () => {

            async function getBirthdayUsers() {

                let rows = await oggbot.queryPool(`SELECT id FROM users WHERE DAY(birthday) = DAY(NOW()) AND MONTH(birthday) = MONTH(NOW())`)
                let users = []

                if (rows.length < 1) {

                    return null
                }

                for (id of rows.map(row => row.id)) {

                    let user = oggbot.fetchUser(id)
                    users.push(user)
                }

                return users
            }

            let users = await getBirthdayUsers()

            if (!users) {

                return
            }

            let guild = await client.guilds.fetch('745569983542853643')
            let channels = await guild.channels.fetch()
            let channel = channels.filter(channel => channel.name == 'announcements')

            for (user of users) {

                channel.send({ content: `HAPPY BIRTHDAY ${user.username}!` })
            }

        }, { timeZone: 'Europe/London' })

        announce.start()
    }
}