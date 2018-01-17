const _ = require('lodash')
const exchanges = require('../lib/ccxt')
//const cmcCurrencies = require('./currency_list.json')
// const { wait } = require('./util')
// const cmcCoins = _.map(cmcCurrencies, 'symbol')

function createCCXTTicker(name) {
  const exchange = exchanges[name]
  const suffix = _.upperCase(name)
  const CCXT_READY = 'CCXT:READY'
  const CCXT_TICKERS_FETCHED = 'CCXT:TICKERS_FETCHED'
  const CCXT_BALANCES_LOADED = 'CCXT:BALANCES_LOADED'

  const EXCHANGE_READY = CCXT_READY + ':' + suffix
  const EXCHANGE_TICKERS_FETCHED = CCXT_TICKERS_FETCHED + ':' + suffix
  const EXCHANGE_BALANCES_LOADED = CCXT_BALANCES_LOADED + ':' + suffix

  function ccxtTicker(state, em) {
    state.__events = Object.assign({}, state.__events, {
      CCXT_READY,
      CCXT_TICKERS_FETCHED,
      CCXT_BALANCES_LOADED
    })

    const o = {}
    o[name] = {}
    state.tickers = Object.assign({}, state.tickers, o)

    em.on(state.__events.INIT, async () => {
      try {
        await init(em)
      } catch (e) {
        em.emit(state.__events.ERROR, e)
      }
      periodicallyFetchTickers(state, em)
    })
    em.on(EXCHANGE_TICKERS_FETCHED, tickers => {
      updateTickersInState(state, tickers)
    })
    em.on(state.__events.RELEVANT_TWEET, () => {
      state.pause_tickers = true
      setTimeout(() => {
        state.pause_tickers = false
      }, 1000 * 10)
    })
  }

  function _btcMarketFilter(symbol) {
    return symbol.split('/')[1] === 'BTC'
  }

  function updateTickersInState(state, tickers) {
    const btcTickers = _.filter(tickers, t => _btcMarketFilter(t.symbol))
    _.forEach(btcTickers, t => {
      const symbol = _.head(t.symbol.split('/'))
      const updated = {
        pair: t.symbol,
        symbol,
        price: t.ask
      }
      state.tickers[name][symbol] = updated
    })
  }

  async function periodicallyFetchTickers(state, emitter) {
    if (!exchange.hasFetchTickers) {
      return
    }
    // Programm
    try {
      // Stop fetching tickers when relevant tweet was found
      if (!state.pause_tickers) {
        const tickers = await exchange.fetchTickers()
        emitter.emit(EXCHANGE_TICKERS_FETCHED, tickers)
      }
    } catch (e) {
      emitter.emit(state.__events.ERROR, e)
    }
    setTimeout(() => periodicallyFetchTickers(state, emitter), 1000 * 60 * 5)
  }

  async function init(em) {
    await exchange.loadMarkets()
    const balances = await exchange.fetchBalance()
    em.emit(EXCHANGE_BALANCES_LOADED, _.omit(balances, 'info'))
    em.emit(CCXT_READY, name)
    em.emit(EXCHANGE_READY)
  }

  return ccxtTicker
}

/*

  function coinsToFetch(symbol) {
    const [coin, market] = symbol.split('/')
    return market === 'BTC' && cmcCoins.indexOf(coin) > -1
  }
  
async function _backupFetchTickers(){
  const pairs = _.filter(exchange.symbols, coinsToFetch)
  const chunks = _.chunk(pairs, 5)
  const result = {}
  chunks.forEach(async chunk => {
    await wait(1000)
    const tickers = await exchange.fetchTickers(chunk)
    Object.assign(result, tickers)
  })
  emitter.emit(EXCHANGE_TICKERS_FETCHED, result)
}
*/

module.exports = createCCXTTicker
