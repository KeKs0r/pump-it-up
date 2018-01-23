const ccxt = require('ccxt')
const Promise = require('bluebird')
const _ = require('lodash')

function _relevantMarket(m) {
  return m.quote === 'BTC' && m.active
}

class MyYobit extends ccxt.yobit {
  constructor() {
    super()
    this.imExtended = true
  }
  fetchTickers() {
    if (_.size(arguments) > 0) {
      return super.fetchTickers.apply(this, arguments)
    }
    const filtered = _.filter(this.markets, _relevantMarket)
    const relevantMarkets = _.map(filtered, 'symbol')
    const chunks = _.chunk(relevantMarkets, 30)
    return Promise.map(
      chunks,
      c => {
        return super.fetchTickers(c)
      },
      { concurrency: 5 }
    ).then(chunked => {
      let result = {}
      _.forEach(chunked, chunk => {
        _.forEach(chunk, (value, key) => {
          result[key] = value
        })
      })
      return result
    })
  }
}

const yobit = new MyYobit()

yobit.apiKey = process.env.YOBIT_API_KEY
yobit.secret = process.env.YOBIT_API_SECRET

yobit.throttle = 1000

if (process.env.NODE_ENV === 'production' && !process.env.YOBIT_API_KEY) {
  console.warn('YOBIT_API_KEY not set') // eslint-disable-line no-console
}

module.exports = yobit
