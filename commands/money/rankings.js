const { Rankings } = require(`${__root}/oggbot/index`)
const Discord = require('discord.js')
const Canvas = require('canvas')

module.exports = {

    data: {

        name: 'rankings',
        description: 'Compare users by statistics.',
        type: 1,
        options: [

            {
                name: 'page',
                description: 'Which page of the rankings to show.',
                type: 4
            }
        ],

        group: 'money'
    },
    async execute(interaction) {

        async function createRankingsImage(rankings) {

            let rows = rankings.rows
            let rowCount = rows.length
            let width = 1032
            let height = (64 * rowCount) + (8 * (rowCount - 1))

            let canvas = Canvas.createCanvas(width, height)
            let context = canvas.getContext('2d')

            // for each user on page
            for (let i = 0; i < rows.length; i ++) {
                
                let row = rows[i]
                let user = await client.users.fetch(row.id)
                let avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'png', size: 64 }))
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
                context.fillText(row.position, 32, heightReference + 32)

                // set text settings
                context.font = '28px Oggbot'
                context.textAlign = 'start'

                // write username and balance
                context.fillText(user.username, 128 + 16, heightReference + 32)
                context.fillText(row.balance, width - 256, heightReference + 32)
            }

            // turn canvas into image attachment
            const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'rankings.png')

            return attachment
        }
        
        try {

            let page = interaction.options.getInteger('page') || 1
            let rankings = await Rankings.fetchBalanceRankings(page, 8)
            let image = await createRankingsImage(rankings).catch(err => {

                console.log(err)

                throw 'something went wrong when generating the image'
            })

            let rankingsEmbed = new Discord.MessageEmbed()
                .setImage('attachment://rankings.png')
                .setFooter(`Page ${rankings.page} / ${rankings.pageCount}`)

            await interaction.editReply({ embeds: [rankingsEmbed], files: [image] })

        } catch (err) {

            await interaction.editReply({ content: `Failed to get rankings because \`${err}\`.` })
        }
    }
}