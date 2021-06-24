const { app, BrowserWindow } = require('electron')
const isDev = process.env.NODE_ENV === 'development'
const path = require('path')

function BeginWork() {
    this.win = null
    this.afterChecking = false
}

BeginWork.prototype.create = function () {
    this.win = new BrowserWindow({
        width: 300,
        height: 300,
        resizable: false, // 大小是否可调
        frame: false, // 是否包含边框
        transparent: true, // 窗口透明
        devTools: isDev,
        icon: path.resolve(__dirname, '../assets/icon.png'),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: true,
            devTools: false

        }
    })

    this.win.webContents.on('devtools-opened', () => {
        if (!isDev) this.win.webContents.closeDevTools()
    })

    this.win.loadFile(`${__dirname}/index.html`)
}

BeginWork.prototype.close = function () {
    this.win && this.win.destroy()
}

BeginWork.prototype.init = async function () {
    return new Promise(async (resolve) => {
        const ret = await checkingUpdate()
        resolve(ret)
    })
}

// fake
function checkingUpdate() {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), 3000)
    })
}


module.exports = BeginWork