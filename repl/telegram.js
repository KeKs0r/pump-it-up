require('dotenv').config({ path: __dirname + '/../.env' })
const client = require('../lib/telegram-client')

client.connect(connection => {
  connection.on('message', message => {
    if (message.from.peer_id === 63678451) {
      console.log('message:', message)
      message
        .getImage()
        .then(d => {
          const pathToImage = d.result
          console.log(d)
        })
        .catch(e => {
          console.error(e)
        })
    }
  })

  connection.on('error', e => {
    console.log('Error from Telegram API:', e)
  })

  connection.on('disconnect', () => {
    console.log('Disconnected from Telegram API')
  })
})
