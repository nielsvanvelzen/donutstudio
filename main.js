'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow(){
	mainWindow = new BrowserWindow({
		title: 'Donut Studio',
		width: 1600,
		height: 900
	});

	mainWindow.on('closed', function(){
		mainWindow = null;
	});

	mainWindow.setMenu(null);
	mainWindow.loadURL('file://' + __dirname + '/src/index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', function(){
	if (process.platform !== 'darwin')
		app.quit();
});

app.on('activate', function(){
	if (mainWindow === null)
		createWindow();
});