/* eslint-disable no-unused-vars */
require('dotenv').config({ path: __dirname + '/../../.env' })
const bittrex = require('../lib/ccxt-bittrex')
const save = require('./save')

async function run() {
  await bittrex.loadMarkets()
  //console.log('Markets', bittrex.symbols)
  console.time('fetchtickers')
  const tickers = await bittrex.fetchTickers()
  console.timeEnd('fetchtickers')

  console.time('markets')
  const markets = await bittrex.loadMarkets()
  console.timeEnd('markets')

  console.time('balance')
  const balance = await bittrex.fetchBalance()
  console.timeEnd('balance')

  console.time('order')
  const order = await bittrex.fetchOrder('f559bf22-f081-47ce-a059-c4e2ebe04f32')
  console.timeEnd('order')

  save('bittrex_single_order', order)
}

run()
