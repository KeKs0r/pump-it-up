const messages = require('../__fixtures__/integration/pumpnpump_messages')
const _ = require('lodash')
const save = require('./save')

console.log('Total Size', _.size(messages))

const uniq = _.uniqBy(messages, 'message')
console.log('Uniq Size', _.size(uniq))
save('pumpnpump_uniq', uniq)
