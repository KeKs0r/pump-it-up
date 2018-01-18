require('dotenv').config({ path: __dirname + '/../.env' })
const _ = require('lodash')
const { roundSatoshi } = require('../modules/util')

jest.unmock('ccxt')
jest.setTimeout(1000 * 15)

function testExchange(
  name,
  coin = 'XRP',
  minOrderSize = 0.0005,
  testOrders = false
) {
  describe(name, () => {
    const clientPath = `../lib/ccxt-${name}`
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

    it('FetchOrderBook', async () => {
      const orderBook = await exchange.fetchOrderBook(pair)
      expect(orderBook).toHaveProperty('bids')
      expect(orderBook).toHaveProperty('asks')
      const ask = _.head(orderBook.asks)
      expect(ask).toHaveLength(2)
      const bid = _.head(orderBook.bids)
      expect(bid).toHaveLength(2)
    })

    exchange.has.fetchTickers &&
      exchange.has.fetchAllOrders &&
      it(`Get Tickers`, async () => {
        // Fetching all because thats what the application does

        const allTickers = await exchange.fetchTickers()

        ticker = allTickers[pair]
        expect(ticker).toBeTruthy()
        expect(ticker).toHaveProperty('ask')
        expect(ticker).toHaveProperty('symbol', pair)
      })

    exchange.has.fetchTickers &&
      !exchange.has.fetchAllOrders &&
      it('Implement fetchTickers Sequencing')

    testOrders &&
      describe('Test Orders', () => {
        it('Create Buy Order', async () => {
          const price = roundSatoshi(ticker.ask / 3)
          const amount = Math.ceil(minOrderSize / price) + 1
          const buyOrder = await exchange.createLimitBuyOrder(
            pair,
            amount,
            price
          )
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
          const sellOrder = await exchange.createLimitSellOrder(
            pair,
            amount,
            price
          )
          expect(sellOrder).toHaveProperty('id')
          sellOrderId = sellOrder.id
        })
      })
  })
}

testExchange('kucoin', 'KCS', 0.00005)
testExchange('bittrex', 'XRP', 0.0005)
testExchange('binance', 'XRP', 0.002)
testExchange('yobit', 'TRX', 0.0001)
testExchange('cryptopia', 'DIVX', 0.0005)
