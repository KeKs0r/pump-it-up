const ccxtTickers = require('../modules/ccxt-tickers')
const ccxtBuy = require('../modules/ccxt-buy')
const ccxtSell = require('../modules/ccxt-sell')

const App = require('../app')
let app

const eventSpy = jest.fn()
const bittrexBuySpy = jest.fn()
const bittrexSellSpy = jest.fn()
const binanceBuySpy = jest.fn()
const binanceSellSpy = jest.fn()

jest.mock('../lib/twitter-client')
jest.mock('../lib/vision-client')
const clientStream = require('../lib/twitter-client').em

beforeAll(() => {
  const ccxtMock = require('ccxt')

  // Bittrex MockSetup
  const ordersCreate = require('../__fixtures__/integration/bittrex_create_orders')
  const ordersFetch = require('../__fixtures__/integration/bittrex_fetch_orders')
  const bittrexResponses = {
    fetchTickers: [
      require('../__fixtures__/integration/bittrex_fetchtickers.json')
    ],
    createLimitBuyOrder: ordersCreate.buy,
    createLimitSellOrder: ordersCreate.sell,
    fetchOrder: ordersFetch,
    fetchBalance: [{ BTC: { open: 0.4 } }]
  }
  ccxtMock.__setResponses(bittrexResponses, 'bittrex')
  ccxtMock.__setBuyOrderSpy(bittrexBuySpy, 'bittrex')
  ccxtMock.__setSellOrderSpy(bittrexSellSpy, 'bittrex')

  // Binance Mock Setup
  const binOrdersCreate = require('../__fixtures__/integration/binance_create_orders')
  const binOrdersFetch = require('../__fixtures__/integration/binance_fetch_orders')
  const binanceResponses = {
    fetchTickers: [
      require('../__fixtures__/integration/binance_fetchtickers.json')
    ],
    createLimitBuyOrder: binOrdersCreate.buy,
    createLimitSellOrder: binOrdersCreate.sell,
    fetchOrder: binOrdersFetch,
    fetchBalance: [{ BTC: { open: 0.1 } }]
  }
  ccxtMock.__setResponses(binanceResponses, 'binance')
  ccxtMock.__setBuyOrderSpy(binanceBuySpy, 'binance')
  ccxtMock.__setSellOrderSpy(binanceSellSpy, 'binance')

  app = new App()
  app.use(require('../modules/twitter-feed'))
  app.use(require('../modules/twitter-parse'))
  app.use(require('../modules/propose-coin'))
  app.use(ccxtTickers('bittrex'))
  app.use(ccxtBuy('bittrex'))
  app.use(ccxtSell('bittrex'))
  app.use(ccxtTickers('binance'))
  app.use(ccxtBuy('binance'))
  app.use(ccxtSell('binance'))
  app.emitter.on('*', eventSpy)
  //app.emitter.on('*', name => console.log(name))
  app.start()
})

describe('Bittrex Init', () => {
  it('Has triggered Exchange Ready', () => {
    const e = app.state.__events.CCXT_READY + ':BITTREX'
    expect(eventSpy).toHaveBeenCalledWith(e)
  })

  it('Has Loaded Exchange Tickers', () => {
    const e = app.state.__events.CCXT_TICKERS_FETCHED + ':BITTREX'
    expect(eventSpy).toHaveBeenCalledWith(e, expect.anything())
    expect(app.state.tickers.bittrex).toHaveProperty('ADX')
  })

  it('Has normal BTC amount in state', () => {
    expect(app.state.balances.bittrex).toBe(0.14)
  })
})

describe('Binance Init', () => {
  it('Has triggered Exchange Ready', () => {
    const e = app.state.__events.CCXT_READY + ':BINANCE'
    expect(eventSpy).toHaveBeenCalledWith(e)
  })

  it('Has Loaded Exchange Tickers', () => {
    const e = app.state.__events.CCXT_TICKERS_FETCHED + ':BINANCE'
    expect(eventSpy).toHaveBeenCalledWith(e, expect.anything())
    expect(app.state.tickers.binance).toHaveProperty('ADX')
  })

  it('Has updated the BTC amount due to lower Balance', () => {
    expect(app.state.balances.binance).toBe(0.1)
  })
})

it('Irrelevant Tweet Scenario', () => {
  const tweet = require('../__fixtures__/integration/tweet_irrelevant')
  clientStream.emit('data', tweet)

  const e = app.state.__events.IRRELEVANT_TWEET
  expect(eventSpy).toHaveBeenCalledWith(e, expect.anything())
})

