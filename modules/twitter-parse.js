const _ = require('lodash')
const currencies = require('../currency_list.json')
const visionClient = require('../lib/vision-client')

const { PROPOSE_COIN, FOUND_COIN } = require('./propose-coin.js')

function twitterParse(state, emitter) {
  function onTweetParseImage(tweet) {
    const image = getImageFromTweet(tweet)
    if (image) {
      parseImage(image)
        .then(symbols => {
          symbols.forEach(sym => {
            emitter.emit(PROPOSE_COIN, sym)
          })
        })
        .catch(e => emitter.emit(state.__events.ERROR, e))
    }
  }

  emitter.on(state.__events.RELEVANT_TWEET, tweet => {
    const symbols = parseText(tweet.text)
    symbols.forEach(sym => {
      emitter.emit(PROPOSE_COIN, sym)
    })
  })
  // CHECK IMAGES
  emitter.on(state.__events.RELEVANT_TWEET, onTweetParseImage)
}

function getImageFromTweet(tweet) {
  return (
    _.get(tweet, 'entities.media.0.media_url') ||
    _.get(tweet, 'extended_entities.media.0.media_url')
  )
}

function findSymbol(sym) {
  const lowerSym = _.lowerCase(sym)
  const found = currencies.find(curr => {
    return (
      _.lowerCase(curr.symbol) === lowerSym ||
      _.lowerCase(curr.name) === lowerSym ||
      _.lowerCase(curr.id) === lowerSym
    )
  })
  return found && found.symbol
}

function parseText(text) {
  const results = []
  const bracketsPattern = /\(([a-zA-Z0-9]{1,6})\)/g
  let bracketsMatch = bracketsPattern.exec(text)
  while (bracketsMatch != null) {
    const bHit = findSymbol(bracketsMatch[1]) // 1 For result grouping
    if (bHit) {
      results.push(bHit)
    }
    bracketsMatch = bracketsPattern.exec(text)
  }

  // CapitalPattern, should only be used in compbination with 'coin of the day'
  const capitalPattern = /(^|\s)[A-Z0-9]{3,6}(\s|$)/g
  let capitalMatch = capitalPattern.exec(text)
  while (capitalMatch != null) {
    const exists = findSymbol(capitalMatch[0])
    if (exists) {
      results.push(exists) // For Result
    }
    capitalMatch = bracketsPattern.exec(text)
  }
  // TODO: Full Text search if we havent found anything yet

  return _.uniq(
    _.map(results, s => {
      return _.trim(_.replace(_.replace(s, '(', ''), ')', ''))
    })
  )
}

async function parseImage(image) {
  const result = await visionClient.documentTextDetection(image)
  const summary = _.get(result, '0.fullTextAnnotation.text')
  if (!summary) {
    return []
  }
  return parseText(summary)
}

twitterParse.parseText = parseText
twitterParse.parseImage = parseImage
twitterParse.getImageFromTweet = getImageFromTweet

twitterParse.FOUND_COIN = FOUND_COIN
twitterParse.PROPOSE_COIN = PROPOSE_COIN

module.exports = twitterParse
