const exchange = require('../lib/ccxt-yobit')

async function run() {
  await exchange.loadMarkets()
  console.time('tickers')
  await exchange.fetchTickers()
  console.timeEnd('tickers')
}

run()
