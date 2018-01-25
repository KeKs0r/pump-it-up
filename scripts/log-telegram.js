require('dotenv').config({ path: __dirname + '/../.env' })
const client = require('../lib/telegram-client')
const Apjson = require('apjson')
const _ = require('lodash')
const { cleanup } = require('./util')

const channels = [
  1179433767, // VIP Signals
  1315060107, // Pump Crypto Pushers🚀
  1138727847, // Monster Pumpz
  1319954026, // Binance Pump Team
  1399647465, // Pump'N'Pump - 2018
  1251630050, // Cryptopia pumpers
  1297239210, // Mega Pump Group
  1263161838 // Tornado Pumps- Cryptopia
]

const files = {}
_.forEach(channels, c => {
  files[c] = new Apjson(__dirname + `/../data/${c}_log.json`)
})

client.connect(connection => {
  connection.on('message', msg => {
    const { to } = msg
    if (channels.indexOf(to.peer_id) > -1) {
      const file = files[to.peer_id]
      console.log(to.peer_id, msg.text)
      if (!file) {
        console.warn('No File handle for', to.peer_id)
        return
      }
      file.append(msg)
    }
  })

  connection.on('error', e => {
    // External Log
    console.log('Error from Telegram API:', e)
  })

  connection.on('disconnect', () => {
    // Notify
    console.log('Disconnected from Telegram API')
  })
})

cleanup(close)
function close() {
  _.forEach(files, file => {
    file.close()
  })
}
