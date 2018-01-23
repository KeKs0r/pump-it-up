const { parseText } = require('./twitter-parse')

describe('Channel PumpNPump', () => {
  it('Plain Text Units', () => {
    const t =
      '🔵 The coin is: UNITS 🔵\nBuy and HOLD!\nEVERYONE promote the coin everywhere and the price will go higher! 💸💸💸'
    const res = parseText(t)
    expect(res).toContain('UNITS')
  })

  it.skip('Pastebin Fetch', () => {
    const t = `🔵 Coin: pastebin.com/VN6GBCeR\n\nCoin is in the link! Buy and HOLD!`
    expect(false).toBeTruthy()
  })
})
