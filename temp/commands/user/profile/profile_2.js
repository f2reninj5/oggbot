const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')
const Canvas = require('canvas')
const path = require('path')

module.exports = {

    data: {

        name: 'profile',
        type: 2,

        group: 'user'
    },
    async execute(interaction) {

        function wrapParagraph(paragraph, maxWidth, maxLines, context) {

            function wrapLine(line, hardWrap = false) {

                let width = context.measureText(line).width

                if (!hardWrap) {

                    line = line.split(/(?<=[ |\-|_|\/])/)
                }
    
                    let currentLine = line
                    let difference = 0
    
                while (width > maxWidth || difference != 1) {
    
                    if (difference == 0) {
    
                        difference = Math.ceil(currentLine.length / 2)
    
                    } else {
    
                        difference = Math.ceil(difference / 2)
                    }
    
                    if (width > maxWidth) {
    
                        currentLine = line.slice(0, currentLine.length - difference)
    
                    } else {
    
                        currentLine = line.slice(0, currentLine.length + difference)
                    }
    
                    if (!hardWrap) {
                        
                        width = context.measureText(currentLine.join('')).width

                    } else {

                        width = context.measureText(currentLine).width
                    }
                }
    
                if (!hardWrap) {

                    lines.push(currentLine.join(''))
                    lines.push(line.slice(currentLine.length, line.length).join(''))

                } else {

                    lines.push(currentLine)
                    lines.push(line.slice(currentLine.length, line.length))

                }
            }

            let lines = [paragraph]

            for (i = 0; i < maxLines - 1; i ++) {

                if (context.measureText(lines[lines.length - 1]).width > maxWidth) {

                    wrapLine(lines.pop(lines.length - 1))

                } else {

                    break
                }
            }

            if (context.measureText(lines[lines.length - 1]).width > maxWidth) {

                lines = [paragraph]

                for (i = 0; i < maxLines - 1; i ++) {

                    if (context.measureText(lines[lines.length - 1]).width > maxWidth) {
    
                        wrapLine(lines.pop(lines.length - 1), true)
    
                    } else {
    
                        break
                    }
                }
            }

            return lines
        }

        async function generateProfileImage(user) {

            const canvas = Canvas.createCanvas(1024, 576)
            const context = canvas.getContext('2d')

            context.imageSmoothingEnabled = false

            const background = await Canvas.loadImage(path.resolve(__dirname, `./styles/${user.styles.selected || 'citizen'}.png`))
            context.drawImage(background, 0, 0, canvas.width, canvas.height)

            context.imageSmoothingEnabled = true

            const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'jpg' }))
            context.drawImage(avatar, 32 * 1, 32 * 1, 32 * 6, 32 * 6)

            context.font = 'bold 32px Oggbot'
            context.fillStyle = '#ffffff'
            context.textBaseline = 'hanging'
            
            context.fillText(`${user.displayName}`, 32 * 8.5, 32 * 2.5)
            context.fillText(`${user.details.title}`, 32 * 2.5, 32 * 8.5)

            context.font = '32px Oggbot'

            context.fillText(`${user.username}#${user.discriminator}`, 32 * 8.5, 32 * 3.5)
            context.fillText(`Balance`, 32 * 8.5, 32 * 4.5)
            context.fillText(`Birthday`, 32 * 8.5, 32 * 5.5)
            context.fillText(`Location`, 32 * 2.5, 32 * 9.5)
            
            let lines = wrapParagraph(user.details.description, 32 * 27, 4, context)

            for (i = 0; i < lines.length; i ++) {
                
                context.fillText(`${lines[i]}`, 32 * 2.5, 32 * (12.5 + i))
            }

            context.textAlign = 'right'

            context.fillText(`${oggbot.formatMoney(user.balance)}`, 32 * 29.5, 32 * 4.5)
            context.fillText(`${user.details.location}`, 32 * 29.5, 32 * 9.5)

            if (user.birthday) {
                
                context.fillText(`${user.birthday.toLocaleDateString()}`, 32 * 29.5, 32 * 5.5)
            }

            const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'profile.png')

            return attachment
        }

        const user = await oggbot.fetchUser(interaction.targetId)

        if (!user.inDatabase) {

            interaction.editReply({ content: 'User is not in database.' })

            return
        }

        user.displayName = (await interaction.guild.members.fetch(user.id)).displayName
        await user.fetchDetails()
        await user.fetchStyles()

        const attachment = await generateProfileImage(user)

        const profileEmbed = new Discord.MessageEmbed()
            .setImage('attachment://profile.png')

        interaction.editReply({ embeds: [profileEmbed], files: [attachment] })
    }
}