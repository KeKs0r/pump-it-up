const Kucoin = require('kucoin-api')
const _ = require('lodash')
const save = require('../repl/save')

if (process.env.NODE_ENV === 'production' && !process.env.KUCOIN_API_KEY) {
  console.warn('KUCOIN_API_KEY not set')
}
let kc = new Kucoin(process.env.KUCOIN_API_KEY, process.env.KUCOIN_API_SECRET)

function _pair(pair) {
  return _.replace(pair, '/', '-')
}
function _mapOrder(kcOrder) {
  const filled = kcOrder.dealAmount
  const remaining = kcOrder.pendingAmount
  const amount = filled + remaining
  return {
    price: kcOrder.price,
    cost: kcOrder.price,
    amount,
    filled,
    remaining,
    side: _.lowerCase(kcOrder.direction),
    symbol: `${kcOrder.coinType}/${kcOrder.coinTypePair}`
  }
}

function ccxtKucoin() {
  this.symbols = []
  this.orders = {}

  this.loadMarkets = async () => {
    const tradingSymbols = await kc.getTradingSymbols()
    const active = _.filter(tradingSymbols.data, 'trading')
    const symbols = _.map(active, s => {
      return `${s.coinType}/${s.coinTypePair}`
    })
    this.symbols = symbols
  }
  this.fetchTickers = fetchTickers
  this.fetchBalance = fetchBalance
  this.createLimitBuyOrder = createLimitBuyOrder.bind(this)
  this.createLimitSellOrder = createLimitSellOrder.bind(this)
  this.fetchOrder = fetchOrder
  this.cancelOrder = cancelOrder.bind(this)
  this.hasFetchTickers = true
}

async function fetchTickers() {
  const tradingSymbols = await kc.getTradingSymbols()
  const active = _.filter(tradingSymbols.data, 'trading')
  const result = {}
  _.forEach(active, t => {
    const pair = `${t.coinType}/${t.coinTypePair}`
    result[pair] = {
      symbol: pair,
      ask: t.sell,
      bid: t.buy,
      high: t.high,
      low: t.low
    }
  })
  return result
}
async function fetchBalance() {
  const balance = await kc.getBalance({
    symbol: 'BTC'
  })
  const total = balance.data.balance
  const used = balance.data.freezeBalance
  const free = total - used
  const result = {
    BTC: {
      free,
      used,
      total
    }
  }
  return result
}
async function createLimitBuyOrder(pair, amount, price) {
  const order = await kc.createOrder({
    pair: _pair(pair),
    amount,
    price,
    type: 'BUY'
  })
  this.orders[order.data.orderOid] = {
    pair: _pair(pair),
    type: 'BUY'
  }
  return {
    id: order.data.orderOid
  }
}
async function createLimitSellOrder(pair, amount, price) {
  const order = await kc.createOrder({
    pair: _pair(pair),
    amount,
    price,
    type: 'SELL'
  })
  this.orders[order.data.orderOid] = {
    pair: _pair(pair),
    type: 'SELL'
  }
  return {
    id: order.data.orderOid
  }
}
async function fetchOrder(orderId, pair, type) {
  if (!this.orders[orderId] && !pair) {
    console.warn('Dont have this order in memory')
    return
  }
  pair = _.get(this.orders[orderId], 'pair', pair)
  type = _.get(this.orders[orderId], 'type', type)

  const activeMapP = kc.doSignedRequest('GET', '/order/active-map', {
    symbol: _pair(pair),
    type
  })

  const dealtOrdersP = kc.getDealtOrders({ pair: _pair(pair) })

  const [activeMap, dealtOrders] = [await activeMapP, await dealtOrdersP]
  save('kucoin-active-orders', activeMap)
  const order = _.find(_.concat(activeMap.data.BUY, activeMap.data.SELL), {
    oid: orderId
  })
  if (order) {
    return _mapOrder(order)
  }
  const dealtOrder = _.find(dealtOrders.data.datas, { orderOid: orderId })
  if (dealtOrder) {
    return {
      symbol: pair,
      price: dealtOrder.dealPrice,
      cost: dealtOrder.dealValue,
      amount: dealtOrder.amount,
      filled: dealtOrder.amount,
      remaining: 0
    }
  }
}
async function cancelOrder(orderId, pair, type) {
  if (!this.orders[orderId] && !pair) {
    console.warn('Dont have this order in memory')
    return
  }
  pair = _.get(this.orders[orderId], 'pair', pair)
  type = _.get(this.orders[orderId], 'type', type)
  const result = await kc.cancelOrder({
    pair: _pair(pair),
    orderOid: orderId,
    type
  })
  return result
}

module.exports = new ccxtKucoin()
