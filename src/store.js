const Store = require('electron-store')

const store = new Store({
    defaults: {
        flag: 'scratch'
    }
})

module.exports = store