const _ = require('lodash')
const ccxt = require('ccxt')
const cryptopia = new ccxt.cryptopia()

_.set(cryptopia, 'has.fetchAllOrders', true)

cryptopia.apiKey = process.env.CRYPTOPIA_API_KEY
cryptopia.secret = process.env.CRYPTOPIA_API_SECRET

if (process.env.NODE_ENV === 'production' && !process.env.BITTREX_API_KEY) {
  console.warn('BITTREX_API_KEY not set') // eslint-disable-line no-console
}

module.exports = cryptopia
