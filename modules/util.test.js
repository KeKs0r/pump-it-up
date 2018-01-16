const { roundSatoshi, roundInvest } = require('./util')

describe('Round Satoshi', () => {
  it('Rounds long numbers', () => {
    expect(roundSatoshi(0.123456789012)).toBe(0.12345679)
  })

  it('Does not effect short numbers', () => {
    expect(roundSatoshi(0.12345)).toBe(0.12345)
  })
})

describe('RoundInvest', () => {
  it('Floors longer numbers', () => {
    expect(roundInvest(0.1234)).toBe(0.12)
  })

  it('Does not effect short numbers', () => {
    expect(roundInvest(0.13)).toBe(0.13)
  })
})
