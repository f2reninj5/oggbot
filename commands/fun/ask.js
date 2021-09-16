const Discord = require('discord.js')

module.exports = {

    data: {

        name: 'ask',
        description: 'Ask Oggbot for his sincere opinion.',
        type: 1,
        options: [

            {
                name: 'question',
                description: 'The question that Oggbot will answer.',
                type: 3,
                required: true
            }
        ],

        group: 'fun'
    },
    async execute(interaction) {

        // array of possible responses
        const responses = [
            'It is certain.',
            'It is decidedly so.',
            'Without a doubt.',
            'Yes - definitely.',
            'You may rely on it.',
            'As I see it, yes.',
            'Most likely.',
            'Outlook good.',
            'Yes.',
            'Signs point to yes.',
            'Reply hazy, try again.',
            'Ask again later.',
            'Better not tell you now.',
            'Cannot predict now.',
            'Concentrate and ask again.',
            'Don\'t count on it.',
            'My reply is no.',
            'My sources say no.',
            'Outlook not so good.',
            'Very doubtful.'
        ]

        let question = interaction.options.getString('question')
        let response = responses[Math.floor(Math.random() * responses.length)]

        // create embed
        const answerEmbed = new Discord.MessageEmbed()
            .setTitle(question)
            .setDescription(response)
            .setThumbnail('https://media4.giphy.com/media/141iprzbEPjCiQ/giphy.gif?cid=ecf05e47pqsogur9c8cx454aiojaqta53hulcdxhrlobhc54&rid=giphy.gif&ct=g')

        // follow up embed
        interaction.editReply({ embeds: [answerEmbed] })
    }
}