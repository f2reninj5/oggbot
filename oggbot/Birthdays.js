const Database = require('./Database')
const Users = require('./Users')

module.exports = class Birthdays {

    static calculateDetails(birthday) {

        let now = new Date()
        let nextBirthday = new Date(birthday)

        nextBirthday.setFullYear(now.getFullYear())

        if (nextBirthday < now) {

            nextBirthday.setFullYear(nextBirthday.getFullYear() + 1)
        }

        let age = nextBirthday.getFullYear() - birthday.getFullYear() - 1

        return { age: age, nextBirthday: nextBirthday}
    }

    static async fetchBirthday(user) {

        let rows = await Database.query('SELECT birthday FROM users WHERE id = ?', [user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        if (rows.length < 1) {

            throw 'user could not be found'
        }

        let birthday = rows[0].birthday

        if (!birthday) {

            throw 'user has not set a birthday'
        }

        return new Date(birthday)
    }

    static async fetchNearestBirthday() {

        let rows = await Database.query('SELECT DATE_ADD(birthday, INTERVAL YEAR(CURDATE()) - YEAR(birthday) + IF(DAYOFYEAR(CURDATE()) >= DAYOFYEAR(birthday), 1, 0) YEAR) AS nearest_birthday FROM users WHERE birthday IS NOT NULL ORDER BY nearest_birthday ASC LIMIT 1').catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        if (rows.length < 1) {

            throw 'there are no upcoming birthdays'
        }

        return new Date(rows[0].nearest_birthday)
    }

    static async fetchUsersByBirthday(birthday) {

        let rows = await Database.query('SELECT id, birthday FROM users WHERE DAYOFYEAR(birthday) = DAYOFYEAR(?)', [birthday]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        if (rows.length < 1) {

            throw 'there are no users with that birthday'
        }
        
        for (let row of rows) {

            row.birthday = new Date(row.birthday)
        }

        return rows
    }

    static async setBirthday(user, birthday) {

        if (!await Users.existsUser(user)) {

            await Users.createUser(user)
        }

        await Database.query('UPDATE users SET birthday = ? WHERE id = ?', [birthday, user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })
    }
}