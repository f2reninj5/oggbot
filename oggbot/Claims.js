const Bank = require('./Bank')
const Database = require('./Database')
const Users = require('./Users')
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

        if (!await this.existsClaimant(user)) {

            await this.createClaimant(user)
        }

        if (await this.hasClaimedDaily(user)) {

            throw 'user has already claimed daily'
        }

        let amount = this.randomValue(dailyValues.minimum, dailyValues.maximum)
        let streak = await this.fetchDailyStreak(user) + 1

        if (streak >= 5) {

            amount += dailyValues.bonus
        }

        await Bank.transferMoney(client.user, user, amount, 'daily')

        await Database.query('UPDATE dailies SET claimed = ?, streak = ? WHERE user_id = ?', [1, (streak % dailyValues.maxStreak), user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        return { amount: amount, streak: { value: streak, max: dailyValues.maxStreak } }
    }

    static async hasClaimedDaily(user) {

        let rows = await Database.query('SELECT claimed FROM dailies WHERE user_id = ?', [user.id]).catch(err => {

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

        let rows = await Database.query('SELECT streak FROM dailies WHERE user_id = ?', [user.id]).catch(err => {

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

        await Database.query('UPDATE dailies SET streak = 0 WHERE claimed = 0').catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        await Database.query('UPDATE dailies SET claimed = 0').catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })
    }

    static async existsClaimant(user) {

        let rows = await Database.query('SELECT * FROM dailies WHERE user_id = ?', [user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        if (rows.length < 1) {

            return false
        }

        return true
    }

    static async createClaimant(user) {

        if (!await Users.existsUser(user)) {

            await Users.createUser(user)
        }

        await Database.query('INSERT INTO dailies (user_id) VALUE (?)', [user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })
    }
}