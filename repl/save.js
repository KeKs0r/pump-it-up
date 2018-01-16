const jsonfile = require('jsonfile')
function save(file, data) {
  const path = __dirname + '/../__fixtures__/' + file + '.json'
  jsonfile.writeFile(path, data, function(err) {
    if (err) {
      console.error(err)
    }
  })
}

module.exports = save
