jest.mock('../lib/twitter-client')

const nanobus = require('nanobus')
const twitterFeed = require('./twitter-feed')
const { isRelevant } = twitterFeed

function _checkRelevant(tweet, called) {
  const em = new nanobus('feed:relevant')
  const spy = jest.fn()
  em.on('TWITTER:RELEVANT_TWEET', spy)

  twitterFeed({}, em)

  const clientStream = require('./lib/twitter-client').em
  clientStream.emit('data', tweet)
  if (called) {
    expect(spy).toHaveBeenCalled()
  } else {
    expect(spy).not.toHaveBeenCalled()
  }
}

it('Does NOT emit relevant tweet for Retweet', () => {
  const tweet = require('./__fixtures__/tweet_retweet.json')
  _checkRelevant(tweet, false)
})
it('Does NOT emit relevant tweet for other user Tweets', () => {
  const tweet = require('./__fixtures__/tweet_reply.json')
  _checkRelevant(tweet, false)
})

describe('Past Scenarios', () => {
  it('BURST', () => {
    const tweet = require('./__fixtures__/tweet_mcafee_burst.json')
    _checkRelevant(tweet, true)
  })

  it('DGB', () => {
    const tweet = require('./__fixtures__/tweet_mcafee_dgb.json')
    _checkRelevant(tweet, true)
  })

  it.skip('ETN', () => {
    const tweet = require('./__fixtures__/tweet_mcafee_etn.json')
    _checkRelevant(tweet, true)
  })
  it('Facton (FCT)', () => {
    const tweet = require('./__fixtures__/tweet_mcafee_fct.json')
    _checkRelevant(tweet, true)
  })
  it('RDD', () => {
    const tweet = require('./__fixtures__/tweet_mcafee_rdd.json')
    _checkRelevant(tweet, true)
  })
})

describe('Is Relevant', () => {
  it('Does NOT emit relevant tweet if coin is not included', () => {
    const text = `I am a tweet, and I wish you a wonderful day`
    expect(isRelevant(text)).toBe(false)
  })
  it('Does NOT emit relevant tweet if day is not included', () => {
    const text = `I am a tweet, and I want the coolest Coin in town`
    expect(isRelevant(text)).toBe(false)
  })
  it('Does emit relevant tweet from McAfee with Coin of the Day', () => {
    const text = `I am a tweet, and I am presenting the coin of the day`
    expect(isRelevant(text)).toBe(true)
  })
  it('Does emit relevant tweet from McAfee with Coin of the Week', () => {
    const text = `I am a tweet, and I am presenting the coin of the Week`
    expect(isRelevant(text)).toBe(true)
  })
})
