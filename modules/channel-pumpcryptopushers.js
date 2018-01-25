const client = require('../lib/telegram-client')
const _ = require('lodash')
const { parseText } = require('./twitter-parse')
const { parseLink } = require('./parse/parse-link')

function isRelevant(text) {
  const t = _.lowerCase(text)
  // Text needs to include COIN as well as either day or week
  return t.indexOf('Coin name') > -1
}

function pumpCryptoPushers(state, em) {
  em.once(state.__events.INIT, () => {
    client.connect(connection => {
      connection.on('message', msg => {
        const { to } = msg
        if (to.peer_id === 1315060107 && isRelevant(msg.text)) {
          console.log(msg.text)
          const options = parseText(msg.text)
          const coin = _.head(_.filter(options, o => o !== 'HOLD'))
          if (coin) {
            em.emit('PARSE:PROPOSE_COIN', coin)
          }
          //checkForImage(msg.text, em)
        }
      })

      connection.on('error', e => {
        console.log('Error from Telegram API:', e)
      })

      connection.on('disconnect', () => {
        console.log('Disconnected from Telegram API')
      })
    })
  })
}

module.exports = pumpCryptoPushers
