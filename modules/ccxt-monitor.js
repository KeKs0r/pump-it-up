const exchanges = require('../lib/ccxt')
const { save } = require('./util')
const _ = require('lodash')

function createCCXTOrderBook(name) {
  const exchange = exchanges[name]

  function ccxtOrderBook(state, em) {
    em.on(state.__events.FOUND_COIN, symbol => {
      saveOrderBook(symbol, state, em)
      saveTicker(symbol, state, em)
      saveTrades(symbol, state, em)

      _.forEach(_.range(1, 30), num => {
        setTimeout(() => {
          saveOrderBook(symbol, state, em)
          saveTicker(symbol, state, em)
          saveTrades(symbol, state, em)
        }, 1000 * num)
      })
    })
  }

  async function saveOrderBook(symbol, state, em) {
    try {
      const pair = `${symbol}/BTC`
      if (exchange.symbols.indexOf(pair) === -1) {
        return
      }
      const orderbook = await exchange.fetchOrderBook(pair)
      const fileName = `${name}_orderbook`
      save(fileName, orderbook)
    } catch (e) {
      em.emit(state.__events.ERROR, e)
    }
  }

  async function saveTicker(symbol, state, em) {
    try {
      const pair = `${symbol}/BTC`
      if (exchange.symbols.indexOf(pair) === -1) {
        return
      }
      const ticker = await exchange.fetchTicker(pair)
      const fileName = `${name}_ticker`
      save(fileName, ticker)
    } catch (e) {
      em.emit(state.__events.ERROR, e)
    }
  }

  async function saveTrades(symbol, state, em) {
    try {
      const pair = `${symbol}/BTC`
      if (exchange.symbols.indexOf(pair) === -1) {
        return
      }
      const trades = await exchange.fetchTrades(pair)
      const fileName = `${name}_trades`
      save(fileName, trades)
    } catch (e) {
      em.emit(state.__events.ERROR, e)
    }
  }

  return ccxtOrderBook
}

module.exports = createCCXTOrderBook
