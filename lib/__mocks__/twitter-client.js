const EventEmitter = require('events')

const em = new EventEmitter()
const client = {
  stream: function(a, b, c) {
    c(em)
  },
  em,
  mock: true
}

module.exports = client
