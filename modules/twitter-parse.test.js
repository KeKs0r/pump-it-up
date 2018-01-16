const { EventEmitter } = require('events')

const twitterParse = require('./twitter-parse')
const { parseText, parseImage, getImageFromTweet } = twitterParse

describe('Parse Text', () => {
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
  it('Second Pump - BURST', () => {
    const t = `Coin of the day: BURST -- First truly Green coin and most overlooked coin. Uses 400 times less power than Bitcoin. Super secure and private. Includes smart contracts, encrypted messaging, decentralized wallet, libertine blockchain. Most undervalued coin. https://www.burst-coin.org`
    const pot = parseText(t)
    expect(pot).toContain('BURST')
    expect(pot).toHaveLength(1)
  })
  it.skip('TODO:First Pump ETN', () => {
    const t = 'ELECTRONEUM - The first of my daily coin reports:'
    const pot = parseText(t)
    expect(pot).toContain('ETN')
    expect(pot).toHaveLength(1)
  })

  it('Multi Brackets', () => {
    const t = `Coin of the day:(OTHER) Reddcoin (RDD) - a sleeper - most widely used social network coin in the world - flying under the radar since 2014. Working with every Social Media platform, it is the only currency that many children under the age of 10 have ever known.  .`
    const pot = parseText(t)
    expect(pot).toContain('RDD')
    expect(pot).toHaveLength(1)
  })

  it('Longer String Capital', function() {
    const t = `Coin of the day: ETHOS`
    const pot = parseText(t)
    expect(pot).toContain('ETHOS')
    expect(pot).toHaveLength(1)
  })

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
  it('Number in Name / Capital', () => {
    const t = `Coin of the day: EMC2`
    const pot = parseText(t)
    expect(pot).toContain('EMC2')
    expect(pot).toHaveLength(1)
  })

  it('Single Letter / Brackets', () => {
    const t = `Coin of the day: (R)`
    const pot = parseText(t)
    expect(pot).toContain('R')
    expect(pot).toHaveLength(1)
  })

  it('Does not find capital stuff in links', () => {
    const t = `Coin Of The Day: https://t.co/WSTXaha1Nk`
    const pot = parseText(t)
    expect(pot).toHaveLength(0)
  })

  it('Does not find Coins that dont exist', () => {
    const t = `Weird tweet with something that looks like a (OCIN)`
    const pot = parseText(t)
    expect(pot).toHaveLength(0)
  })
})

describe('Get Image From Tweet', () => {
  it('Tron Tweet', () => {
    const image = getImageFromTweet(
      require('./__fixtures__/tweet_mcafee_tron.json')
    )
    expect(image).toBe('http://pbs.twimg.com/media/DR-kkH4XcAAQ-vc.jpg')
  })
  it('Factom Tweet', () => {
    const image = getImageFromTweet(
      require('./__fixtures__/tweet_mcafee_fct.json')
    )
    expect(image).toBe('http://pbs.twimg.com/media/DSdsmtfUMAAtWLx.jpg')
  })
})

describe.skip('Parse Image', () => {
  it('Detects TRON in Image', async () => {
    const imageRes = await parseImage(
      'http://pbs.twimg.com/media/DR-kkH4XcAAQ-vc.jpg'
    )
    expect(imageRes).toContain('TRX')
    expect(imageRes).toHaveLength(1)
  })
  it('Detects FCT in Image', async () => {
    const imageRes = await parseImage(
      'http://pbs.twimg.com/media/DSdsmtfUMAAtWLx.jpg'
    )
    expect(imageRes).toContain('FCT')
    expect(imageRes).toHaveLength(1)
  })
})

function waitForSymbol(tweet, state, em) {
  return new Promise(resolve => {
    em.on(state.__events.FOUND_COIN, resolve)
    em.emit(state.__events.RELEVANT_TWEET, tweet)
  })
}

describe('Twitter Parse', () => {
  const em = new EventEmitter()
  const state = {
    __events: {
      RELEVANT_TWEET: 'TWITTER:RELEVANT_TWEET'
    }
  }
  twitterParse(state, em)
  it('Emits Found Symbol from Text Tweet', () => {
    const textTweet = require('./__fixtures__/tweet_mcafee_dgb.json')
    return expect(waitForSymbol(textTweet, state, em)).resolves.toBe('DGB')
  })

  it.skip('Emits Found Symbol from Image Tweet', () => {
    const imageTweet = require('./__fixtures__/tweet_mcafee_fct.json')
    return expect(waitForSymbol(imageTweet, state, em)).resolves.toBe('FCT')
  })
})
