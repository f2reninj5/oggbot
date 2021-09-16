module.exports = {

    data: {

        name: 'reverse',
        description: 'Reverses your message.',
        type: 1,
        options: [

            {
                name: 'message',
                description: 'The message that will be reversed.',
                type: 3,
                required: true
            }
        ],

        group: 'fun'
    },
    async execute(interaction) {

        // join all args with spaces
        let string = interaction.options.getString('message')
        let result = ''

        // for each character (backwards loop)
        for (i = string.length - 1; i >= 0; i--) {

            // add character to result
            result += string[i]
        }

        // reply result
        interaction.editReply({ content: result })
    }
}