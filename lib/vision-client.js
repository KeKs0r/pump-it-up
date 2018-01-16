const vision = require('@google-cloud/vision')
const visionClient = new vision.ImageAnnotatorClient()

module.exports = visionClient
//module.exports = {}
