const ccxt = require('ccxt')

const yobit = new ccxt.yobit()

yobit.apiKey = process.env.YOBIT_API_KEY
yobit.secret = process.env.YOBIT_API_SECRET

yobit.throttle = 1000

if (process.env.NODE_ENV === 'production' && !process.env.YOBIT_API_KEY) {
  console.warn('YOBIT_API_KEY not set') // eslint-disable-line no-console
}

module.exports = yobit
