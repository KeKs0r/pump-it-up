require('dotenv').config({ path: __dirname + '/../.env' })
const _ = require('lodash')

const { roundSatoshi } = require('./util')

jest.unmock('ccxt')
jest.setTimeout(1000 * 15)

function testExchange(
  name,
  coin = 'XRP',
  minOrderSize = 0.0005,
  hasFetchTickers = true
) {
  describe(name, () => {
    const clientPath = `./lib/ccxt-${name}`
    const exchange = require(clientPath)

    const pair = `${coin}/BTC`
    let ticker

    let buyOrderId
    let sellOrderId

    afterAll(async () => {
      // Cancel sell and buy
      if (buyOrderId) {
        await exchange.cancelOrder(buyOrderId)
      }
      if (sellOrderId) {
        await exchange.cancelOrder(sellOrderId)
      }
    })

    it('Load Markets', async () => {
      await exchange.loadMarkets()
      expect(exchange.symbols).toContain(pair)
    })

    it('Balance', async () => {
      const balances = await exchange.fetchBalance()
      const btc = balances['BTC']
      expect(btc).toHaveProperty('free')
      expect(btc).toHaveProperty('used')
      expect(btc).toHaveProperty('total')
    })

    it('Has FetchTickers', () => {
      expect(exchange.hasFetchTickers).toBe(hasFetchTickers)
    })

    exchange.hasFetchTickers &&
      it(`Get Tickers`, async () => {
        // Fetching all because thats what the application does

        const allTickers = await exchange.fetchTickers()

        ticker = allTickers[pair]
        expect(ticker).toBeTruthy()
        expect(ticker).toHaveProperty('ask')
        expect(ticker).toHaveProperty('symbol', pair)
      })

    // !exchange.hasFetchTickers &&
    //   it('Get Tickers (with Symbol)', async () => {
    //     const pairs = _.filter(exchange.symbols, _btcMarketFilter)
    //     const sample = _.sampleSize(pairs, 5)
    //     const toFetch = [...sample, pair]
    //     const allTickers = await exchange.fetchTickers(toFetch)
    //     ticker = allTickers[pair]
    //     expect(ticker).toBeTruthy()
    //     expect(ticker).toHaveProperty('ask')
    //     expect(ticker).toHaveProperty('symbol', pair)
    //   })

    it('Create Buy Order', async () => {
      const price = roundSatoshi(ticker.ask / 3)
      const amount = Math.ceil(minOrderSize / price) + 1
      const buyOrder = await exchange.createLimitBuyOrder(pair, amount, price)
      expect(buyOrder).toHaveProperty('id')
      buyOrderId = buyOrder.id
    })

    it('Wait', done => {
      setTimeout(done, 2000)
    })

    it('Fetch Single order', async () => {
      const order = await exchange.fetchOrder(buyOrderId, pair)
      //const order = await exchange.fetchOrder(258011466, pair)
      expect(order).toHaveProperty('price')
      expect(order).toHaveProperty('cost')
      expect(order).toHaveProperty('amount')
      expect(order).toHaveProperty('filled')
      expect(order).toHaveProperty('remaining')
    })

    it('Wait', done => {
      setTimeout(done, 2000)
    })

    it('Create Sell Order', async () => {
      const price = roundSatoshi(ticker.bid * 3)
      const amount = Math.ceil(minOrderSize / price) + 1
      const sellOrder = await exchange.createLimitSellOrder(pair, amount, price)
      expect(sellOrder).toHaveProperty('id')
      sellOrderId = sellOrder.id
    })
  })
}

//testExchange('kucoin', 'KCS', 0.00005)
//testExchange('bittrex', 'XRP', 0.0005)
//testExchange('binance', 'XRP', 0.002)
//testExchange('yobit', 'TRX', 0.0001, false)
testExchange('cryptopia', 'DIVX', 0.0005)
it('Placeholder')
