const ccxt = require('ccxt')
const cryptopia = new ccxt.cryptopia()

cryptopia.apiKey = process.env.CRYPTOPIA_API_KEY
cryptopia.secret = process.env.CRYPTOPIA_API_SECRET

if (process.env.NODE_ENV === 'production' && !process.env.BITTREX_API_KEY) {
  console.warn('BITTREX_API_KEY not set')
}

module.exports = cryptopia
