const Discord = require('discord.js')

module.exports = {

    data: {

        name: 'roll',
        description: 'Rolls dice.',
        type: 1,
        options: [

            {
                name: 'dice',
                description: 'Number of dice to roll.',
                type: 4,
                required: true
            },
            {
                name: 'sides',
                description: 'Number of sides on each dice.',
                type: 4,
                required: true
            }
        ],

        group: 'fun'
    },
    async execute(interaction) {

        let dice = interaction.options.getInteger('dice')
        let sides = interaction.options.getInteger('sides')

        // check if dice is in range
        if (dice > 100 || dice < 1) {

            interaction.editReply({ content: 'You may only roll between 1 and 100 dice.' })

            return
        }

        // check if sides is in range
        if (sides > 100 || sides < 2) {

            interaction.editReply({ content: 'Your dice may only have between 2 and 100 sides.' })

            return
        }

        let results = []
        let total = 0

        // for number of dice
        for (i = 0; i < dice; i ++) {
            
            // roll a die of side number sides and push to results array
            let result = Math.ceil(Math.random() * sides)
            results.push(result)
            total += result
        }

        // create embed
        const diceEmbed = new Discord.MessageEmbed()
            .setTitle(`${dice}d${sides}`)
            .addField('Results', results.join(', '))
            .addField('Total', total.toString())
            .setThumbnail('https://i.pinimg.com/originals/3a/34/6b/3a346b536b6a6f5de274bbbff7908ec0.gif')

        // reply embed
        interaction.editReply({ embeds: [diceEmbed] })
    }
}
