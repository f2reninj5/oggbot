module.exports = {

    data: {

        name: 'reverse',
        type: 3,

        group: 'fun'
    },
    async execute(interaction) {

        // join all args with spaces
        let string = (await interaction.channel.messages.fetch(interaction.targetId)).content
        let result = ''

        if (string.length < 1) {

            interaction.editReply({ content: 'No text found.' })

            return
        }

        // for each character (backwards loop)
        for (i = string.length - 1; i >= 0; i--) {

            // add character to result
            result += string[i]
        }

        // reply result
        interaction.editReply({ content: result })
    }
}