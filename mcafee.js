require('dotenv').config()
const ccxtTickers = require('./modules/ccxt-tickers')
const ccxtBuy = require('./modules/ccxt-buy')
const ccxtSell = require('./modules/ccxt-sell')

const App = require('./app')
const app = new App()

if (process.env.NODE_ENV !== 'test') {
  // Dont Log while running tests
  app.use(require('./modules/logger'))
}

app.use(require('./modules/twitter-feed'))
app.use(require('./modules/twitter-parse'))

app.use(ccxtTickers('bittrex'))
app.use(ccxtBuy('bittrex'))
app.use(ccxtSell('bittrex'))

/*
app.use(ccxtTickers('binance'))
app.use(ccxtBuy('binance'))
app.use(ccxtSell('binance'))

app.use(ccxtTickers('kucoin'))
app.use(ccxtBuy('kucoin'))
app.use(ccxtSell('kucoin'))


app.use(ccxtTickers('yobit'))
app.use(ccxtBuy('yobit'))
app.use(ccxtSell('yobit'))
*/

app.use(require('./modules/manual-entry'))

app.start()

module.exports = app
