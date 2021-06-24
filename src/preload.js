const { ipcRenderer, shell }  = require('electron')

document.addEventListener('DOMContentLoaded', function () {
    
})

document.addEventListener('ready', function () {
    console.log('open!')
    shell.open('https://github.com')
    // window.open('https://www.electronjs.org/docs/api/window-open')
})