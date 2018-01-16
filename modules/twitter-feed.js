const client = require('../lib/twitter-client')
const _ = require('lodash')

const TWITTER_USER_ID = '961445378' // McAfee
// const TWITTER_USER_ID = '2220403451' // Philipp Eisen
const RELEVANT_TWEET = 'TWITTER:RELEVANT_TWEET'
const IRRELEVANT_TWEET = 'TWITTER:IRRELEVANT_TWEET'

function isRelevant(text) {
  const t = _.lowerCase(text)
  // Text needs to include COIN as well as either day or week
  return (
    t.indexOf('coin') > -1 && (t.indexOf('day') > -1 || t.indexOf('week') > -1)
  )
}

function twitterFeed(state, emitter) {
  state.__events = Object.assign({}, state.__events, {
    RELEVANT_TWEET,
    IRRELEVANT_TWEET
  })
  /**
   * Stream statuses filtered by keyword
   * number of tweets per second depends on topic popularity
   **/
  client.stream('statuses/filter', { follow: TWITTER_USER_ID }, function(
    stream
  ) {
    stream.on('data', function(tweet) {
      if (tweet.user.id_str === TWITTER_USER_ID) {
        if (isRelevant(tweet.text)) {
          emitter.emit(RELEVANT_TWEET, tweet)
        } else {
          emitter.emit(IRRELEVANT_TWEET, tweet)
        }
      }
    })
    stream.on('error', function(error) {
      console.error(error)
    })
  })
}

twitterFeed.isRelevant = isRelevant

module.exports = twitterFeed
