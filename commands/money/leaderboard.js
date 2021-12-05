const oggbot = require(`${__root}/oggbot`)
const Discord = require('discord.js')
const Canvas = require('canvas')
const { leaderboardValues } = require(`${__root}/config.json`)

module.exports = {

    data: {

        name: 'leaderboard',
        description: 'Compare users by statistics.',
        type: 1,
        options: [

            {
                name: 'page',
                description: 'Which page of the leaderboard to show.',
                type: 4
            }
        ],

        group: 'money'
    },
    async execute(interaction) {

        function validatePage(page) {

            if (page < 1) {

                page = 1
    
            } else if (page > totalPageCount) {
    
                page = totalPageCount   
            }

            return page
        }

        async function getleaderboard(page, pageLength) {

            let rows = await oggbot.queryPool(`SELECT id, balance FROM users ORDER BY balance DESC LIMIT ${page * pageLength}, ${pageLength}`)
            let leaderboard = []

            for (i = 0; i < rows.length; i ++) {

                leaderboard.push({

                    index: (page * pageLength) + i + 1,
                    id: rows[i].id,
                    balance: oggbot.formatMoney(rows[i].balance)
                })
            }

            return leaderboard
        }

        async function createLeaderboardImage(leaderboard) {

            const rowCount = leaderboard.length
            const width = 1032
            const height = (64 * rowCount) + (8 * (rowCount - 1))

            // create canvas
            const canvas = Canvas.createCanvas(width, height)
            const context = canvas.getContext('2d')

            // for each user on page
            for (i = 0; i < rowCount; i ++) {
                
                let row = leaderboard[i]
                let user = await client.users.fetch(row.id)
                let avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'jpg', size: 64 }))
                let heightReference = (i * 72)
                
                // draw a rectangle from (0, 72i)
                context.fillStyle = '#36393f'
                context.fillRect(0, heightReference, width, 64)

                // draw avatar image
                context.drawImage(avatar, 64, heightReference, 64, 64)
                
                // set text settings
                context.textBaseline = 'middle'
                context.fillStyle = '#e5e5e5'
                context.font = '32px Oggbot'
                context.textAlign = 'center'

                // write index number
                context.fillText(row.index, 32, heightReference + 32)

                // set text settings
                context.font = '28px Oggbot'
                context.textAlign = 'start'

                // write username and balance
                context.fillText(user.username, 128 + 16, heightReference + 32)
                context.fillText(row.balance, width - 256, heightReference + 32)
            }

            // turn canvas into image attachment
            const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'leaderboard.png')

            return attachment
        }
        
        let page = interaction.options.getInteger('page') || 1
        let totalUserCount = (await oggbot.queryPool(`SELECT COUNT(*) AS count FROM users`))[0].count
        let totalPageCount = Math.ceil(totalUserCount / leaderboardValues.pageLength)
        
        page = validatePage(page)

        let pageIndex = page - 1

        let leaderboard = await getleaderboard(pageIndex, leaderboardValues.pageLength)

        // create embed
        const leaderboardEmbed = new Discord.MessageEmbed()
            .setImage('attachment://leaderboard.png')
            .setFooter(`Page ${page} / ${totalPageCount}`)

        // reply embed
        interaction.editReply({ embeds: [leaderboardEmbed], files: [await createLeaderboardImage(leaderboard)] })
    }
}