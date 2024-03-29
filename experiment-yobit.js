require('dotenv').config({ path: __dirname + '/../.env' })
const ccxtTickers = require('./ccxt-tickers')
//const ccxtBuy = require('./ccxt-buy')
//const ccxtSell = require('./ccxt-sell')

const App = require('../app')
const app = new App()

app.use(require('./twitter-feed'))
app.use(require('./twitter-parse'))

app.use(ccxtTickers('bittrex'))
// app.use(ccxtBuy('yobit'))
// app.use(ccxtSell('yobit'))

if (process.env.NODE_ENV !== 'test') {
  // Dont Log while running tests
  app.use(require('./logger'))
}

app.use(require('./manual-entry'))

app.start()

module.exports = app
