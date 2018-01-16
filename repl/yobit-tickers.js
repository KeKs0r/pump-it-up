const exchange = require('../lib/ccxt-yobit')
const _ = require('lodash')
const currencies = require('../currency_list.json')

const cmcCoins = _.map(currencies, 'symbol')
function _btcMarketFilter(symbol) {
  const [coin, market] = symbol.split('/')
  return market === 'BTC' && cmcCoins.indexOf(coin) > -1
}

async function run() {
  await exchange.loadMarkets()
  const pairs = _.filter(exchange.symbols, _btcMarketFilter)
  console.log()
  console.time('tickers')
  const tickers = await exchange.fetchTickers(_.take(pairs, 5))
  console.timeEnd('tickers')
  console.log(tickers)
  console.log('Total', _.size(pairs))
}

run()
