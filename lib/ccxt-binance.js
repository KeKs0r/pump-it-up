const ccxt = require('ccxt')
const binance = new ccxt.binance()

binance.apiKey = process.env.BINANCE_API_KEY
binance.secret = process.env.BINANCE_API_SECRET

if (process.env.NODE_ENV === 'production' && !process.env.BINANCE_API_KEY) {
  console.warn('BINANCE_API_KEY not set') // eslint-disable-line no-console
}

module.exports = binance
