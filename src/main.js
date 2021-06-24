const { 
    app, 
    BrowserWindow, // 创建并控制浏览器窗口
    session, // 用于代理浏览器会话 cookie 缓存 代理设置等 
    Menu, // 顶部栏
    Tray, // 添加icon和上下文菜单
    dialog, // 对话框
    ipcRenderer, // 渲染器进程与主进程之间的通讯 
} = require('electron')
const store = require('./store')
const BeginWork = require('./beginWork/script')
const start = new BeginWork
let win, tray, contents

// electron初始化
app.on('ready', async () => {
    start.create()
    const shouldUpdate = await start.init()

    session
        // 程序默认的session对象
        .defaultSession
        // 可以拦截并修改请求
        .webRequest
        // 
        .onBeforeSendHeaders((details, callback) => {
            details.requestHeaders['User-Agent'] = ''
            callback({
                cancel: false,
                requestHeaders: details.requestHeaders
            })
        })

        win = new BrowserWindow({
            show: false, // 是否显示并聚焦
            webPreferences: { // 预加载脚本
                preload: `${__dirname}/preload.js`,
                devTools: true, // 是否允许开启控制台
                webSecurity: false, // 是否开启同源策略
                enableRemoteModule: true, // 启用remote模块
                contextIsolation: false, // 是否隔离上下文 (建议开启)
                nodeIntegration: true, // 是否启用nodeIntegration

            },
            icon: `${__dirname}/assets/icon.png`
        })
        

        // * 控制渲染以及页面内容
        contents = win.webContents

        // 开启控制台(测试用)
        contents.openDevTools()

        const menu = Menu.buildFromTemplate([])
        Menu.setApplicationMenu(menu)

        // 载入加载页面
        win.loadFile(`${__dirname}/public/loader.html`)
        // 是否可最大化 默认为true
        if (win.maximizable) win.maximize()

        // ready-to-show事件: 第一次绘制完成时, 如果窗口未显示就会触发该事件
        win.on('ready-to-show', () => {
            win.show()
            start.close()
        })

        tray = new Tray(`${__dirname}/assets/icon.png`)
        // 任务栏 - 隐藏的图标 - 右键菜单
        const contextMenu = Menu.buildFromTemplate([
            { label: 'item1', type: 'radio' },
            { label: 'item2', type: 'radio' },
            { label: 'item3', type: 'radio', checked: true },
            { type: 'separator'},
            { label: '退出', click: () => {
                app.quit()
            } },
        ])

        tray.setToolTip('我的scratch')
        tray.setContextMenu(contextMenu)

        // 使用window.open()时触发
        contents.setWindowOpenHandler(details => {
            console.log('details', details)
        })

        // 标题更改时触发
        // win.on('page-title-updated', function (...args) {
        //     console.log('page-title-update', ...args, store.get('flag'))
        //     dialog.showMessageBox(win, {
        //         type: 'none',
        //         message: 'hello',
        //         title: 'hello world'
        //     })
        // })

        // 文本加载完毕后触发
        contents.on('dom-ready', () => {
            const minPath = `${__dirname}/public/scratch/index.html`
            if (!contents.getURL().includes('scratch/index.html')) {
                win.loadFile(minPath)
                store.set('lastURL', minPath)
            }
        })

        // 加载失败时触发
        contents.on('did-fail-load', () => {
            // 尝试重启
            win.reload()
        })

        // 窗口关闭时触发
        win.on('close', evt => {
            // 阻止在DOM的undload事件之前触发
            evt.preventDefault()
            // 强制关闭窗口 且不会触发close和unload事件
            win.destroy()
        })
})

// 所有窗口关闭时退出程序(除darwin苹果以外)
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        // 关闭所有窗口
        // 与app.exit()不同, quit的关闭所有窗口可以通过beforeunload事件中取消掉
        app.quit();
    }
});

// electron初始化完成
// 如果程序尚未就绪, 则订阅ready事件
// app.whenReady()
//     .then(createWindow)