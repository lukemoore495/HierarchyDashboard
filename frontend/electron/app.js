const {app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');

let mainWindow;
let backend;
let development = !app.isPackaged;

const rootPath = path.normalize(__dirname + '/..');
//if(development){
    backend = path.join(rootPath,'/dist/app.exe');
// } else {
//     backend = path.join(process.resourcesPath,'app.exe');
// }

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
        show: false
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

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin'){
        const { exec } = require('child_process');
        exec('taskkill /f /t /im app.exe', (err, stdout, stderr) => {
          if (err) {
            console.log(err)
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
        });
      app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});