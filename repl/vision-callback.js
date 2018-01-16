const twitterParse = require('../twitter-parse')
const nanobus = require('nanobus')

function setup() {
  const em = nanobus('test.parse')
  const state = {
    __events: {
      RELEVANT_TWEET: 'TWITTER:RELEVANT_TWEET'
    }
  }
  twitterParse(state, em)

  const imageTweet = require('../__fixtures__/tweet_mcafee_fct.json')
  em.on(state.__events.FOUND_COIN, () => {
    console.log('FOUND COIN')
  })
  em.emit(state.__events.RELEVANT_TWEET, imageTweet)
}

setup()
