require('dotenv').config({ path: __dirname + '/../.env' })
const _ = require('lodash')
const ccxtTickers = require('../modules/ccxt-tickers')
const { save } = require('../modules/util')
const App = require('../app')
const app = new App()

const exchanges = ['bittrex', 'binance', 'kucoin', 'yobit', 'cryptopia']

_.forEach(exchanges, e => {
  app.use(ccxtTickers(e))
})

if (process.env.NODE_ENV !== 'test') {
  // Dont Log while running tests
  app.use(require('../modules/logger'))
}

let symbols = []
let counter = 0

function _btcMarketFilter(symbol) {
  return symbol.split('/')[1] === 'BTC'
}

app.use(function(state, em) {
  _.forEach(exchanges, ex => {
    const suffix = _.upperCase(ex)
    const CCXT_TICKERS_FETCHED = 'CCXT:TICKERS_FETCHED'
    const EXCHANGE_TICKERS_FETCHED = CCXT_TICKERS_FETCHED + ':' + suffix
    em.once(EXCHANGE_TICKERS_FETCHED, tickers => {
      console.log(EXCHANGE_TICKERS_FETCHED, _.size(tickers))
      const btcTickers = _.filter(tickers, t => _btcMarketFilter(t.symbol))
      _.forEach(btcTickers, t => {
        const symbol = _.head(t.symbol.split('/'))
        symbols.push(symbol)
      })
      counter++
      if (counter === _.size(exchanges)) {
        finish()
      }
    })
  })
})

function finish() {
  const data = _.uniq(symbols)
  const path = __dirname + '/../exchange_symbols.json'
  save(path, data, true)
}

app.start()

module.exports = app
