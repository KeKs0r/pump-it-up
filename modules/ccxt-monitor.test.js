const _ = require('lodash')
function mockFunctions() {
  const original = require.requireActual('./util.js')
  return _.merge(original, { save: jest.fn() })
}
jest.mock('./util.js', () => mockFunctions())

const ccxtMonitor = require('./ccxt-monitor')('bittrex')
const nanobus = require('nanobus')

function makeInitialState() {
  return {
    __events: {
      LOG: 'log',
      WARN: 'warn',
      ERROR: 'error',
      FOUND_COIN: 'FOUND_COIN'
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

describe('Save Orderbook', () => {
  const em = nanobus('test:bittrex_orderbook')
  const state = makeInitialState()
  ccxtMonitor(state, em)

  it('Buys Coin on Bittrex', async () => {
    const util = require('./util')
    expect(util.save).not.toHaveBeenCalled()
    em.emit(state.__events.FOUND_COIN, 'XRP')
    await util.wait(100)

    expect(util.save).toHaveBeenCalledTimes(1)
    expect(util.save).toHaveBeenCalledWith(
      'bittrex_orderbook',
      expect.anything()
    )
  })
})
