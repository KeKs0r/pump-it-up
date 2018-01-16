const prompt = require('prompt-async')

let counter = 1
function flowLog() {
  console.log(counter++)
  setTimeout(flowLog, 1000)
}

async function rePrompt() {
  let looper = true
  try {
    const { coin } = await prompt.get('coin')
    console.log('INPUT COIN', coin)
  } catch (e) {
    if (e.message === 'canceled') {
      looper = false
    }
    console.error(e.message)
  }
  looper && rePrompt()
}

async function run() {
  flowLog()
  rePrompt()
}
run()
