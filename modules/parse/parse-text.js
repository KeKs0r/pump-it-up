const _ = require('lodash')

function _parseBrackets(text) {
  const results = []
  const bracketsPattern = /\(([a-zA-Z0-9]{1,6})\)/g
  let bracketsMatch = bracketsPattern.exec(text)
  while (bracketsMatch != null) {
    results.push(bracketsMatch[1])
    bracketsMatch = bracketsPattern.exec(text)
  }
  return results
}

function _parseCapital(text) {
  // CapitalPattern, should only be used in compbination with 'coin of the day'
  const results = []
  //const capitalPattern = /(?:^|\s)([A-Z0-9]{3,6})(?:\s|$)/g
  const capitalPattern = /\b([A-Z0-9]{3,6})\b/g
  let capitalMatch = capitalPattern.exec(text)
  while (capitalMatch != null) {
    results.push(capitalMatch[1]) // For Result
    capitalMatch = capitalPattern.exec(text)
  }
  // Remove Numbers
  return _.filter(results, r => _.isNaN(parseInt(r)))
}

function _parseLetters(text) {
  const words = _.words(text)
  const pot = []
  let curr = ''
  _.forEach(words, w => {
    if (_.size(w) === 1) {
      curr += w
    } else {
      if (_.size(curr) >= 3) {
        pot.push(curr)
      }
      curr = ''
    }
  })
  return pot
}

function parseCoinInText(text) {
  // TODO: Full Text search if we havent found anything yet
  const brackets = _parseBrackets(text)
  const capital = _parseCapital(text)
  const letters = _parseLetters(text)

  const uniq = _.uniq(_.flatten([brackets, capital, letters]))
  return uniq
}

module.exports = parseCoinInText
