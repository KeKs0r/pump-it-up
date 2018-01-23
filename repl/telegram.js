require('dotenv').config({ path: __dirname + '/../.env' })
const client = require('../lib/telegram-client')

client.connect(connection => {
  connection.on('message', message => {
    console.log('message:', message)
  })

  connection.on('error', e => {
    console.log('Error from Telegram API:', e)
  })

  connection.on('disconnect', () => {
    console.log('Disconnected from Telegram API')
  })
})
