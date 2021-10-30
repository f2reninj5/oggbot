const { sql } = require('./tokens.json')
const Discord = require('discord.js')
const mysql = require('mysql')
const Canvas = require('canvas')
const path = require('path')
const fs = require('fs')
const pool = mysql.createPool({
    
    host: sql.host,
    user: sql.user,
    password: sql.password,
    database: sql.database,
    charset : 'utf8mb4'
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

async function loadApplicationCommands(collections, guildId) {

    if (guildId) {

        for (collection of collections) {

            await collection.forEach(async command => {
    
                await client.api.applications(client.user.id).guilds(guildId).commands.post({ data: command.data })
            })
        }

    } else {

        for (collection of collections) {

            await collection.forEach(async command => {
    
                await client.api.applications(client.user.id).commands.post({ data: command.data })
            })
        }
    }
}

async function removeApplicationCommands(collections, guildId) {

    if (guildId) {

        let applicationCommands = await client.api.applications(client.user.id).guilds(guildId).commands.get()

        applicationCommands.forEach(async applicationCommand => {
            
            let command

            for (i = 0; i < 3; i ++) {

                command = collections[i].find(command => command.data.name == applicationCommand.name && command.data.type == applicationCommand.type)

                if (command) {

                    break
                }
            }

            if (!command) {

                console.log(`Deleting ${applicationCommand.name}, type ${applicationCommand.type}`)
                await client.api.applications(client.user.id).guilds(guildId).commands(applicationCommand.id).delete()
            }
        })

    } else {

        let applicationCommands = await client.api.applications(client.user.id).commands.get()

        applicationCommands.forEach(async applicationCommand => {
            
            let command

            for (i = 0; i < 3; i ++) {

                command = collections[i].find(command => command.data.name == applicationCommand.name && command.data.type == applicationCommand.type)

                if (command) {

                    break
                }
            }

            if (!command) {

                console.log(`Deleting ${applicationCommand.name}, type ${applicationCommand.type}`)
                await client.api.applications(client.user.id).commands(applicationCommand.id).delete()
            }
        })
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

function sanitiseSQLInput(input) {

    return input.replace(/\'/g, `''`).replace(/\\/g, '')
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

async function fetchHomeGuild() {

    let guild = await client.guilds.fetch(guildIds.home)

    return guild
}

async function fetchDevGuild() {

    let guild = await client.guilds.fetch(guildIds.dev)

    return guild
}

function registerFonts(name) {

    Canvas.registerFont(`fonts/${name}/Regular.ttf`, { family: 'Oggbot', weight: 'regular', style: 'regular' })
    Canvas.registerFont(`fonts/${name}/Bold.ttf`, { family: 'Oggbot', weight: 'bold', style: 'regular' })
    Canvas.registerFont(`fonts/${name}/Italic.ttf`, { family: 'Oggbot', weight: 'regular', style: 'italic' })
    Canvas.registerFont(`fonts/${name}/BoldItalic.ttf`, { family: 'Oggbot', weight: 'bold', style: 'italic' })
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

        if (rows.length < 1) {

            this.inDatabase = false
            
            return
        }

        await this.#packBalance(rows)
        await this.#packBirthday(rows)
        await this.#packDaily(rows)
        this.inDatabase = true
    }

    async #fetchLotteryData() {

        let rows = await queryPool(`SELECT id, amount FROM lottery WHERE id = '${this.id}'`)

        await this.#packLottery(rows)
    }

    async fetchDetails() {

        let row = (await queryPool(`SELECT title, location, description FROM users WHERE id = '${this.id}'`))[0]
        let details = {

            id: this.id,
            title: row.title,
            location: row.location,
            description: row.description
        }
        
        this.details = details
    }

    async fetchStyles() {

        let styles = {
            
            id: this.id,
            selected: null,
            owned: null
        }
        let rows = await queryPool(`SELECT selected, owned FROM styles WHERE id = '${this.id}'`)
        
        if (rows.length < 1) {
    
            await queryPool(`INSERT INTO styles (id, selected, owned) VALUES (${this.id}, ${styles.selected}, ${JSON.stringify(styles.owned)})`)

        } else {

            let row = rows[0]

            styles.selected = row.selected
            styles.owned = JSON.parse(row.owned)
        }

        this.styles = styles
    }

    async #packBalance(rows) {

        this.balance = rows[0].balance
    }

    async #packBirthday(rows) {

        let now = new Date()
        let birthday
        let upcomingBirthday
        let age

        if (!rows[0].birthday) {

            birthday = null
            upcomingBirthday = null
            age = null

        } else {

            birthday = new Date(rows[0].birthday)
            age = now.getFullYear() - birthday.getFullYear() - 1
            upcomingBirthday = new Date(birthday)
            upcomingBirthday.setFullYear(now.getFullYear())

            if (upcomingBirthday < now) {

                upcomingBirthday.setFullYear(upcomingBirthday.getFullYear() + 1)
                age += 1
            }
        }

        this.birthday = birthday
        this.upcomingBirthday = upcomingBirthday
        this.age = age
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

    async setBirthday(date) {

        let sqlDate = date

        if (date) {

            sqlDate = `'${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}'`
        }

        queryPool(`UPDATE users SET birthday = ${sqlDate} WHERE id = '${this.id}'`)
    }

    async setDaily(daily) {

        if (daily.used) {

            daily.used = 1

        } else {

            daily.used = 0
        }

        queryPool(`UPDATE users SET daily = ${daily.used}, dailystreak = ${daily.streak} WHERE id = '${this.id}'`)
    }

    async setDetails(details) {

        let sqlDetails = []

        if (details.title || details.title == '') {

            details.title = sanitiseSQLInput(details.title)

            if (details.title.length > 54) {

                throw ['Title', 'the character limit is 54']
            }

            sqlDetails.push(`title = '${details.title}'`)
        }

        if (details.location || details.location == '') {

            details.location = sanitiseSQLInput(details.location)

            if (details.location.length > 44) {

                throw ['Location', 'the character limit is 44']
            }

            sqlDetails.push(`location = '${details.location}'`)
        }

        if (details.description || details.description == '') {

            details.description = sanitiseSQLInput(details.description)

            if (details.description.length > 216) {

                throw ['Description', 'the character limit is 216']
            }

            sqlDetails.push(`description = '${details.description}'`)
        }

        queryPool(`UPDATE users SET ${sqlDetails.join(', ')} WHERE id = '${this.id}'`)
    }

    async setStyle(style) {

        let sqlStyle = style

        if (style) {

            await this.fetchStyles()

            if (this.styles.owned === null || !this.styles.owned.includes(style)) {

                throw 'you do not own this style'
            }

            if (this.styles.selected == style) {

                throw 'you already have this style selected'
            }

            sqlStyle = `'${style}'`
        }

        queryPool(`UPDATE styles SET selected = ${sqlStyle} WHERE id = '${this.id}'`)
    }
}

module.exports = {

    User: User,

    fetchUser: fetchUser,
    fetchHomeGuild: fetchHomeGuild,
    fetchDevGuild: fetchDevGuild,
    loadCommands: loadCommands,
    loadSubcommands: loadSubcommands,
    loadJobs: loadJobs,
    loadApplicationCommands: loadApplicationCommands,
    removeApplicationCommands: removeApplicationCommands,
    startJobs: startJobs,
    roundMoney: roundMoney,
    formatMoney: formatMoney,
    queryPool: queryPool,
    moneyTransaction: moneyTransaction,
    registerFonts: registerFonts
}