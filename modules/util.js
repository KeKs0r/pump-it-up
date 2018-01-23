const jsonfile = require('jsonfile')
/**
 * Decimal adjustment of a number.
 *
 * @param {String}  type  The type of adjustment.
 * @param {Number}  value The number.
 * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
 * @returns {Number} The adjusted value.
 */
function decimalAdjust(type, value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value)
  }
  value = +value
  exp = +exp
  // If the value is not a number or the exp is not an integer...
  if (
    value === null ||
    isNaN(value) ||
    !(typeof exp === 'number' && exp % 1 === 0)
  ) {
    return NaN
  }
  // If the value is negative...
  if (value < 0) {
    return -decimalAdjust(type, -value, exp)
  }
  // Shift
  value = value.toString().split('e')
  value = Math[type](+(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp)))
  // Shift back
  value = value.toString().split('e')
  return +(value[0] + 'e' + (value[1] ? +value[1] + exp : exp))
}

function roundSatoshi(number) {
  return decimalAdjust('round', number, -8)
}

function roundInvest(number) {
  return decimalAdjust('floor', number, -2)
}

function wait(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

function save(name, data, absolute) {
  const now = new Date()
  const fileName = `${now}_${name}.json`
  const path = absolute ? name : __dirname + '/../data/' + fileName
  jsonfile.writeFile(path, data, function(err) {
    if (err) {
      console.error(err) // eslint-disable-line no-console
    }
  })
}

module.exports = {
  roundSatoshi,
  roundInvest,
  wait,
  save
}
