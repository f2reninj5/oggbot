const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')
const Canvas = require('canvas')
const path = require('path')

module.exports = {

    data: {

        name: 'pay',
        description: 'Sends money to another user.',
        type: 1,
        options: [

            {
                name: 'recipient',
                description: 'The user who will receive your payment.',
                type: '6',
                required: true
            },
            {
                name: 'amount',
                description: 'How much money will be sent to the recipient.',
                type: '10',
                required: true
            }
        ],

        group: 'money'
    },
    async execute(interaction) {

        // draw rectangle with rounded corners
        async function roundedRectangle(x, y, width, height, rounded, context) {

            const halfRadians = (2 * Math.PI) / 2
            const quarterRadians = (2 * Math.PI) / 4  
            
            context.arc(rounded + x, rounded + y, rounded, - quarterRadians, halfRadians, true)
            context.lineTo(x, y + height - rounded)
        
            context.arc(rounded + x, height - rounded + y, rounded, halfRadians, quarterRadians, true)  
            context.lineTo(x + width - rounded, y + height)
        
            context.arc(x + width - rounded, y + height - rounded, rounded, quarterRadians, 0, true)  
            context.lineTo(x + width, y + rounded)  
        
            context.arc(x + width - rounded, y + rounded, rounded, 0, - quarterRadians, true)  
            context.lineTo(x + rounded, y)  
        }

        async function createTransactionImage(sender, recipient, amount) {

            // create canvas
            const canvas = Canvas.createCanvas(480, 200)
            const context = canvas.getContext('2d')

            // load pay image and draw background
            const background = await Canvas.loadImage(path.resolve(__dirname, './pay.png'))
            context.drawImage(background, 0, 0, canvas.width, canvas.height)

            let avatarSize = 134

            // load avatar images
            const senderAvatar = await Canvas.loadImage(sender.displayAvatarURL({ format: 'jpg' }))
            const recipientAvatar = await Canvas.loadImage(recipient.displayAvatarURL({ format: 'jpg' }))

            // set text settings
            context.textBaseline = 'middle'
            context.fillStyle = '#e5e5e5'
            context.font = '24px calibri'
            context.textAlign = 'center'

            // write usernames
            context.fillText(sender.username, 106, (canvas.height / 2) + (avatarSize / 2) + 16)
            context.fillText(recipient.username, 374, (canvas.height / 2) + (avatarSize / 2) + 16)
            context.font = '36px calibri'
            context.fillText(oggbot.formatMoney(amount), canvas.width / 2, 16)

            // create rounded rectangle clipping mask
            context.beginPath(); 
            roundedRectangle(39, (canvas.height / 2) - (avatarSize / 2), avatarSize, avatarSize, 34, context)
            roundedRectangle(307, (canvas.height / 2) - (avatarSize / 2), avatarSize, avatarSize, 34, context)
            context.closePath()
            context.clip()

            // draw avatar images
            context.drawImage(senderAvatar, 39, (canvas.height / 2) - (avatarSize / 2), avatarSize, avatarSize)
            context.drawImage(recipientAvatar, 307, (canvas.height / 2) - (avatarSize / 2), avatarSize, avatarSize)

            // turn canvas into image attachment
            const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'transaction.png')

            return attachment
        }

        const sender = await oggbot.fetchUser(interaction.user.id)
        const recipient = await oggbot.fetchUser(interaction.options.getUser('recipient').id)
        const amount = oggbot.roundMoney(interaction.options.getNumber('amount'))

        if (!recipient.inDatabase) {

            interaction.editReply({ content: 'Recipient not in database.' })

            return
        }

        if (sender == recipient) {

            interaction.editReply({ content: 'You cannot pay yourself.' })

            return
        }

        if (amount > sender.balance) {

            interaction.editReply({ content: 'You do not have enough money for this transaction.' })

            return
        }

        if (amount < 1) {

            amount = 1
        }

        // create embed
        const transactionEmbed = new Discord.MessageEmbed()
            .setImage('attachment://transaction.png')
            .setFooter('Click confirm to continue.')

        const confirmationButton = new Discord.MessageActionRow()
            .addComponents(

                new Discord.MessageButton()
                    .setCustomId('confirmTransaction')
                    .setLabel('Confirm')
                    .setStyle('PRIMARY')
            )

        const transactionImage = await createTransactionImage(sender, recipient, amount)

        // reply embed
        await interaction.editReply({ embeds: [transactionEmbed], files: [transactionImage], components: [confirmationButton] })

        const filter = button => button.customId == 'confirmTransaction' && button.user.id == sender.id
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 1000 * 10 })

        collector.on('collect', async collected => {

            if (collected.customId == 'confirmTransaction') {

                oggbot.moneyTransaction(sender, recipient, amount, 'pay', true, interaction)

                // update embed
                transactionEmbed
                    .setColor('#40a45c')
                    .setFooter('Transaction complete.')

                collected.update({ embeds: [transactionEmbed], files: [transactionImage], components: [] })

                collector.stop()
            }
        })

        collector.on('end', async collected => {

            if (collected.size < 1) {

                transactionEmbed
                    .setColor('#f04444')
                    .setFooter('Transaction cancelled.')

                interaction.editReply({ embeds: [transactionEmbed], files:[transactionImage], components: [] })
            }
        })
    }
}