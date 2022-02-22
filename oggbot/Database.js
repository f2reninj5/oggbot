const mysql = require('mysql2')
const { database } = require(`${__root}/tokens.json`)
const pool = mysql.createPool({
    
    host: database.host,
    user: database.user,
    password: database.password,
    database: database.database,
    charset : 'utf8mb4'
})

module.exports = class Database {

    static query(query, placeholders) {

        let result = new Promise((resolve, reject) => {
    
            pool.query(query, placeholders, (err, rows) => {
        
                if (err) {
        
                    return reject(err)
                }
        
                return resolve(rows)
            })
        })
    
        return result
    }
}