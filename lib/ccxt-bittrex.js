const _ = require('lodash')
const ccxt = require('ccxt')
const bittrex = new ccxt.bittrex()

_.set(bittrex, 'has.fetchAllOrders', true)

bittrex.apiKey = process.env.BITTREX_API_KEY
bittrex.secret = process.env.BITTREX_API_SECRET

if (process.env.NODE_ENV === 'production' && !process.env.BITTREX_API_KEY) {
  console.warn('BITTREX_API_KEY not set') // eslint-disable-line no-console
}

module.exports = bittrex
