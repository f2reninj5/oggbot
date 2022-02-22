const Database = require('./Database')

module.exports = class Rankings {

    static async fetchRowCount(table) {

        let rows = await Database.query('SELECT COUNT(*) as count FROM ??', [table]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        return parseInt(rows[0].count)
    }

    static async fetchBalanceRankings(page, pageLength) {

        if (page < 1) {

            page = 1
        }

        let rowCount = await this.fetchRowCount('users')
        let pageCount = Math.ceil(rowCount / pageLength)

        if (page > pageCount) {

            page = pageCount
        }

        let rows = await Database.query('SELECT ROW_NUMBER() OVER (ORDER BY balance DESC) AS position, id, balance FROM oggdb.users LIMIT ?, ?', [((page - 1) * pageLength), pageLength]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        return { rows: rows, page: page, pageCount: pageCount }
    }
}