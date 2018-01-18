const exchanges = require('../lib/ccxt')
const { save } = require('./util')

function createCCXTOrderBook(name) {
  const exchange = exchanges[name]

  function ccxtOrderBook(state, em) {
    em.on(state.__events.FOUND_COIN, symbol => {
      saveOrderBook(symbol, state, em)
    })
  }

  async function saveOrderBook(symbol, state, em) {
    try {
      const pair = `${symbol}/BTC`
      if (exchange.symbols.indexOf(pair) === -1) {
        return
      }
      const orderbook = await exchange.fetchOrderBook(pair)
      const fileName = `orderbook_${name}`
      save(fileName, orderbook)
    } catch (e) {
      em.emit(state.__events.ERROR, e)
    }
  }
  return ccxtOrderBook
}

module.exports = createCCXTOrderBook
