const Discord = require('discord.js')

module.exports = {

    data: {

        name: 'chains'
    },
    async execute() {

        const messageChains = new Discord.Collection()

        function checkMessageChain(content, author, channel) {

            if (messageChains.has(channel.id)) {

                let chain = messageChains.get(channel.id)

                if (chain['content'] === content) {

                    if (!chain['users'].includes(author.id)) {

                        chain['users'].push(author.id)

                        if (chain['users'].length >= 3 && !chain['users'].includes(client.user.id)) {

                            channel.send(content)
                            chain['users'].push(client.user.id)
                        }
                    }
                    return

                } else {

                    messageChains.delete(channel.id)
                    checkMessageChain(content, author, channel)
                }
                return

            } else {

                messageChains.set(channel.id, { content: content, users: [author.id] })
                setTimeout(() => messageChains.delete(channel.id), 1000 * 60 * 60 * 3)
            }
        }

        client.on('messageCreate', message => {

            try {

                if (message.content) {
    
                    checkMessageChain(message.content, message.author, message.channel)
                }

            } catch (err) {

                console.log(err)
            }
        })
    }
}