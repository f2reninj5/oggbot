module.exports = {

    data: {

        name: 'ealdo',
        description: 'Calculates any mathematical expression using Ealdo\'s brain.',
        type: 1,
        options: [

            {
                name: 'expression',
                description: 'The expression to calculate',
                type: 3,
                required: true
            }
        ],

        group: 'fun'
    },
    async execute(interaction) {

        expression = interaction.options.getString('expression').replace(/(\\|`)+/g, '').replace(/\^+/g, '**').replace(/\÷+/g, '/').replace(/(×|x)+/g, '*')

        let answer

        try {

            // evaluate the expression
            answer = eval(expression).toString()

        } catch {

            answer = 'There was an error calculating your expression.'
            console.log(`Ealdo Error: ${expression}`)
        }

        // reply answer and react with ealdo emoji
        let reply = await interaction.editReply({ content: answer })

        reply.react(':ealdo:803924894382555137')
    }
}