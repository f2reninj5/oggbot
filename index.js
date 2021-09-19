// oggbot s3.0 by f2reninj5

// imports
const oggbot = require('./oggbot')
const { version, token } = require('./config.json')
const Discord = require('discord.js')

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGES] })

client.chatCommands = new Discord.Collection()
client.userCommands = new Discord.Collection()
client.messageCommands = new Discord.Collection()
client.jobs = new Discord.Collection()

async function loadApplicationCommands(collections) {

    for (collection of collections) {

        await collection.forEach(async command => {

            client.api.applications(client.user.id).guilds('795699156399685712').commands.post({ data: command.data })
            client.api.applications(client.user.id).commands.post({ data: command.data })
        })
    }
}

async function removeApplicationCommands(collections) {

    let applicationCommands = await client.api.applications(client.user.id).guilds('795699156399685712').commands.get()

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
            client.api.applications(client.user.id).guilds('795699156399685712').commands(applicationCommand.id).delete()
        }
    })
}

async function addUserToDatabase(user) {

    let rows = await oggbot.queryPool(`SELECT id FROM users WHERE id = '${user.id}'`)

    if (rows.length < 1) {

        await oggbot.queryPool(`INSERT INTO users (id) VALUES (${user.id})`)
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
    // await loadApplicationCommands([client.chatCommands, client.userCommands, client.messageCommands])

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