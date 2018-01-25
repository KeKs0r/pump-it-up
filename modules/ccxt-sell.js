const exchanges = require('../lib/ccxt')
const _ = require('lodash')
const { roundSatoshi, wait } = require('./util')

const CCXT_SELL_ORDER_PLACED = 'CCXT:SELL_ORDER_PLACED'

function makeCCXTSell(name) {
  const exchange = exchanges[name]
  const suffix = _.upperCase(name)

  const EXCHANGE_SELL_ORDER_PLACED = CCXT_SELL_ORDER_PLACED + ':' + suffix

  const SELL_STEP_1 = process.env['SELL_STEP_1'] || 1.2
  const SELL_STEP_2 = process.env['SELL_STEP_2'] || 1.4
  const SELL_STEP_3 = process.env['SELL_STEP_3'] || 1.6

  function ccxtSell(state, em) {
    state.__events = Object.assign({}, state.__events, {
      CCXT_SELL_ORDER_PLACED
    })

    em.emit(
      state.__events.LOG,
      'SELL_STEPS',
      SELL_STEP_1,
      SELL_STEP_2,
      SELL_STEP_3
    )

    const buyOrderFilled = state.__events.CCXT_BUY_ORDER_FILLED + ':' + suffix

    em.on(buyOrderFilled, ({ symbol, order, fillAmount }) => {
      sellOnExchange(symbol, order.price, fillAmount, state, em)
    })
  }

  async function sellOnExchange(symbol, limitPrice, fillAmount, state, em) {
    try {
      if (exchange.throttle) {
        await wait(exchange.throttle)
      }
      const pair = `${symbol}/BTC`
      const firstPrice = roundSatoshi(limitPrice * SELL_STEP_1)
      const firstAmount = fillAmount * 0.4
      const firstP = exchange.createLimitSellOrder(
        pair,
        firstAmount,
        firstPrice
      )

      if (exchange.throttle) {
        await wait(exchange.throttle)
      }
      const secondPrice = roundSatoshi(limitPrice * SELL_STEP_2)
      const secondAmount = fillAmount * 0.4
      const secondP = exchange.createLimitSellOrder(
        pair,
        secondAmount,
        secondPrice
      )

      if (exchange.throttle) {
        await wait(exchange.throttle)
      }
      const thirdPrice = roundSatoshi(limitPrice * SELL_STEP_3)
      const thirdAmount = fillAmount * 0.2
      const thirdP = exchange.createLimitSellOrder(
        pair,
        thirdAmount,
        thirdPrice
      )

      const results = [await firstP, await secondP, await thirdP]
      const [first, second, third] = results
      const e1 = {
        price: firstPrice,
        amount: firstAmount,
        symbol,
        order: first
      }
      const e2 = {
        price: secondPrice,
        amount: secondAmount,
        symbol,
        order: second
      }
      const e3 = {
        price: thirdPrice,
        amount: thirdAmount,
        symbol,
        order: third
      }
      em.emit(EXCHANGE_SELL_ORDER_PLACED, e1)
      em.emit(EXCHANGE_SELL_ORDER_PLACED, e2)
      em.emit(EXCHANGE_SELL_ORDER_PLACED, e3)
    } catch (e) {
      em.emit(state.__events.ERROR, e)
    }
  }
  return ccxtSell
}

makeCCXTSell.CCXT_SELL_ORDER_PLACED = CCXT_SELL_ORDER_PLACED

module.exports = makeCCXTSell
