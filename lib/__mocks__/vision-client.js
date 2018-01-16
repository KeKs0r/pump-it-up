let visionSpy
let response = require('../../__fixtures__/integration/vision_adx.json')
const visionClient = {
  documentTextDetection: async function(image) {
    visionSpy && visionSpy(image)
    return response
  },
  mock: true
}

module.exports = visionClient
