const messages = require('../__fixtures__/telegram/pumpnpump.json')
const _ = require('lodash')
const { parse } = require('../modules/parse')

describe('PumpNPump Messages', () => {
  it('Single', async () => {
    const m = `
    💠 Coin:\n\n-\nX\n-\nM\n-\nS\n-\n\nBuy and promote the coin in the chatbox!
    `
    const result = await parse(m)
    console.log(result)
  })

  /*
  _.forEach(messages, (m, index) => {
    it('Message # ' + index, async () => {
      const result = await parse(m.message)
      if (m.coin) {
        expect(result).toContain(m.coin)
      }
    })
  })
  */
})
