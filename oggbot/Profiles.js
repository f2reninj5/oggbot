const Database = require('./Database')

module.exports = class Profiles {

    static async setTitle(user, title) {

        if (title.length > 54) {

            throw 'the title was longer than 54 characters'
        }

        await Database.query('UPDATE profiles SET title = ? WHERE user_id = ?', [title, user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })
    }

    static async setLocation(user, location) {

        if (location.length > 44) {

            throw 'the title was longer than 44 characters'
        }

        await Database.query('UPDATE profiles SET location = ? WHERE user_id = ?', [location, user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })
    }

    static async setDescription(user, description) {

        if (description.length > 216) {

            throw 'the title was longer than 216 characters'
        }

        await Database.query('UPDATE profiles SET description = ? WHERE user_id = ?', [description, user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })
    }

    static async setStyle(user, styleId) {

        if (!await this.hasStyle(user, styleId)) {

            throw 'user does not own this style'
        }

        await Database.query('UPDATE profiles SET style = ? WHERE user_id = ?', [styleId, user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })
    }

    static async hasStyle(user, styleId) {

        let rows = await Database.query('SELECT style_id FROM user_styles WHERE user_id = ? AND style_id = ?', [user.id, styleId]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        if (rows.length < 1) {

            return false 
        }

        return true
    }

    static async fetchProfile(user) {

        let rows = await Database.query('SELECT title, location, description FROM profiles WHERE user_id = ?', [user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        if (rows.length < 1) {

            throw 'profile could not be found'
        }

        return rows[0]
    }

    static async fetchStyle(user) { // shorten query?

        let rows = await Database.query('SELECT styles.id AS id, styles.name AS name, styles.price AS price FROM profiles LEFT JOIN styles ON profiles.style = styles.id WHERE profiles.user_id = ?', [user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        if (rows.length < 1) {

            throw 'profile could not be found'
        }

        return rows[0]
    }
}