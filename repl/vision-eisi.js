const visionClient = require('../lib/vision-client')
const save = require('./save')

async function run() {
  const image = 'https://i.imgur.com/5FShPzQ.jpg'
  console.time('vision')
  const result = await visionClient.documentTextDetection(image)
  console.timeEnd('vision')
  save('vision_adx_text', result)
}

run()
