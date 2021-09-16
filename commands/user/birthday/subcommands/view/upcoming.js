const oggbot = require(`${__root}/oggbot`)

module.exports = {

    data: {
        name: 'upcoming',
        description: 'View nearest upcoming birthdays.',
        type: 1,
        group: 'view'
    },
    async execute(interaction) {

        async function getUpcomingBirthdays() {

            let rows = await oggbot.queryPool(`SELECT IFNULL((SELECT birthday FROM users WHERE (MONTH(birthday) >= MONTH(NOW()) AND DAY(birthday) >= DAY(NOW())) OR (MONTH(birthday) > MONTH(NOW())) ORDER BY MONTH(birthday), DAY(birthday) ASC LIMIT 1), (SELECT birthday FROM users WHERE birthday IS NOT NULL ORDER BY MONTH(birthday), DAY(birthday) ASC LIMIT 1)) AS birthday`)
            let birthday = new Date(rows[0].birthday)
            let now = new Date
            birthday.setFullYear(now.getFullYear())

            if (birthday < now) {

                birthday.setFullYear(birthday.getFullYear() + 1)
            }
            
            rows = await oggbot.queryPool(`SELECT id FROM users WHERE MONTH(birthday) = ${birthday.getMonth() + 1} AND DAY(birthday) = ${birthday.getDate()}`)
            let birthdays = {

                date: birthday,
                users: []
            }

            for (row of rows) {

                birthdays.users.push(await oggbot.fetchUser(row.id))
            }

            return birthdays
        }

        const birthdays = await getUpcomingBirthdays()
        let usernames = birthdays.users.map(user => user.username)
        
        // reply embed
        interaction.editReply({ content: `**<t:${birthdays.date.valueOf() / 1000}:R>**\n${usernames.join(', ')}` })
    }
}