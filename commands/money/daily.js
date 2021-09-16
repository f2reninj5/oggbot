const oggbot = require(`${__root}/oggbot`)
const { dailyValues } = require(`${__root}/config.json`)

module.exports = {

    data: {

        name: 'daily',
        description: 'Pays you your daily allowance.',
        type: 1,

        group: 'money'
    },
    async execute(interaction) {

        // generate a random value within a range
        function randomInteger(minimum, maximum) {

            let randomInteger = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum

            return randomInteger
        }

        // generate streak string for display
        function generateStreak(streakValue) {

            let streak = ''

            // for number of stars
            for (i = 0; i <= 4; i ++) {

                // check if star is full or empty
                if (i <= streakValue) {

                    streak += '★'

                } else {

                    streak += '☆'

                }
            }

            return streak
        }

        // create date for next daily
        function createNextDailyDate() {

            // create date for tomorrow at 00:00:00
            let nextDaily = new Date()
            nextDaily.setDate(nextDaily.getDate() + 1)
            nextDaily.setHours(0, 0, 0, 0)

            return nextDaily
        }

        const user = await oggbot.fetchUser(interaction.user.id)
        let amount = randomInteger(dailyValues.minimum, dailyValues.maximum)

        // check if daily complete
        if (user.daily.used) {

            let nextDailyDate = createNextDailyDate()
            let timestamp = `<t:${nextDailyDate.valueOf() / 1000}:R>`

            // send time until next daily
            interaction.editReply(`Claim your daily bonus again **${timestamp}**.`)
            
            return
        }

        let currentStreak = user.daily.streak
        user.daily.used = true
        user.daily.streak += 1

        // check if streak is finished
        if (user.daily.streak >= 5) {

            amount += dailyValues.bonus
            user.daily.streak = 0
        }

        user.setDaily(user.daily)
        oggbot.moneyTransaction(client.user, user, amount, 'daily')

        // send amount received with streak
        interaction.editReply(`Received ${oggbot.formatMoney(amount)}.\n\`${generateStreak(currentStreak)}\``)
    }
}