const _ = require('lodash')
const tickerResponse = require('../../__fixtures__/bittrex_tickers.json')
const buyOrderResponse = require('../../__fixtures__/bittrex_buy_order_response')
const sellOrderResponse = require('../../__fixtures__/bittrex_sell_order_response')
let orderResponse = require('../../__fixtures__/bittrex_single_order.json')

const responses = {
  bittrex: {
    fetchTickers: [tickerResponse],
    createLimitBuyOrder: [buyOrderResponse],
    createLimitSellOrder: [sellOrderResponse],
    fetchOrder: [orderResponse],
    fetchBalance: [{ btc: { open: 0.4 } }]
  },
  binance: {}
}

function makeExchange(type) {
  const counters = {}

  function returnValue(functionName) {
    const current = counters[functionName] || 0
    const retValue =
      responses[type][functionName][current] ||
      _.last(responses[type][functionName])
    counters[functionName] = current + 1
    return retValue
  }

  const exchange = function() {
    this.loadMarkets = () => Promise.resolve()
    this.fetchBalance = () => {
      const val = returnValue('fetchBalance')
      return Promise.resolve(val)
    }
    this.fetchTickers = () => {
      const val = returnValue('fetchTickers')
      const newTickers = _.keys(val)
      this.symbols = _.uniq(this.symbols.concat(newTickers))
      return Promise.resolve(val)
    }
    //this.fetchTicker = symbol => Promise.resolve(_.find(tickers, { symbol }))
    this.createLimitBuyOrder = async (a, b, c) => {
      buySpies[type] && buySpies[type](a, b, c)
      return returnValue('createLimitBuyOrder')
    }
    this.fetchOrder = async () => {
      return returnValue('fetchOrder')
    }
    this.createLimitSellOrder = (a, b, c) => {
      sellSpies[type] && sellSpies[type](a, b, c)
      return returnValue('createLimitSellOrder')
    }
    this.symbols = ['NEO/BTC', 'GAS/BTC', 'XRP/BTC']
    this.mock = true
    this.hasFetchTickers = true
  }
  return exchange
}

const buySpies = {}
const sellSpies = {}

const ccxt = {
  bittrex: makeExchange('bittrex'),
  binance: makeExchange('binance'),
  yobit: makeExchange('yobit'),
  kucoin: makeExchange('kucoin'),
  cryptopia: makeExchange('cryptopia'),
  __setBuyOrderSpy: (spy, type = 'bittrex') => {
    buySpies[type] = spy
  },
  __setSellOrderSpy: (spy, type = 'bittrex') => {
    sellSpies[type] = spy
  },
  __setOrderResponse: (newResp, type = 'bittrex') => {
    responses[type]['fetchOrder'].push(newResp)
  },
  __setResponses: (resp, type = 'bittrex') => {
    responses[type] = resp
  },
  __setBalance: (resp, type = 'bittrex') => {
    responsnes[type]['fetchBalance'] = resp
  }
}

module.exports = ccxt
