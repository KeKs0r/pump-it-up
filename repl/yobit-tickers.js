const exchange = require('../lib/ccxt-yobit')
const _ = require('lodash')

async function run() {
  await exchange.loadMarkets()
  console.time('tickers')
  const tickers = await exchange.fetchTickers()
  console.timeEnd('tickers')
}

run()
