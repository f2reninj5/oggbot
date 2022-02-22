const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')
const cron = require('cron')
const path = require('path')
const fs = require('fs')

module.exports = {

    data: {

        name: 'available',
        jobs: [

            {
                name: 'start',
                description: 'Starts the available collector.'
            },
            {
                name: 'end',
                description: 'Ends the available collector.'
            }
        ]
    },
    async execute() {

        let guild = await oggbot.fetchHomeGuild()
        let currentHour = new Date().getHours()

        if (currentHour >= 12  && currentHour < 24) {

            let availableMessage = await createAvailableMessage(guild)

            const filter = button => !button.user.bot && ['available', 'game', 'occupied'].includes(button.customId)
            const availableCollector = availableMessage.createMessageComponentCollector({ filter })

            updateAvailable(availableCollector)
        }

        async function createAvailableMessage(guild) {

            let channel = (await guild.channels.fetch()).filter(channel => channel.name == 'available').first()
        
            if (!channel) {
        
                console.log('No channel found.')
                return
            }
        
            let messages = await channel.messages.fetch()
            let message = messages.filter(message => message.author.id == client.user.id).first()
        
            let availableMessage
            let availableEmbed = await createAvailableEmbed(guild)
        
            const buttonRow = new Discord.MessageActionRow()
                .addComponents(

                    new Discord.MessageButton()
                    .setCustomId('available')
                    .setLabel('Available')
                    .setEmoji('858366721873805312')
                    .setStyle('PRIMARY'),

                    // new Discord.MessageButton()
                    // .setCustomId('game')
                    // .setLabel('Game')
                    // .setEmoji('858634564184178689')
                    // .setStyle('PRIMARY'),

                    new Discord.MessageButton()
                    .setCustomId('occupied')
                    .setLabel('Occupied')
                    .setEmoji('858366721903165480')
                    .setStyle('PRIMARY')
                )

            if (!message) {
        
                availableMessage = await channel.send({ embeds: [availableEmbed], components: [buttonRow] })

            } else {
        
                availableMessage = await message.edit({ embeds: [availableEmbed], components: [buttonRow] })
            }
        
            return availableMessage
        }
        
        async function createAvailableEmbed(guild) {
        
            let data = fs.readFileSync(path.resolve(__dirname, './available.json'))
            let available = JSON.parse(data)['available'] || []
            let occupied = JSON.parse(data)['occupied'] || []
        
            const availableEmbed = new Discord.MessageEmbed()
                .setTitle('Gaming 20:00')
        
            let availableList = []
            for (i = 0; i < available.length; i ++) {
        
                let member = await guild.members.fetch(available[i][0])
                let game = available[i][1]
        
                availableList.push(`\`${member.displayName}\` wants to play \`${game}\``)
            }
            
            if (availableList.length > 0) {
        
            availableEmbed
                .addField('Available', availableList.join('\n'))
            }
            
            let occupiedList = []
            for (i = 0; i < occupied.length; i ++) {
        
                let member = await guild.members.fetch(occupied[i])
        
                occupiedList.push(`\`${member.displayName}\``)
            }
        
            if (occupiedList.length > 0) {
        
            availableEmbed
                .addField('Occupied', occupiedList.join('\n'))
            }
        
            return availableEmbed
        }
        
        function updateAvailable(collector) {
        
            collector.on('collect', async collected => {
                
                await collected.deferReply({ ephemeral: true })

                let user = collected.user
                let data = fs.readFileSync(path.resolve(__dirname, './available.json'))
                let available = JSON.parse(data)['available'] || []
                let occupied = JSON.parse(data)['occupied'] || []
        
                if (collected.customId == 'available') {
        
                    if (occupied.includes(user.id)) {
        
                        occupied = occupied.filter(u => u != user.id)
                    }
        
                    if (!available.map(u => u[0]).includes(user.id)) {
        
                        available.push([user.id, 'anything'])
                    }

                    
                    collected.editReply({ content: 'Setting your status as available.', ephemeral: true })
            
                } else if (collected.customId == 'game') {

                    if (occupied.includes(user.id)) {
        
                        occupied = occupied.filter(u => u != user.id)
                    }
        
                    let game

                    let message = await user.send({ content: 'You want to play: ' })
                    let channel = message.channel
                    game = await channel.awaitMessages(message => message.author.id == user.id, { max: 1, time: 1000 * 60 }).then(collected => {
    
                        console.log(collected)
                        return collected.first().content.replace(/\n/g, ' ').slice(0, 19)
                    })

                    try {
        
                        let message = await user.send({ content: 'You want to play:' })
                        let channel = message.channel
                        game = await channel.awaitMessages(message => message.author.id == user.id, { max: 1, time: 1000 * 60 }).first()
                        game = game.content.replace(/\n/g, ' ').slice(0, 19)

                        collected.editReply({ content: `Setting your preferred game as ${game}.` })
        
                    } catch {
        
                        game = 'anything'

                        collected.editReply({ content: `Unable to send message.` })
                    }
        
                    available = available.filter(u => u[0] != user.id)
                    available.push([user.id, game])
        
                } else if (collected.customId == 'occupied') {
            
                    if (!occupied.includes(user.id)) {
        
                        occupied.push(user.id)
                    }
        
                    if (available.map(u => u[0]).includes(user.id)) {
        
                        available = available.filter(u => u[0] != user.id)
                    }
            

                    collected.editReply({ content: 'Setting your status as occupied.', ephemeral: true })
                }
        
                fs.writeFileSync(path.resolve(__dirname, './available.json'), JSON.stringify({ 'available': available, 'occupied': occupied }))
                createAvailableMessage(await oggbot.fetchHomeGuild())
            })
        }
        
        const start = new cron.CronJob('0 0 12 * * *', async () => {
            
            let guild = await oggbot.fetchHomeGuild()
            let channel = (await guild.channels.fetch()).filter(channel => channel.name == 'available').first()
        
            if (!channel) {
        
                console.log('No channel found.')
                return
            }
        
            await channel.bulkDelete(100)
        
            fs.writeFileSync(path.resolve(__dirname, './available.json'), JSON.stringify({ 'available': [], 'occupied': [] }))
            let availableMessage = await createAvailableMessage(await oggbot.fetchHomeGuild())
            const filter = button => !button.user.bot && ['available', 'game', 'occupied'].includes(button.customId)
            const availableCollector = availableMessage.createMessageComponentCollector({ filter })
            updateAvailable(availableCollector)
        
        }, { timeZone: 'Europe/London' })
        
        start.start()
        
        const end = new cron.CronJob('0 0 0 * * *', async () => {
            
            try {

                availableCollector.stop()
                console.log('Available Collector Stopped.')

            } catch { }

            let guild = await oggbot.fetchHomeGuild()
            let channel = (await guild.channels.fetch()).filter(channel => channel.name == 'available').first()
        
            if (!channel) {
        
                console.log('No channel found.')
                return
            }
        
            channel.bulkDelete(100)
        
        }, { timeZone: 'Europe/London' })

        end.start()
    }
}