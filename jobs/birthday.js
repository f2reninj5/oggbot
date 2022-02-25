const { Birthdays } = require(`${__root}/oggbot/index`)
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

        const announce = new cron.CronJob('0 0 16 * * *', async () => {

            try {

                let birthday = await Birthdays.fetchNearestBirthday()
                let users = await Birthdays.fetchUsersByBirthday(birthday)
                let lines = []

                for (let row of users) {

                    let user = await client.users.fetch(row.id)
                    let details = Birthdays.calculateDetails(row.birthday)

                    lines.push(`HAPPY BIRTHDAY! ${user.username} is now ${details.age}!`)
                }
                
                let guild = await client.guilds.fetch('745569983542853643')
                let channels = await guild.channels.fetch()
                let channel = channels.filter(channel => channel.name == 'announcements').first()
                
                await channel.send({ content: lines.join('\n') })
                
            } catch (err) {

                console.log(err)
            }

        }, { timeZone: 'Europe/London' })

        announce.start()
    }
}