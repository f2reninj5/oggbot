const oggbot = require(`${__root}/oggbot`)

module.exports = class Bank {

    static round(value) {

        return parseFloat(parseFloat(value).toFixed(2))
    }
    
    static format(value) {
    
        return `Ø${parseFloat(value).toLocaleString()}`
    }

    static async fetchBalance(user) {

        let rows = await oggbot.queryPool('SELECT balance FROM users WHERE id = ?', [user.id]).catch(err => {

            console.log(err)

            throw 'something went wrong when querying the database'
        })

        if (rows.length < 1) {

            throw 'user could not be found'
        }

        return parseFloat(rows[0].balance)
    }

    static async transferMoney(sender, recipient, amount, reason = 'unspecified') {

        sender.balance = this.fetchBalance(sender)
        recipient.balance = this.fetchBalance(recipient) // ensures that recipient exists in database

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
    
        await oggbot.queryPool('UPDATE users SET balance = CASE WHEN id = :senderId THEN balance - :amount WHEN id = :recipientId THEN balance + :amount END WHERE id IN (:senderId, :recipientId)', { senderId: sender.id, recipientId: recipient.id, amount: amount }).catch(err => {
    
            console.log(err)
    
            throw 'something went wrong when querying the database'
        })
    
        let log = `[${new Date().toLocaleString()}] ${sender.username}#${sender.discriminator} (${sender.id}) | ${recipient.username}#${recipient.discriminator} (${recipient.id}) > ${amount.toLocaleString()} | ${reason}`
        fs.appendFileSync(path.resolve(__root, '/logs/transactionLogs.txt'), ('\n' + log))
    }
}