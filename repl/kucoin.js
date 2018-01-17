require('dotenv').config({ path: __dirname + '/../../.env' })
const ku = require('../lib/ccxt-kucoin')
// const save = require('./save')
// const minOrderSize = 0.0005
const { roundSatoshi } = require('../util')

function wait(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

async function run() {
  try {
    const pair = 'KCS/BTC'

    //const price = roundSatoshi(ticker.ask / 3)
    const price = roundSatoshi(0.00062347)
    //const amount = Math.ceil(minOrderSize / price)
    const amount = 1
    const buyOrder = await ku.createLimitBuyOrder(pair, amount, price / 3)
    console.log(buyOrder)
    const buyOrderId = buyOrder.id

    //const buyOrderId = '5a50e9357d1500048c10f656'
    await wait(1000)
    const order = await ku.cancelOrder(buyOrderId, pair, 'BUY')
    console.log(order)
  } catch (e) {
    console.error(e)
  }
}

run()
