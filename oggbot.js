const { sql } = require('./config.json')
const Discord = require('discord.js')
const mysql = require('mysql')
const path = require('path')
const fs = require('fs')
const pool = mysql.createPool({
    host: sql.host,
    user: sql.user,
    password: sql.password,
    database: sql.database
})

function loadCommands(collections, directory) {

    let commandFiles = fs.readdirSync(directory)

    for (file of commandFiles) {

        let path = `${directory}/${file}`

        if (file.endsWith('.js')) {

            let command = require(path)
            let type = command.data.type

            collections[type - 1].set(command.data.name, command)

        } else if (fs.lstatSync(path).isDirectory() && file != 'subcommands') {

            loadCommands(collections, path)
        }
    }
}

function loadSubcommands(groups, directory) {

    let subcommandFiles = fs.readdirSync(directory)
        
    for (file of subcommandFiles) {

        let path = `${directory}/${file}`

        if (file.endsWith('.js')) {

            let subcommand = require(path)
            let groupName = 'none'

            if (subcommand.data.group) {

                groupName = subcommand.data.group

                if (!groups[groupName]) {

                    let group = new Discord.Collection()
                    groups[groupName] = group
                }
            }

            groups[groupName].set(subcommand.data.name, subcommand)

        } else if (fs.lstatSync(path).isDirectory()) {

            loadSubcommands(groups, path)
        }
    }
}

function loadJobs(collection, directory) {

    let jobFiles = fs.readdirSync(directory)

    for (file of jobFiles) {

        let path = `${directory}/${file}`

        if (file.endsWith('.js')) {

            let job = require(path)

            collection.set(job.data.name, job)

        } else if (fs.lstatSync(path).isDirectory()) {

            loadJobs(collection, path)
        }
    }
}

function startJobs(collection) {

    for (jobName of collection.map(job => job.data.name)) {

        let job = collection.get(jobName)
        
        job.execute()
    }
}

function roundMoney(money) {

    return parseFloat(parseFloat(money).toFixed(2))
}

function formatMoney(money) {

    return `Ø${money.toLocaleString()}`
}

function queryPool(query) {

    let result = new Promise((resolve, reject) => {

        pool.query(query, (err, rows) => {
    
            if (err) {
    
                return reject(err)
            }
    
            return resolve(rows)
        })
    })

    return result
}

async function moneyTransaction(sender, recipient, amount, note, notify = false, interaction) {

    if (amount <= 0) {

        throw 'amount must be greater than 0'
    }

    if (!sender.id) {

        throw 'invalid sender'
    }

    if (!recipient.id) {

        throw 'invalid recipient'
    }

    await queryPool(`UPDATE users SET balance = balance - ${amount} WHERE id = '${sender.id}'`)
    await queryPool(`UPDATE users SET balance = balance + ${amount} WHERE id = '${recipient.id}'`)

    let log = `[${new Date().toLocaleString()}] ${sender.username}#${sender.discriminator} (${sender.id}) | ${recipient.username}#${recipient.discriminator} (${recipient.id}) > ${amount.toLocaleString()} | ${note}`
    fs.appendFileSync(path.resolve(__dirname, './transactionLogs.txt'), ('\n' + log))

    if (notify) {

        try {

            await recipient.send({ content: `Incoming payment:\n\`${sender.username}#${sender.discriminator} | ${formatMoney(amount)}\`` })

        } catch {

            interaction.followUp({ content: 'Unable to DM recipient.', ephemeral: true })
        }
    }
}

async function fetchUser(id) {

    let user = await client.users.fetch(id)
    user = new User(user)

    await user.initialise()

    return user
}

class User extends Discord.User {

    constructor(user) {

        super(user.client, user)
    }

    async initialise() {

        await this.#fetchUserData()
        await this.#fetchLotteryData()
    }

    async #fetchUserData() {

        let rows = await queryPool(`SELECT balance, birthday, daily, dailystreak FROM users WHERE id = '${this.id}'`)

        await this.#packBalance(rows)
        await this.#packBirthday(rows)
        await this.#packDaily(rows)
    }

    async #fetchLotteryData() {

        let rows = await queryPool(`SELECT id, amount FROM lottery WHERE id = '${this.id}'`)

        await this.#packLottery(rows)
    }

    async #packBalance(rows) {

        this.balance = rows[0].balance
    }

    async #packBirthday(rows) {

        let birthday

        if (!rows[0].birthday) {

            birthday = null

        } else {

            birthday = new Date(rows[0].birthday)
        }

        this.birthday = birthday
    }

    async #packDaily(rows) {

        let daily = {

            streak: rows[0].dailystreak
        }

        if (rows[0].daily == 0) {

            daily.used = false

        } else {

            daily.used = true
        }

        this.daily = daily
    }

    async #packLottery(rows) {

        let lottery = {

            tickets: []
        }

        if (rows.length < 1) {

            lottery.tickets = null

        } else {

            await rows.forEach(async row => {

                lottery.tickets.push({

                    id: row.id,
                    amount: row.amount
                })
            })
        }

        this.lottery = lottery
    }

    async getBalance() {

        let rows = await queryPool(`SELECT balance FROM users WHERE id = '${this.id}'`)

        this.balance = rows[0].balance
        return this.balance
    }

    async getBirthday() {

        let rows = await queryPool(`SELECT UNIX_TIMESTAMP(birthday) AS birthday FROM users WHERE id = '${this.id}' AND birthday IS NOT NULL`)
        let birthday

        if (rows.length < 1) {

            birthday = null

        } else {

            birthday = new Date(rows[0].birthday * 1000)
        }

        this.birthday = birthday
        return this.birthday
    }

    async setBirthday(date) {

        let sqlDate = date

        if (date) {

            sqlDate = `'${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}'`
        }

        queryPool(`UPDATE users SET birthday = ${sqlDate} WHERE id = '${this.id}'`)
    }

    async getDaily() {

        let rows = await queryPool(`SELECT daily, dailystreak FROM users WHERE id = '${this.id}'`)
        let daily = {

            streak: rows[0].dailystreak
        }

        if (rows[0].daily == 0) {

            daily.used = false

        } else {

            daily.used = true
        }

        this.daily = daily
        return this.daily
    }

    async setDaily(daily) {

        if (daily.used) {

            daily.used = 1

        } else {

            daily.used = 0
        }

        queryPool(`UPDATE users SET daily = ${daily.used}, dailystreak = ${daily.streak} WHERE id = '${this.id}'`)
    }

    async getLottery() {

        let rows = await queryPool(`SELECT amount FROM lottery WHERE id = '${this.id}'`)
        let lottery = {

            tickets: []
        }

        if (rows.length < 1) {

            lottery.tickets = null

        } else {

            await rows.forEach(async row => {

                lottery.tickets.push({

                    id: row.id,
                    amount: row.amount
                })
            })
        }

        this.lottery = lottery
        return this.lottery
    }
}

module.exports = {

    User: User,

    fetchUser: fetchUser,
    loadCommands: loadCommands,
    loadSubcommands: loadSubcommands,
    loadJobs: loadJobs,
    startJobs: startJobs,
    roundMoney: roundMoney,
    formatMoney: formatMoney,
    queryPool: queryPool,
    moneyTransaction: moneyTransaction
}