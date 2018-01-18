require('dotenv').config({ path: __dirname + '/../../.env' })
const bittrex = require('../lib/ccxt-bittrex')
const save = require('./save')

async function run() {
  try {
    await bittrex.loadMarkets()
    const order = await bittrex.fetchOrderBook('SALT/BTC')
    save('bittrex_orderbook', order)
  } catch (e) {
    console.error(e)
  }
}

run()
