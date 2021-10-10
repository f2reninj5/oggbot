// oggbot s3.0 by f2reninj5

// imports
const oggbot = require('./oggbot')
const { version } = require('./config.json')
const { token } = require('./tokens.json')
const Discord = require('discord.js')

const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'] })

client.chatCommands = new Discord.Collection()
client.userCommands = new Discord.Collection()
client.messageCommands = new Discord.Collection()
client.jobs = new Discord.Collection()

async function addUserToDatabase(user) {

    let rows = await oggbot.queryPool(`SELECT id FROM users WHERE id = '${user.id}'`)

    if (rows.length < 1) {

        await oggbot.queryPool(`INSERT INTO users (id) VALUES (${user.id})`)
        await oggbot.queryPool(`UPDATE users SET balance = balance + 10000000 WHERE id = '${client.user.id}'`)
    }
}

// on bot start
client.on('ready', async () => {

    oggbot.loadCommands([client.chatCommands, client.userCommands, client.messageCommands], './commands')
    console.log('Commands loaded')
    oggbot.loadJobs(client.jobs, './jobs')
    console.log('Jobs loaded')
    oggbot.startJobs(client.jobs)
    console.log('Jobs started')
    // await oggbot.loadApplicationCommands([client.chatCommands, client.userCommands, client.messageCommands])
    // await oggbot.removeApplicationCommands([client.chatCommands, client.userCommands, client.messageCommands])
    oggbot.registerFonts('UbuntuMono')

    console.log(`Version: ${version}`)
})

client.on('interactionCreate', async interaction => {

    await addUserToDatabase(interaction.user)

    let command

    if (interaction.isCommand()) {

        command = client.chatCommands.get(interaction.commandName)

    } else if (interaction.isContextMenu()) {

        if (interaction.targetType == 'USER') {

            command = client.userCommands.get(interaction.commandName)

        } else if (interaction.targetType == 'MESSAGE') {

            command = client.messageCommands.get(interaction.commandName)
        }

    } else {

        return
    }

    await interaction.deferReply()

    try {

        command.execute(interaction)

    } catch {

        interaction.editReply('Phat error ennit.')
    }
})

// login
client.login(token)

global.client = client
global.__root = __dirname