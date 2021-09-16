const oggbot = require(`${__root}/oggbot`)

module.exports = {

    data: {

        name: 'set',
        description: 'Set your birthday.',
        type: 1,
        options: [

            {
                name: 'year',
                description: 'The year when you were born.',
                type: 4,
                required: true
            },
            {
                name: 'month',
                description: 'The month when you were born.',
                type: 3,
                required: true,
                choices: [

                    {
                        name: 'January',
                        value: 'jan'
                    },
                    {
                        name: 'February',
                        value: 'feb'
                    },
                    {
                        name: 'March',
                        value: 'mar'
                    },
                    {
                        name: 'April',
                        value: 'apr'
                    },
                    {
                        name: 'May',
                        value: 'may'
                    },
                    {
                        name: 'June',
                        value: 'jun'
                    },
                    {
                        name: 'July',
                        value: 'jul'
                    },
                    {
                        name: 'August',
                        value: 'aug'
                    },
                    {
                        name: 'September',
                        value: 'sep'
                    },
                    {
                        name: 'October',
                        value: 'oct'
                    },
                    {
                        name: 'November',
                        value: 'nov'
                    },
                    {
                        name: 'December',
                        value: 'dec'
                    }
                ]
            },
            {
                name: 'day',
                description: 'The day of the month when you were born.',
                type: 4,
                required: true
            }
        ],
        group: 'user'
    },
    async execute(interaction) {

        const user = await oggbot.fetchUser(interaction.user.id)
        const year = interaction.options.getInteger('year')
        const month = interaction.options.getString('month')
        const day = interaction.options.getInteger('day')
        const birthday = new Date(`${day} ${month} ${year}`)
        birthday.setHours(0, 0, 0, 0)

        if (birthday == 'Invalid Date' || year > new Date().getFullYear()) {

            interaction.editReply({ content: 'Invalid birthday.' })

            return
        }

        user.setBirthday(birthday)

        interaction.editReply({ content: `Set birthday to <t:${birthday.valueOf() / 1000}:d>.` })
    }
}