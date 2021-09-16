const { version } = require('../config.json')

module.exports = {

    data: {

        name: 'version',
        description: 'Bot version.',
        type: 1
    },
    async execute(interaction) {

        // reply version
        interaction.editReply({ content: `Oggbot version: ${version}` })
    }
}