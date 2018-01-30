const currencies = require('../../currency_list.json')
const symbols = require('../../exchange_symbols.json')
//const visionClient = require('../lib/vision-client')
const _ = require('lodash')
const parseText = require('./parse-text')

async function parse(text) {
  const textResult = parseText(text)
  //console.log(textResult)
  const exists = _.filter(textResult, findSymbol)
  if (_.size(exists) > 0) {
    return exists
  }
}

function findSymbol(sym) {
  const lowerSym = _.lowerCase(sym)
  if (symbols.indexOf(sym) > -1) {
    return sym
  }
  const found = currencies.find(curr => {
    return (
      _.lowerCase(curr.symbol) === lowerSym ||
      _.lowerCase(curr.name) === lowerSym ||
      _.lowerCase(curr.id) === lowerSym
    )
  })
  return found && found.symbol
}

/*
async function parseTweet(tweet) {
  const textResult = parseCoinsInText(tweet.text)
  if (textResult) {
    return textResult
  }
  const url = parseLinksInText(tweet.text)
  if (link) {
    const imageLinkP = fetchImage(link)
    const textLinkP = fetchLink(link)
    const [imageLink, textLink] = [await imageLinkP, await textLinkP]
    if (textLink) {
      return textLink
    }
    if (imageLink) {
      return imageLink
    }
  }
}

async function parseImage(image) {
  const result = await visionClient.documentTextDetection(image)
  const summary = _.get(result, '0.fullTextAnnotation.text')
  if (!summary) {
    return []
  }
  return parseText(summary)
}
*/

module.exports = {
  parse
}
