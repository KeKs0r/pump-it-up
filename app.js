var assert = require('assert')
var nanobus = require('nanobus')
var nanotiming = require('nanotiming')

// Choo Style app without DOM
function App(opts) {
  if (!(this instanceof App)) return new App(opts)
  opts = opts || {}

  // define events used by choo
  this.__events = {
    INIT: 'app:init',
    LOG: 'app:log',
    WARN: 'app:warn',
    RENDER: 'app:render',
    ERROR: 'app:error'
  }
  this.state = {
    __events: this.__events
  }

  this.emitter = nanobus('app.emit')
}

App.prototype.use = function(cb) {
  assert.equal(typeof cb, 'function', 'app.use: cb should be type function')
  var msg = 'app.use'
  msg = cb.storeName ? msg + '(' + cb.storeName + ')' : msg
  var endTiming = nanotiming(msg)
  cb(this.state, this.emitter, this)
  endTiming()
}

App.prototype.start = function() {
  this.emitter.emit(this.__events.INIT)
}

module.exports = App
