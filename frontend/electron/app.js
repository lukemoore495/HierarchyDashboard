const {app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');

let mainWindow;
let backend;
let development = !app.isPackaged;
let iconType;

if (require('electron-squirrel-startup')) return app.quit();

const rootPath = path.normalize(__dirname + '/..');
backend = path.join(rootPath,'/dist/app.exe');

if(process.platform == 'win32'){
    iconType = '.ico'
} else if(process.platform == 'darwin'){
    iconType = 'icns'
} else {
    iconType = '.png'
}

var execfile = require('child_process').execFile;
execfile(
 backend,
 {
  windowsHide: true,
 },
 (err, stdout, stderr) => {
  if (err) {
  console.log(err);
  }
  if (stdout) {
  console.log(stdout);
  }
  if (stderr) {
  console.log(stderr);
  }
 }
)

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        autoHideMenuBar: true,
        show: false,
        icon: rootPath + '/dist/HierarchyDashboard/assets/images/icon' + iconType
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if(development){
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(rootPath + '/dist/HierarchyDashboard/index.html');

    mainWindow.webContents.on('did-fail-load', () => {
        mainWindow.loadFile(rootPath + '/dist/HierarchyDashboard/index.html');
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

//Prevent gpu error for linux
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendArgument('disable-gpu');

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    const { exec } = require('child_process');
    if (process.platform == 'win32'){
        exec('taskkill /f /t /im app.exe', (err, stdout, stderr) => {
          if (err) {
            console.log(err)
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
        });
    } else {
        exec('killall -9 app.exe', (err, stdout, stderr) => {
          if (err) {
            console.log(err)
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
        });
    }
    app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});