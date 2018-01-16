const exchanges = require('../lib/ccxt')
const _ = require('lodash')
const { roundSatoshi, roundInvest } = require('./util')

function createCCXTBuy(name) {
  const exchange = exchanges[name]
  const suffix = _.upperCase(name)

  const amount_var = _.upperCase(name) + '_BTC_AMOUNT'
  const BTC_AMOUNT = process.env[amount_var] || 0.14

  const increased_var = 'BUY_LIMIT_TRESHHOLD'
  const ALREADY_INCREASED_TRESHHOLD = process.env[increased_var] || 1.3

  const CCXT_BUY_ORDER_PLACED = 'CCXT:BUY_ORDER_PLACED'
  const CCXT_BUY_ORDER_FILLED = 'CCXT:BUY_ORDER_FILLED'

  const EXCHANGE_BUY_ORDER_PLACED = CCXT_BUY_ORDER_PLACED + ':' + suffix
  const EXCHANGE_BUY_ORDER_FILLED = CCXT_BUY_ORDER_FILLED + ':' + suffix

  function _findTicker(state, symbol) {
    const ownTicker = state.tickers[name][symbol]
    if (ownTicker) {
      return ownTicker
    }
    let otherTicker
    _.forEach(state.tickers, symbols => {
      if (symbols[symbol]) {
        otherTicker = symbols[symbol]
      }
    })
    return otherTicker
  }

  function ccxtBuy(state, em) {
    state.__events = Object.assign({}, state.__events, {
      CCXT_BUY_ORDER_PLACED,
      CCXT_BUY_ORDER_FILLED
    })
    _.set(state, `open_buy.${name}`, {})
    _.set(state, `balances.${name}`, BTC_AMOUNT)

    console.log('BUY_LIMIT_TRESHHOLD', ALREADY_INCREASED_TRESHHOLD)

    const balancesLoaded = state.__events.CCXT_BALANCES_LOADED + ':' + suffix

    em.on(state.__events.FOUND_COIN, symbol => {
      buyOnExchange(symbol, state, em)
    })
    em.on(EXCHANGE_BUY_ORDER_PLACED, order => {
      const o = Object.assign({}, order, { filled: 0 })
      state.open_buy[name][order.symbol] = o
      checkOrder(order.symbol, state, em)
    })
    em.on(balancesLoaded, balances => {
      const btc = balances['BTC']
      if (btc.open < BTC_AMOUNT) {
        console.warn(
          'Lowering Buy Amount on',
          name,
          'to',
          roundInvest(btc.open),
          'from',
          roundInvest(BTC_AMOUNT)
        )
        _.set(state, `balances.${name}`, roundInvest(btc.open))
      }
    })
  }

  async function checkOrder(symbol, state, em) {
    try {
      const pair = `${symbol}/BTC`
      const existing = state.open_buy[name][symbol]
      if (!existing) {
        console.warn('Did not find open order for ', symbol, 'on', name)
        return
      }
      const order = await exchange.fetchOrder(existing.id, pair)
      const preFilled = state.open_buy[name][symbol].filled
      if (order.filled !== preFilled) {
        const diff = order.filled - preFilled
        state.open_buy[name][symbol].filled = order.filled
        em.emit(EXCHANGE_BUY_ORDER_FILLED, {
          symbol,
          order: order,
          fillAmount: diff
        })
      }
      // Dont need to update Anymore
      if (order.remaining === 0) {
        return
      }
    } catch (e) {
      console.error(e)
    }
    setTimeout(() => {
      checkOrder(symbol, state, em)
    }, 500)
  }

  async function buyOnExchange(symbol, state, em) {
    try {
      const pair = `${symbol}/BTC`
      if (exchange.symbols.indexOf(pair) === -1) {
        console.warn('Could not find Pair on', name, pair)
        return
      }
      const ticker = _findTicker(state, symbol)
      if (!ticker) {
        console.warn('No existing Ticker for', symbol)
        return
      }
      const limitPrice = roundSatoshi(
        ticker.price * ALREADY_INCREASED_TRESHHOLD
      )
      const btcAmount = _.get(state, `balances.${name}`, BTC_AMOUNT)
      const orderAmount = Math.floor(btcAmount / limitPrice)
      const confirmed = await exchange.createLimitBuyOrder(
        pair,
        orderAmount,
        limitPrice
      )
      if (confirmed && confirmed.id) {
        const order = {
          symbol: ticker.symbol,
          price: limitPrice,
          amount: orderAmount,
          id: confirmed.id
        }
        em.emit(EXCHANGE_BUY_ORDER_PLACED, order)
      } else {
        console.warn(`Order Placement on ${name} not successful`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return ccxtBuy
}

module.exports = createCCXTBuy
