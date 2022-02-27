const Database = require('./Database')
const Users = require('./Users')
const fs = require('fs')

module.exports = class Bank {

    static round(value) {

        return parseFloat(parseFloat(value).toFixed(2))
    }
    
    static format(value) {
    
        return `Ø${parseFloat(value).toLocaleString()}`
    }

    static async fetchBalance(user) {

        let rows = await Database.query('SELECT balance FROM users WHERE id = ?', [user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        if (rows.length < 1) {

            throw 'user could not be found'
        }

        return parseFloat(rows[0].balance)
    }

    static async transferMoney(sender, recipient, amount, reason = 'unspecified') {

        if (!await Users.existsUser(sender)) {

            await Users.createUser(sender)
        }

        if (!await Users.existsUser(recipient)) {

            throw 'user could not be found'
        }

        sender.balance = await this.fetchBalance(sender)
        amount = this.round(amount)

        if (amount <= 0) {

            throw 'amount must be greater than 0'
        }
    
        if (!sender.id) {
    
            throw 'invalid sender'
        }
    
        if (!recipient.id) {
    
            throw 'invalid recipient'
        }
    
        if (sender.balance < amount) {
    
            throw 'sender has insufficient funds'
        }
    
        await Database.query('UPDATE users SET balance = CASE WHEN id = ? THEN balance - ? WHEN id = ? THEN balance + ? END WHERE id IN (?, ?)', [sender.id, amount, recipient.id, amount, sender.id, recipient.id]).catch(err => {
    
            console.log(err)
    
            throw 'something went wrong when querying the database'
        })
    
        this.logTransaction(sender, recipient, amount, reason)

        return { sender: sender, recipient: recipient, amount: amount }
    }

    static logTransaction(sender, recipient, amount, reason) {

        let log = `[${new Date().toLocaleString()}] ${sender.username}#${sender.discriminator} (${sender.id}) | ${recipient.username}#${recipient.discriminator} (${recipient.id}) > ${amount.toLocaleString()} | ${reason}`
        fs.appendFileSync(`${__root}/logs/transactions.txt`, ('\n' + log))
    }
}