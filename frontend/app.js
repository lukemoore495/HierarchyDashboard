const {app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');

let mainWindow;

let python = require('child_process').spawn('py', ['../backend/app.py']);
  python.stdout.on('data', function (data) {
    console.log("data: ", data.toString('utf8'));
  });
  python.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        autoHideMenuBar: true,
        show: false
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    //mainWindow.webContents.openDevTools()

    mainWindow.loadFile(__dirname + '/dist/DashboardApp/index.html');

    mainWindow.webContents.on('did-fail-load', () => {
        mainWindow.loadFile(__dirname + '/dist/DashboardApp/index.html');
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin'){
        // const { exec } = require('child_process');
        // exec('taskkill /f /t /im app.exe', (err, stdout, stderr) => {
        //   if (err) {
        //     console.log(err)
        //     return;
        //   }
        //   console.log(`stdout: ${stdout}`);
        //   console.log(`stderr: ${stderr}`);
        // });
      app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});