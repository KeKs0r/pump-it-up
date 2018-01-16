require('dotenv').config({ path: '../.env' })
const jsonfile = require('jsonfile')

/*
// ------------ Save Tweet To Disk --------------
const client = require('./lib/twitter-client')
client.get('statuses/show/943860891119964160', function(
  error,
  tweet,
  response
) {
  if (!error) {
    console.log(tweet)
    save('tweet_mcafee_etn', tweet)
  } else {
    console.error(error)
  }
})
*/

/*
// --------- Save Coinmarketcap Info to disk -----------
const CoinMarketCap = require('coinmarketcap-api')

const client = new CoinMarketCap()
async function getTickers() {
  try {
    const tickers = await client.getTicker({ limit: 0 })
    console.log(tickers.length)
    save('coinmarketcap_tickers', tickers)
  } catch (e) {
    console.error(e)
  }
}
getTickers()
*/

// --------- Convert CoinmarketCap info
const tickers = require('./__fixtures__/coinmarketcap_tickers')
const mapped = tickers.map(t => ({
  name: t.name,
  symbol: t.symbol,
  id: t.id
}))
save('currency_list', mapped)

function save(file, data) {
  const path = __dirname + '../__fixtures__/' + file + '.json'
  jsonfile.writeFile(path, data, function(err) {
    if (err) {
      console.error(err)
    }
  })
}
