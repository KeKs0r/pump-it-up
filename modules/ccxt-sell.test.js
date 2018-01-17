const bittrexSell = require('./ccxt-sell')('bittrex')
const nanobus = require('nanobus')

function waitForEvent(name, em) {
  let count = 0
  return new Promise(resolve => {
    em.on(name, data => {
      count++
      if (count === 3) {
        resolve(data)
      }
    })
  })
}

const em = nanobus('test:sell_bittrex')
const state = {
  __events: {
    LOG: 'log',
    WARN: 'warn',
    ERROR: 'error',
    CCXT_BUY_ORDER_FILLED: 'CCXT:BUY_ORDER_FILLED'
  }
}

it('Sell Coins on Bittrex when buy was filled', async () => {
  const ccxt = require('ccxt')
  const sellSpy = jest.fn()

  ccxt.__setSellOrderSpy(sellSpy)

  bittrexSell(state, em)

  const sellPlaced = state.__events.CCXT_SELL_ORDER_PLACED + ':BITTREX'
  const orderEventP = waitForEvent(sellPlaced, em)

  const buyFilled = state.__events.CCXT_BUY_ORDER_FILLED + ':BITTREX'
  em.emit(buyFilled, {
    symbol: 'SALT',
    order: {
      price: 0.001
    },
    fillAmount: 1000
  })
  const orderEvent = await orderEventP
  expect(orderEvent).toHaveProperty('order')
  expect(orderEvent).toHaveProperty('amount')
  expect(orderEvent).toHaveProperty('price')

  const pair = 'SALT/BTC'
  const price1 = 0.0012 // 0.001 * 1.2
  const price2 = 0.0014 // 0.001 * 1.4
  const price3 = 0.0016 // 0.001 * 1.6
  const amount1 = 400 // 1000 * 0.4
  const amount2 = 400 // 1000 * 0.4
  const amount3 = 200 // 1000 * 0.2

  expect(sellSpy).toHaveBeenCalledTimes(3)
  expect(sellSpy).toHaveBeenCalledWith(pair, amount1, price1)
  expect(sellSpy).toHaveBeenCalledWith(pair, amount2, price2)
  expect(sellSpy).toHaveBeenCalledWith(pair, amount3, price3)
})
