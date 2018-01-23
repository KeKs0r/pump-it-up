const prompt = require('prompt-async')
const _ = require('lodash')

let looper = true

async function coinPrompt(em, PROPOSE_COIN) {
  try {
    const { coin } = await prompt.get('coin')
    //if (coins.indexOf(_.upperCase(coin)) > -1) {
    em.emit(PROPOSE_COIN, _.upperCase(coin))
    //}
  } catch (e) {
    if (e.message === 'canceled') {
      looper = false
    } else {
      em.emit('app:error', e)
    }
  }
  looper && coinPrompt(em, PROPOSE_COIN)
}

function manualEntry(state, em) {
  const { PROPOSE_COIN, INIT } = state.__events
  em.on(INIT, async () => {
    coinPrompt(em, PROPOSE_COIN)
  })
}

module.exports = manualEntry
