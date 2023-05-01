import { app, globalShortcut, clipboard, nativeImage } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'

const isProd: boolean = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

;(async () => {
  await app.whenReady()

  async function pasteHighlightedText() {
    const highlightedText = clipboard.readText()
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show()
      mainWindow.focus()
      if (highlightedText.length > 0) {
        mainWindow.webContents.send('paste-highlighted-text', highlightedText)
        clipboard.clear()
      }
    }
  }
  function focusApp() {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show()
      mainWindow.focus()
    }
  }
  const mainWindow = createWindow('main', {
    width: 1200,
    height: 800
  })
  mainWindow.on('focus', () => {
    mainWindow.webContents.send('app-focus')
  })
  const ret = globalShortcut.register(
    'CommandOrControl+3',
    pasteHighlightedText
  )
  const ret2 = globalShortcut.register('CommandOrControl+Space', focusApp)

  if (!ret || !ret2) {
    console.error('Global shortcut registration failed')
  }

  if (isProd) {
    await mainWindow.loadURL('app://./home.html')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

app.on('will-quit', () => {
  // Unregister the global shortcut before the app quits.
  globalShortcut.unregisterAll()
})
const image = nativeImage.createFromPath('./resources/icon.ico')
app.dock.setIcon(image)
