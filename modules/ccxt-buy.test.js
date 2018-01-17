const ccxtBuy = require('./ccxt-buy')('bittrex')
const nanobus = require('nanobus')

function waitForEvent(name, em) {
  return new Promise(resolve => {
    em.on(name, data => {
      setTimeout(() => resolve(data), 1)
    })
  })
}

function makeInitialState() {
  return {
    __events: {
      LOG: 'log',
      WARN: 'warn',
      ERROR: 'error',
      FOUND_COIN: 'FOUND_COIN',
      CCXT_BALANCES_LOADED: 'CCXT:BALANCES_LOADED'
    },
    tickers: {
      bittrex: {
        XRP: {
          symbol: 'XRP',
          pair: 'XRP/BTC',
          price: 0.000001
        }
      }
    }
  }
}

describe('Buy Coin Scenario', () => {
  const em = nanobus('test:buy_bittrex')
  const ccxt = require('ccxt')
  const buySpy = jest.fn()
  const state = makeInitialState()
  ccxtBuy(state, em)

  const orderEventName = state.__events.CCXT_BUY_ORDER_PLACED + ':BITTREX'
  const orderP = waitForEvent(orderEventName, em)
  const fillEventName = state.__events.CCXT_BUY_ORDER_FILLED + ':BITTREX'
  const fillChangeP = waitForEvent(fillEventName, em)

  beforeAll(() => {
    ccxt.__setBuyOrderSpy(buySpy)
    const remaining = 285714.28571428574 - 1000
    ccxt.__setOrderResponse({
      id: 'f559bf22-f081-47ce-a059-c4e2ebe04f32',
      timestamp: 1514912993903,
      datetime: '2018-01-02T17:09:53.903Z',
      symbol: 'SALT/BTC',
      type: 'limit',
      side: 'buy',
      price: 0.0000014,
      cost: 0.0000013,
      amount: 285714.28571428574,
      filled: 1000,
      remaining,
      status: 'closed',
      fee: { cost: 0, currency: 'BTC' }
    })
  })

  it('Buys Coin on Bittrex', async () => {
    em.emit(state.__events.FOUND_COIN, 'XRP')
    const order = await orderP

    const expectedAmount = 107692 // 0.14/0.0000013
    const expectedPrice = 0.0000013

    expect(order).toHaveProperty('symbol', 'XRP')
    expect(order).toHaveProperty('price', expectedPrice)
    expect(order.amount).toBeCloseTo(expectedAmount)

    expect(state.open_buy.bittrex).toHaveProperty('XRP')

    expect(buySpy).toHaveBeenCalledTimes(1)
    expect(buySpy).toHaveBeenCalledWith(
      'XRP/BTC',
      expectedAmount,
      expectedPrice
    )
  })

  it('Updates order with new fill information', async () => {
    const fillChange = await fillChangeP
    expect(fillChange).toHaveProperty('symbol', 'XRP')
    expect(fillChange).toHaveProperty('fillAmount', 1000)

    const open = state.open_buy.bittrex.XRP
    expect(open).toHaveProperty('filled', 1000)
  })
})

describe('Changes BTC Amount if Balance is lower', () => {
  let em
  let state
  const buySpy = jest.fn()

  beforeAll(() => {
    em = nanobus('test:buy_bittrex_amount')
    state = makeInitialState()
    const ccxt = require('ccxt')
    ccxt.__setBuyOrderSpy(buySpy)
    ccxtBuy(state, em)
  })

  it('Triggers Balance Event', () => {
    const eventName = state.__events.CCXT_BALANCES_LOADED + ':BITTREX'
    em.emit(eventName, { BTC: { open: 0.13 } })
  })

  it('Wait for Order', async () => {
    const eventName = state.__events.CCXT_BUY_ORDER_PLACED + ':BITTREX'
    const orderP = waitForEvent(eventName, em)
    em.emit(state.__events.FOUND_COIN, 'XRP')
    await orderP
  })

  it('Changes BTC Amount if Balance is lower', () => {
    const expectedPrice = 0.0000013 // 0.000001 * 1.3
    const expectedAmount = 100000 // 0.13 / (0.000001 * 1.3)

    expect(buySpy).toHaveBeenCalledTimes(1)
    expect(buySpy).toHaveBeenCalledWith(
      'XRP/BTC',
      expectedAmount,
      expectedPrice
    )
  })
})
