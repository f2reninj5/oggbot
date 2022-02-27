const Database = require('./Database')

module.exports = class Users {

    static async existsUser(user) {

        let rows = await Database.query('SELECT * FROM users WHERE id = ?', [user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        if (rows.length < 1) {

            return false
        }

        return true
    }

    static async createUser(user) {

        await Database.query('INSERT INTO users (id) VALUE (?)', [user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })
    }
}