describe('Relevant Tweet Scenario', () => {
  beforeAll(() => {
    const tweet = require('../__fixtures__/integration/tweet_relevant')
    clientStream.emit('data', tweet)
  })

  it('Relevant Tweet', () => {
    const e = app.state.__events.RELEVANT_TWEET
    expect(eventSpy).toHaveBeenCalledWith(e, expect.anything())
  })

  it('Found Coin', () => {
    const e = app.state.__events.FOUND_COIN
    expect(eventSpy).toHaveBeenCalledWith(e, 'ADX')
  })

  describe('Order Execution on Bittrex', () => {
    it('Triggers Buy Order on Bittrex', () => {
      const e = app.state.__events.CCXT_BUY_ORDER_PLACED + ':BITTREX'
      expect(eventSpy).toHaveBeenCalledWith(e, expect.anything())
      const expectedPrice = 0.00026 // 0.0002 * 1.3
      const expecteAmount = 538 // 0.14 / 0.00026
      expect(bittrexBuySpy).toHaveBeenCalledWith(
        'ADX/BTC',
        expecteAmount,
        expectedPrice
      )
    })

    it('Has not yet triggered fill', () => {
      const e = app.state.__events.CCXT_BUY_ORDER_FILLED + ':BITTREX'
      expect(eventSpy).not.toHaveBeenCalledWith(e, expect.anything())
    })

    it('Wait', done => {
      setTimeout(done, 500)
    })

    it('Triggered Fill Event #1', () => {
      const e = app.state.__events.CCXT_BUY_ORDER_FILLED + ':BITTREX'
      expect(eventSpy).toHaveBeenCalledWith(
        e,
        expect.objectContaining({
          fillAmount: 200,
          symbol: 'ADX'
        })
      )
    })

    it('Triggered Sells based on Fill Event #1', () => {
      const pair = 'ADX/BTC'
      const price1 = 0.000312 // 0.00026 * 1.2
      const price2 = 0.000364 // x * 1.4
      const price3 = 0.000416 // x * 1.6
      const amount1 = 80 // 200 * 0.4
      const amount2 = 80 // 200 * 0.4
      const amount3 = 40 // 200 * 0.4
      expect(bittrexSellSpy).toHaveBeenCalledWith(pair, amount1, price1)
      expect(bittrexSellSpy).toHaveBeenCalledWith(pair, amount2, price2)
      expect(bittrexSellSpy).toHaveBeenCalledWith(pair, amount3, price3)
    })

    it('Wait', done => {
      setTimeout(done, 800)
    })
    it('Triggered Fill Event #2', () => {
      const e = app.state.__events.CCXT_BUY_ORDER_FILLED + ':BITTREX'
      expect(eventSpy).toHaveBeenCalledWith(
        e,
        expect.objectContaining({
          fillAmount: 250,
          symbol: 'ADX'
        })
      )
    })

    it('Triggered Sells based on Fill Event #2', () => {
      const pair = 'ADX/BTC'
      const price1 = 0.000312 // 0.00026 * 1.2
      const price2 = 0.000364 // x * 1.4
      const price3 = 0.000416 // x * 1.6
      const amount1 = 100 // 250 * 0.4
      const amount2 = 100 // 250 * 0.4
      const amount3 = 50 // 250 * 0.4
      expect(bittrexSellSpy).toHaveBeenCalledWith(pair, amount1, price1)
      expect(bittrexSellSpy).toHaveBeenCalledWith(pair, amount2, price2)
      expect(bittrexSellSpy).toHaveBeenCalledWith(pair, amount3, price3)
    })
    it('Wait', done => {
      setTimeout(done, 500)
    })
    it('Triggered Fill Event #3', () => {
      const e = app.state.__events.CCXT_BUY_ORDER_FILLED + ':BITTREX'
      expect(eventSpy).toHaveBeenCalledWith(
        e,
        expect.objectContaining({
          fillAmount: 50,
          symbol: 'ADX'
        })
      )
    })

    it('Triggered Sells based on Fill Event #3', () => {
      const pair = 'ADX/BTC'
      const price1 = 0.000312 // 0.00026 * 1.2
      const price2 = 0.000364 // x * 1.4
      const price3 = 0.000416 // x * 1.6
      const amount1 = 20 // 50 * 0.4
      const amount2 = 20 // 50 * 0.4
      const amount3 = 10 // 50 * 0.4
      expect(bittrexSellSpy).toHaveBeenCalledWith(pair, amount1, price1)
      expect(bittrexSellSpy).toHaveBeenCalledWith(pair, amount2, price2)
      expect(bittrexSellSpy).toHaveBeenCalledWith(pair, amount3, price3)
    })

    it('Has not triggered more sells and buys', () => {
      expect(bittrexBuySpy).toHaveBeenCalledTimes(1)
      expect(bittrexSellSpy).toHaveBeenCalledTimes(9)
    })
  })

  describe('Order Execution on Binance', () => {
    it('Triggers Buy Order on Binance', () => {
      const e = app.state.__events.CCXT_BUY_ORDER_PLACED + ':BINANCE'
      expect(eventSpy).toHaveBeenCalledWith(e, expect.anything())
      const expectedPrice = 0.000286 // 0.00022 * 1.3
      const expecteAmount = 349 // 0.1 / 0.000286
      expect(binanceBuySpy).toHaveBeenCalledWith(
        'ADX/BTC',
        expecteAmount,
        expectedPrice
      )
    })

    it('Triggered only Fill Event ', () => {
      const e = app.state.__events.CCXT_BUY_ORDER_FILLED + ':BINANCE'
      expect(eventSpy).toHaveBeenCalledWith(
        e,
        expect.objectContaining({
          fillAmount: 120,
          symbol: 'ADX'
        })
      )
    })

    it('Triggered Sells based on Fill Event', () => {
      const pair = 'ADX/BTC'
      const price1 = 0.0003432 // 0.000286 * 1.2
      const price2 = 0.0004004 // x * 1.4
      const price3 = 0.0004576 // x * 1.6
      const amount1 = 48 // 120 * 0.4
      const amount2 = 48 // 120 * 0.4
      const amount3 = 24 // 120 * 0.2
      expect(binanceSellSpy).toHaveBeenCalledWith(pair, amount1, price1)
      expect(binanceSellSpy).toHaveBeenCalledWith(pair, amount2, price2)
      expect(binanceSellSpy).toHaveBeenCalledWith(pair, amount3, price3)
    })

    it('Has not triggered more sells and buys', () => {
      expect(binanceBuySpy).toHaveBeenCalledTimes(1)
      expect(binanceSellSpy).toHaveBeenCalledTimes(3)
    })
  })
})
