
const Bank = require('./index')
const oggbot = require(`${__root}/oggbot`)
const { lotteryValues } = require(`${__root}/config.json`)

module.exports = class Lottery {

    static async buyTicket(user) {

        if (await this.hasTicket(user)) {

            throw 'user has already bought a lottery ticket'
        }

        let value = lotteryValues.ticketPrice + Bank.round(lotteryValues.ticketPrice * lotteryValues.bonusRatio)
    
        await Bank.transferMoney(user, client.user, lotteryValues.ticketPrice, 'lottery ticket')

        oggbot.queryPool('INSERT INTO lottery (user_id, amount) VALUES (?, ?)', [user.id, value]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })
    }

    static async hasTicket(user) {

        let rows = await oggbot.queryPool('SELECT * FROM lottery WHERE id = ?', [user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        if (rows.length < 1) {

            return false
        }

        return true
    }

    static calculateNextDrawDate() {

        let targetDay = 6 // saturday
        let now = new Date()
        let nextDrawDate = new Date(now)

        if (now.getHours() < 16) {

            now.setDate(now.getDate() - 1)
        }

        nextDrawDate.setDate(now.getDate() + ((targetDay - now.getDay() + 6) % 7) + 1)
        nextDrawDate.setHours(16, 0, 0, 0)

        return nextDrawDate
    }

    static async fetchStats() {

        let rows = await oggbot.queryPool('SELECT SUM(amount) AS potValue, COUNT(*) AS entryCount FROM lottery').catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        let stats = {

            potValue: rows[0].potValue || 0,
            entryCount: rows[0].entryCount || 0,
            ticket: {

                price: lotteryValues.ticketPrice,
                bonus: Bank.round(lotteryValues.ticketPrice * lotteryValues.bonusRatio)
            },
            nextDrawDate: this.calculateNextDrawDate()
        }

        return stats
    }

    static async fetchWinners() {

        let rows = await oggbot.queryPool('SELECT user_id, timestamp, amount FROM lottery_winners ORDER BY timestamp DESC LIMIT 6').catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        let winners = []

        for (row of rows) {

            winners.push({

                user: await client.users.fetch(row.user_id),
                timestamp: new Date(row.timestamp),
                amount: row.amount
            })
        }

        return winners
    }
    
    static async drawWinner() {

        let rows = await oggbot.queryPool('SELECT user_id FROM lottery ORDER BY RAND() LIMIT 1').catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        let lotteryStats = this.fetchStats()

        let winner = {

            user: await client.users.fetch(rows[0].user_id),
            winnings: lotteryStats.potValue
        }

        await Bank.transferMoney(client.user, winner.user, winner.winnings, 'lottery winner')
        await oggbot.queryPool('DELETE FROM lottery').catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        return winner
    }
}