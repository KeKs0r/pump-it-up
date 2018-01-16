const exchanges = {
  bittrex: require('./ccxt-bittrex'),
  binance: require('./ccxt-binance'),
  kucoin: require('./ccxt-kucoin'),
  yobit: require('./ccxt-yobit'),
  cryptopia: require('./ccxt-cryptopia')
}

module.exports = exchanges
