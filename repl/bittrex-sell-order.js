require('dotenv').config({ path: __dirname + '/../../.env' })
const bittrex = require('../lib/ccxt-bittrex')
const save = require('./save')

async function run() {
  try {
    await bittrex.loadMarkets()
    const order = await bittrex.createLimitSellOrder('SALT/BTC', 10, 0.00099637)

    save('bittrex_sell_order_response', order)
  } catch (e) {
    console.error(e)
  }
}

run()
