const Bank = require('./index')
const oggbot = require(`${__root}/oggbot`)
const { dailyValues } = require(`${__root}/config`)

module.exports = class Claims {

    static randomValue(minimum, maximum) {

        return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
    }

    static generateStreak(value, maximum) {

        if (maximum < 1) {

            throw 'streak maximum must be at least 1'
        }

        let streak = ''

        for (let i = 0; i <= maximum - 1; i ++) {

            streak += (i < value ? '★' : '☆')
        }

        return streak
    }

    static async collectDailyClaim(user) {

        if (await this.hasClaimedDaily(user)) {

            throw 'user has already claimed daily'
        }

        let amount = this.randomValue(dailyValues.minimum, dailyValues.maximum)
        let streak = await this.fetchDailyStreak(user) + 1

        if (streak >= 5) {

            amount += dailyValues.bonus
        }

        await Bank.transferMoney(client.user, user, amount, 'daily')

        await oggbot.queryPool('UPDATE dailies SET claimed = ?, streak = ? WHERE user_id = ?', [1, (streak % dailyValues.maxStreak), user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        return { amount: amount, streak: streak }
    }

    static async hasClaimedDaily(user) {

        let rows = await oggbot.queryPool('SELECT claimed FROM dailies WHERE user_id = ?', [user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        if (rows.length < 1) {

            throw 'user could not be found'
        }

        if (rows[0].claimed == 0) {

            return false
        }

        return true
    }

    static calculateNextDailyDate() {

        // create date for tomorrow at 00:00:00
        let date = new Date()
        date.setDate(date.getDate() + 1)
        date.setHours(0, 0, 0, 0)

        return date
    }

    static async fetchDailyStreak(user) {

        let rows = await oggbot.queryPool('SELECT streak FROM dailies WHERE id = ?', [user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        if (rows.length < 1) {

            throw 'user could not be found'
        }

        return parseInt(rows[0].streak)
    }

    // resets claims and streaks accordingly
    static async progressDailies() {

        await oggbot.queryPool('UPDATE dailies SET streak = 0 WHERE daily = 0').catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        await oggbot.queryPool('UPDATE dailies SET daily = 0').catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })
    }
}