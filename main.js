const {app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');

const isMac = process.platform === 'darwin';
process.env.NODE_ENV = 'development';
const isDev = process.env.NODE_ENV !== 'production'
const EVENTS_FILEPATH = path.join(__dirname, './renderer/events/events.json')

let mainWindow;

function createMainWindow(){
    mainWindow = new BrowserWindow({
        title: 'Time Calculator',
        width: isDev ? 1200 : 800,
        height: 750,

        // Get stuff from preload
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, './preload.js')
        }
    });

    if (isDev){
        mainWindow.webContents.openDevTools();
    }

    console.log(`${__dirname}`);

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

app.whenReady().then(() =>{

    createMainWindow();
    
    mainWindow.on('closed',  () => (mainWindow = null))

    app.on('activate',  () => {
        if(BrowserWindow.getAllWindows().length === 0){
            createMainWindow()
        }
    });
});

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});

// Tell the renderer where the events file is located
ipcMain.on('getEventsFilePath', (e, data) => {
    mainWindow.webContents.send('eventsFilePath', path.join(EVENTS_FILEPATH))
});

ipcMain.on('add-book', (e, bookObj) => {
    // console.log(`------data here------`);
    // console.log(bookObj.data)
    // console.log(`------events here------`);
    // console.log(bookObj.calEvents)

    let rawEvents = fs.readFileSync(EVENTS_FILEPATH);
    let jsonData = JSON.parse(rawEvents);

    jsonData.books.push(bookObj.data);

    bookObj.calEvents.forEach(event => {
        jsonData.events.push(event);
    });
    let updatedJsonString = JSON.stringify(jsonData, null,2);
    fs.writeFileSync(EVENTS_FILEPATH, updatedJsonString);
});

ipcMain.on('delete-book', (e, bookId) => {
    console.log(`deleting book id: ${bookId}`);

    let rawEvents = fs.readFileSync(EVENTS_FILEPATH);
    let jsonData = JSON.parse(rawEvents);

    // Filter out the book with the specified bookId
    jsonData.books = jsonData.books.filter(book => book.bookId*1 !== bookId*1);
    console.log(`filtered books\n`);
    console.log(jsonData.books);
    
    // Filter out events related to the specified bookId
    jsonData.events = jsonData.events.filter(event => event.groupId*1 !== bookId*1);

    // Save the updated data back to the file
    let updatedJsonData = JSON.stringify(jsonData, null, 2)
    // console.log(updatedJsonData);
    fs.writeFileSync(EVENTS_FILEPATH, updatedJsonData);
});

// Tell the renderer that the file was updated
fs.watch(EVENTS_FILEPATH, (eventType, fileName) => {
    if(eventType === 'change') {
        mainWindow.webContents.send('events-updated', EVENTS_FILEPATH)
    }
});