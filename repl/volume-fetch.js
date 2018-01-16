require('dotenv').config({ path: __dirname + '/../../.env' })
const exchange = require('../lib/ccxt-cryptopia')
const save = require('./save')
const _ = require('lodash')
const { format } = require('date-fns')

async function run() {
  try {
    console.log(exchange.has)
    const candles = await exchange.fetchOHLCV('BURST/BTC', '1d')
    const formatted = _.map(candles, t => {
      const [time, open, high, low, close, vol] = t
      return {
        date: format(new Date(time), 'DD.MM.YYYY'),
        time,
        open,
        high,
        low,
        close,
        vol
      }
    })
    save('etn-1d', formatted)
  } catch (e) {
    console.error(e)
  }
}

run()
