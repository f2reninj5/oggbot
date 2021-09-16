const Discord = require('discord.js')
const Canvas = require('canvas')

module.exports = {

    data: {
        
        name: 'caption',
        description: 'Add captions to an image.',
        type: 1,
        options: [

            {
                name: 'top',
                description: 'Text to add to the top of the image.',
                type: 3
            },
            {
                name: 'bottom',
                description: 'Text to add to the bottom of the image.',
                type: 3
            }
        ],

        group: 'fun'
    },
    async execute(interaction) {

        async function urlIsValid(url) {

            let format = url.split('.')
            format = format[format.length - 1]

            if (['png', 'jpg', 'jpeg'].includes(format)) {

                return true

            } else {

                return
            }
        }

        // generate and send image with caption
        async function createCaptionImage(image, caption) {

            // calculate new width in same ratio
            const height = 480
            const width = (height / image.height) * image.width

            // create canvas
            const canvas = Canvas.createCanvas(width, height)
            const context = canvas.getContext('2d')

            // set background to uploaded image
            const background = await Canvas.loadImage(image.url)
            context.drawImage(background, 0, 0, canvas.width, canvas.height)

            let textHeight

            // set text settings
            context.textAlign = 'center'
            context.fillStyle = 'white'
            context.strokeStyle = 'black'
            context.lineJoin = 'round'

            context.textBaseline = 'top'
            textHeight = 80
            context.font = `${textHeight}px Impact`

            if (caption.top) {

                // resize font until it fits
                while (context.measureText(caption.top).width > canvas.width) {

                    context.font = `${textHeight -= 4}px Impact`
                }

                // write top text
                context.lineWidth =  Math.ceil(textHeight / 10)
                context.strokeText(caption.top, width / 2, 16)
                context.fillText(caption.top, width / 2, 16)

                context.textBaseline = 'bottom'
                textHeight = 80
                context.font = `${textHeight}px Impact`
            }

            if (caption.bottom) {

                // resize font until it fits
                while (context.measureText(caption.bottom).width > canvas.width) {

                    if (textHeight <= 4) {
                        break
                    }

                    context.font = `${textHeight -= 4}px Impact`
                }
                
                // write bottom text
                context.lineWidth =  Math.ceil(textHeight / 10)
                context.strokeText(caption.bottom, width / 2, height - 16)
                context.fillText(caption.bottom, width / 2, height - 16)
            }

            // turn canvas into image attachment
            const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'image.png')

            return attachment
        }

        let caption = {

            top: interaction.options.getString('top'),
            bottom: interaction.options.getString('bottom')
        }

        await interaction.editReply({ content: 'Now send your image.' })

        const filter = message => message.author.id == interaction.user.id && message.attachments.size > 0
        const collector = interaction.channel.createMessageCollector({ filter, time: 1000 * 30 })

        collector.on('collect', async collected => {

            let image = collected.attachments.first()

            try {

                collected.delete()

            } catch {}

            if (!await urlIsValid(image.url)) {

                interaction.editReply({ content: 'Invalid image.' })

                return
            }

            // create embed
            const captionEmbed = new Discord.MessageEmbed()
            .setFooter(`${interaction.user.username}#${interaction.user.discriminator}`)
            .setImage('attachment://image.png')

            const captionImage = await createCaptionImage(image, caption)

            // reply embed
            interaction.editReply({ content: 'Here is your image:', embeds: [captionEmbed], files: [captionImage] })
        })

        collector.on('end', async collected => {

            if (collected.size < 1) {

                interaction.editReply({ content: 'Caption cancelled.' })
            }
        })
    }
}