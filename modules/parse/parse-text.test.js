const parseText = require('./parse-text')
describe('Brackets', () => {
  it('Longer String Brackets', function() {
    const t = `Coin of the day: (ETHOS)`
    const pot = parseText(t)
    expect(pot).toContain('ETHOS')
    expect(pot).toHaveLength(1)
  })

  it('Number in Name / Brackets', () => {
    const t = `Coin of the day: (EMC2)`
    const pot = parseText(t)
    expect(pot).toContain('EMC2')
    expect(pot).toHaveLength(1)
  })

  it('Multi Brackets', () => {
    const t = `Coin of the day:(OTHER) Reddcoin (RDD) - a sleeper - most widely used social network coin in the world - flying under the radar since 2014. Working with every Social Media platform, it is the only currency that many children under the age of 10 have ever known.  .`
    const pot = parseText(t)
    expect(pot).toContain('RDD')
  })

  it('Forth Pump - RDD', () => {
    const t = `Coin of the day: Reddcoin (RDD) - a sleeper - most widely used social network coin in the world - flying under the radar since 2014. Working with every Social Media platform, it is the only currency that many children under the age of 10 have ever known.  .`
    const pot = parseText(t)
    expect(pot).toContain('RDD')
    expect(pot).toHaveLength(1)
  })

  it('Third Pump - DGB', () => {
    const t = `Coin of the day: Digibyte (DGB). Using a Blockchain which is 40 times faster than Bitcoin and having one of the most decentralized mining systems in the world - based on 5 different synergistic algorithms. DGB adherents call the coin "The Sleeping Giant".`
    const pot = parseText(t)
    expect(pot).toContain('DGB')
    expect(pot).toHaveLength(1)
  })

  it('Single Letter / Brackets', () => {
    const t = `Coin of the day: (R)`
    const pot = parseText(t)
    expect(pot).toContain('R')
    expect(pot).toHaveLength(1)
  })
})

describe('Capital', () => {
  it('Second Pump - BURST', () => {
    const t = `Coin of the day: BURST -- First truly Green coin and most overlooked coin. Uses 400 times less power than Bitcoin. Super secure and private. Includes smart contracts, encrypted messaging, decentralized wallet, libertine blockchain. Most undervalued coin. https://www.burst-coin.org`
    const pot = parseText(t)
    expect(pot).toContain('BURST')
    expect(pot).toHaveLength(1)
  })
  it('Number in Name', () => {
    const t = `Coin of the day: EMC2`
    const pot = parseText(t)
    expect(pot).toContain('EMC2')
    expect(pot).toHaveLength(1)
  })

  it('Longer String', function() {
    const t = `Coin of the day: ETHOS`
    const pot = parseText(t)
    expect(pot).toContain('ETHOS')
    expect(pot).toHaveLength(1)
  })

  it('Does not find capital stuff in links', () => {
    const t = `Coin Of The Day: https://t.co/WSTXaha1Nk`
    const pot = parseText(t)
    expect(pot).toHaveLength(0)
  })

  it.skip('TODO:First Pump ETN', () => {
    const t = 'ELECTRONEUM - The first of my daily coin reports:'
    const pot = parseText(t)
    expect(pot).toContain('ETN')
    expect(pot).toHaveLength(1)
  })

  it('Pumpers Format', () => {
    const t = `Coin name: 💎 LDC 💎 \n\nExchange: Cryptopia 📊 \n\nThe link: https://www.cryptopia.co.nz/Exchange/?market=LDC_BTC`
    const r = parseText(t)
    expect(r).toContain('LDC')
    expect(r).toHaveLength(1)
  })
})

describe('Single Letters', () => {
  it('Multi line Single letter Text', () => {
    const t = `Coin:

    -
    U
    -
    S
    -
    C
    -
    
    Buy promote the coin in the chatbox!`
    const r = parseText(t)
    expect(r).toContain('USC')
    expect(r).toHaveLength(1)
  })

  it('Single Letter without Linebreaks', () => {
    const t = `💠 Coin:\n\n-\nX\n-\nM\n-\nS\n-\n\nBuy and promote the coin in the chatbox!`
    const r = parseText(t)
    expect(r).toContain('XMS')
    expect(r).toHaveLength(1)
  })
})
