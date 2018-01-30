const FOUND_COIN = 'PARSE:FOUND_COIN'
const PROPOSE_COIN = 'PARSE:PROPOSE_COIN'

function proposeCoin(state, em) {
  state.__events = Object.assign({}, state.__events, {
    FOUND_COIN,
    PROPOSE_COIN
  })
  em.on(FOUND_COIN, sym => {
    state.found_coin = sym
  })
  em.on(PROPOSE_COIN, sym => {
    if (state.found_coin !== sym) {
      em.emit(FOUND_COIN, sym)
    }
  })
}

proposeCoin.FOUND_COIN = FOUND_COIN
proposeCoin.PROPOSE_COIN = PROPOSE_COIN

module.exports = proposeCoin
