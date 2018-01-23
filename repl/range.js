const _ = require('lodash')

_.forEach(_.range(1, 30), num => {
  setTimeout(() => {
    console.log('a')
    console.log('b')
    console.log('c')
  }, 1000 * num)
})
