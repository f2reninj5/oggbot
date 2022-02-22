const { Birthdays, Database } = require(`${__root}/oggbot/index`)
const Discord = require('discord.js')
const Canvas = require('canvas')

module.exports = {

    data: {

        name: 'all',
        description: 'View all birthdays.',
        type: 1,
        group: 'view'
    },
    async execute(interaction) {

        async function getUsersByBirthday() {

            let allBirthdays = await Database.query(`SELECT id FROM users WHERE birthday IS NOT NULL ORDER BY MONTH(birthday), DAY(birthday) ASC`)
            allBirthdays = allBirthdays.map(row => row.id)

            if (allBirthdays.length < 1) {

                return null
            }

            let upcomingBirthdays = await Database.query(`SELECT id FROM users WHERE (MONTH(birthday) >= MONTH(NOW()) AND DAY(birthday) >= DAY(NOW())) OR MONTH(birthday) > MONTH(NOW()) ORDER BY MONTH(birthday), DAY(birthday) ASC`)
            upcomingBirthdays = upcomingBirthdays.map(row => row.id)

            let passedBirthdays = allBirthdays.splice(0, allBirthdays.length - upcomingBirthdays.length)
            let userIds = upcomingBirthdays.concat(passedBirthdays)
            let users = []

            for (id of userIds) {

                users.push(await client.users.fetch(id))
            }

            return users
        }

        async function createBirthdayImage(users) {

            let width = 1080
            let height = ((64 + 8) * users.length) - 8

            const canvas = Canvas.createCanvas(width, height)
            const context = canvas.getContext('2d')

            for (i = 0; i < users.length; i ++) {

                // set text settings
                context.fillStyle = '#36393f'

                // draw a rectangle from (0, 72i)
                let heightReference = (i * 72)

                context.fillRect(0, heightReference, canvas.width, 64)
                
                // set text settings
                context.textBaseline = 'middle'

                if (i == 0) {

                    context.font = 'bold 32px Oggbot'
                    context.fillStyle = '#ff9900'

                } else {

                    context.font = '32px Oggbot'
                    context.fillStyle = '#e5e5e5'
                }

                // load avatar image
                let avatar = await Canvas.loadImage(users[i].displayAvatarURL({ format: 'jpg', size: 64 }))
                users[i].birthday = await Birthdays.fetchBirthday(users[i])

                // draw avatar image
                context.drawImage(avatar, 0, heightReference, 64, 64)

                context.textAlign = 'start'

                // write user and birthday
                context.fillText(`${users[i].username}#${users[i].discriminator}`, 96, heightReference + 32)
                context.fillText(users[i].birthday.toLocaleDateString(), width - 320, heightReference + 32)
            }

            const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'birthdays.png')

            return attachment
        }

        let users = await getUsersByBirthday()
        let birthdayImage = await createBirthdayImage(users)

        const birthdaysEmbed = new Discord.MessageEmbed()
            .setTitle('All Birthdays')
            .setImage('attachment://birthdays.png')

        interaction.editReply({ embeds: [birthdaysEmbed], files: [birthdayImage] })
    }
}