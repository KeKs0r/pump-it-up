const bittrexTickers = require('./ccxt-tickers')('bittrex')
const nanobus = require('nanobus')

function waitForEvent(name, em) {
  return new Promise(resolve => {
    em.on(name, () => {
      setTimeout(() => resolve(true), 1)
    })
  })
}

it.skip('Initializes Bittrex Module', () => {
  const em = nanobus('test:init')
  const state = {
    __events: {
      INIT: 'MOCK:INIT'
    }
  }

  bittrexTickers(state, em)

  const eventName = state.__events.CCXT_READY + ':BITTREX'
  const p = expect(waitForEvent(eventName, em)).resolves.toBeTruthy()

  em.emit(state.__events.INIT)
  return p
})

it('Fetches Tickers and adds to state', async () => {
  const em = nanobus('test:tickers')
  const state = {
    __events: {
      INIT: 'MOCK:INIT',
      RELEVANT_TWEET: 'TWITTER:RELEVANT_TWEET'
    }
  }

  bittrexTickers(state, em)
  const eventName = state.__events.CCXT_TICKERS_FETCHED + ':BITTREX'

  const delay = waitForEvent(eventName, em)
  em.emit(state.__events.INIT)
  await delay
  expect(state.tickers.bittrex).toHaveProperty('SALT')
  expect(state.tickers.bittrex).toHaveProperty('FCT')
  expect(state.tickers.bittrex).toHaveProperty('DGB')
  const { SALT, FCT, DGB } = state.tickers.bittrex
  expect(SALT).toHaveProperty('price', 0.0009)
  expect(FCT).toHaveProperty('price', 0.00488245)
  expect(DGB).toHaveProperty('price', 0.00000513)
})
