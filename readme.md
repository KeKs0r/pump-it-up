# Git Management

To update the application:

```
git pull
```

## Application

A single application is a combination of modules and their configuration. Examples are `index.js` and `mcafee.js`.

Applications can be executed with the following command:

```
node index.js
```

## Modules

Modules are modular pieces of code that can be added to the overall application. They are within the `/modules` folder
There are generalle 3 types of modules: Signals, CCXT(exchanges), Utility.

### Signals

There are the following Signal Modules

* `twitter-feed.js`: Reads tweets from mcafee
* `twitter-parse.js`: Parses Twitter Feeds, and tries to find the relevant Coin in the text or image (With McAfee specific )
* `channel-pumpcryptopusher.js`: Reads from the pumpcryptopusher telegram channel and applies "general parsing" to it.
* `channel-pumpnpump.js`: Reads from the pumpnpump channel and applies "general parsing" to it

### CCXT / Exchange Interfaces

The ccxt modules exist once for each exchange.

* `ccxt-tickers.js`: Is the main component of an exchange and is required for all further logic
* `ccxt-buy.js`: Is responsible for buying coins, when found.
* `ccxt-sell.js`: Is responsible to selling when an buy ordr is filled.
* `ccxt-monitor.js`: After a coin was found, the monitor module downloads 10 times every second the "orderbook", "ticker" and "trades", for that coin.
  _Warning: This module is slightly probematic and can make the application hit the rate limit of the exchange_

### Utility

Utility is the last category which is not drectly tight to the functionality of the application

* `logger.js`: Logger takes events from within the system and logs them in a better formatted fashion. It also pushes notificaitons into the osx notification bar (on OSX)
* `manual-entry.js`: Allows to enter a coin manually

## Application Configuration

### Application File (e.g. index.js)

Every `use` statement within the application file, indicates the use of a module.

```javascript
app.use(require('./modules/twitter-feed'))
app.use(require('./modules/twitter-parse'))
```

Every exchange has several modules, with their exchagne names:
Also they need to be created/called with their according exchange.

```javascript
// These need to be defined only once
const ccxtTickers = require('./modules/ccxt-tickers')
const ccxtBuy = require('./modules/ccxt-buy')
const ccxtSell = require('./modules/ccxt-sell')
const ccxtMonitor = require('./modules/ccxt-monitor')

// These need to be added for every exchange
app.use(ccxtTickers('binance'))
app.use(ccxtBuy('binance'))
app.use(ccxtSell('binance'))
app.use(ccxtOrderBook('binance'))
```

It makes sense to generate an dedicated application file per channel, since certain channels (PnD) groups, are only active on a specific exchange. Therefore we only want dedicated combinations of channels and exchanges.

One example for this is the `pump-crypto-pushers.js` which combines the pump crypto telegram channel with only cryptopia, since their pumps were during the time only on this exchange.

### Application Environment (.env)

The `.env` file contains the environment variables. Those currently contain 2 types of values:

* Api Keys for exchanges
* Configuration values

The most relevant configuration values are the `buy/sell` steps which can be configured with those values:

```
BUY_LIMIT_TRESHHOLD=1.10
SELL_STEP_1 = 1.20
SELL_STEP_2 = 1.30
SELL_STEP_3 = 1.40
```

And the amount of a trade per exchange (Those are the exchange minimums):

```
BITTREX_BTC_AMOUNT=0.0005
BINANCE_BTC_AMOUNT=0.002
KUCOIN_BTC_AMOUNT=0.00005
YOBIT_BTC_AMOUNT= 0.0001
CRYPTOPIA_BTC_AMOUNT=0.0005
```
