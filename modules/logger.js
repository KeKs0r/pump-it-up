/* eslint-disable no-console */
const _ = require('lodash')
const notify = require('osx-notifier')

function time() {
  const now = new Date()
  return `${now.getHours()}:${now.getMinutes()}:${now.getMilliseconds()}`
}

function logger(state, em) {
  // Event Logs
  const exchanges = []
  let excluded = []
  const { ERROR, WARN, LOG } = state.__events
  em.once(state.__events.INIT, () => {
    const {
      IRRELEVANT_TWEET,
      FOUND_COIN,
      RELEVANT_TWEET,
      BUY_ORDER_PLACED,
      BUY_ORDER_FILLED,
      SELL_ORDER_PLACED,
      CCXT_BALANCES_LOADED
    } = state.__events
    excluded = [
      IRRELEVANT_TWEET,
      FOUND_COIN,
      RELEVANT_TWEET,
      BUY_ORDER_PLACED,
      BUY_ORDER_FILLED,
      SELL_ORDER_PLACED,
      CCXT_BALANCES_LOADED,
      ERROR,
      WARN,
      LOG
    ]

    em.on(state.__events.CCXT_READY, exchange => {
      exchanges.push(exchange)
      console.log(time(), 'Registered Exchange', exchange)

      const EXCHANGE_BALANCES_LOADED =
        CCXT_BALANCES_LOADED + ':' + _.upperCase(exchange)
      em.on(EXCHANGE_BALANCES_LOADED, bal => {
        console.log(time(), exchange, 'BTC Balance:', bal['BTC'])
      })

      const EXCHANGE_BUY_ORDER_PLACED =
        BUY_ORDER_PLACED + ':' + _.upperCase(exchange)
      em.on(EXCHANGE_BUY_ORDER_PLACED, info => {
        console.log(
          time(),
          exchange,
          'Placed Buy:',
          info.amount,
          info.symbol,
          '@',
          info.price
        )
      })

      const EXCHANGE_BUY_ORDER_FILLED =
        BUY_ORDER_FILLED + ':' + _.upperCase(exchange)
      em.on(EXCHANGE_BUY_ORDER_FILLED, e => {
        console.log(
          time(),
          exchange,
          'Order Filled:',
          `${e.order.filled}/${e.order.amount}`,
          e.symbol,
          '@',
          e.order.cost,
          `(${e.order.price})`
        )
      })

      const EXCHANGE_SELL_ORDER_PALCED =
        SELL_ORDER_PLACED + ':' + _.upperCase(exchange)

      em.on(EXCHANGE_SELL_ORDER_PALCED, info => {
        console.log(
          time(),
          exchange,
          'Placed Sell:',
          info.amount,
          info.symbol,
          '@',
          info.price
        )
      })
    })

    em.on(RELEVANT_TWEET, tweet => {
      console.log(time(), 'Relevant Tweet:', tweet.text)
      try {
        notify({
          type: 'pass',
          group: 'mcafee',
          title: 'Relevant Tweet',
          message: tweet.text
        })
      } catch (e) {
        console.error(e)
      }
    })
    em.on(IRRELEVANT_TWEET, tweet => {
      console.log(time(), 'Irrelevant Tweet:', tweet.text)
    })
    em.on(FOUND_COIN, symbol => {
      console.log(time(), 'Found Coin:', symbol)
      try {
        notify({
          type: 'pass',
          group: 'mcafee',
          title: 'Found Coin',
          message: `Symbol: ${symbol}`
        })
      } catch (e) {
        console.error(e)
      }
    })
  })

  // Normal Console Logs
  // @TODO Add Timestamp to logs
  em.on(LOG, function() {
    const toLog = [time()].concat(_.values(arguments))
    console.log.apply(null, toLog)
  })
  em.on(WARN, function() {
    const toLog = [time()].concat(_.values(arguments))
    console.warn.apply(null, toLog)
  })
  em.on(ERROR, e => {
    console.error(e)
  })

  em.on('*', eventName => {
    if (excluded.indexOf(eventName) === -1) {
      console.log(time(), 'Event:', eventName)
    }
  })
}

module.exports = logger
