// System Constants
const {app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Import State, Models and Managers
const { State } = require ('./State/State.js');
const { Book } = require ('./Model/Book.js');
const { Event } = require ('./Model/Event.js');
const { BlackoutDate } = require ('./Model/BlackoutDate.js');
const { BookManager } = require ('./State/BookManager.js');
const { EventManager } = require ('./State/EventManager.js');
const { BlackoutDateManager } = require ('./State/BlackoutDateManager.js');
const { ServiceLocator } = require('./Services/ServiceLocator.js');
console.log(ServiceLocator); // Should log the object or `undefined`

// Electron Configuration
const isMac = process.platform === 'darwin';
process.env.NODE_ENV = 'development';
const isDev = process.env.NODE_ENV !== 'production'


// State variables
const EVENTS_FILEPATH = path.join(__dirname, './renderer/events/data.json')

const bookManager = new BookManager();
const eventManager = new EventManager();
const blackoutDateManager = new BlackoutDateManager();

const state = new State(bookManager, eventManager, blackoutDateManager, EVENTS_FILEPATH); // State loads itself now
state.resetState();

// Register services
ServiceLocator.register('bookManager', bookManager);
ServiceLocator.register('eventManager', eventManager);
ServiceLocator.register('blackoutDateManager', blackoutDateManager);


//////////////////////////////
//     Window Management    //
//////////////////////////////
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

///////////////////////////////////////
//     Non State Data To Renderer    //
///////////////////////////////////////

// Tell the renderer where the events file is located
ipcMain.on('getEventsFilePath', (e, data) => {
    mainWindow.webContents.send('eventsFilePath', path.join(EVENTS_FILEPATH))
});

// Tell the renderer that the file was updated //
fs.watch(EVENTS_FILEPATH, (eventType, fileName) => {
    if(eventType === 'change') {
        mainWindow.webContents.send('events-updated', EVENTS_FILEPATH)
    }
});

////////////////////////////
//     CRUD Operations    //
////////////////////////////

//*******//
// Books //
//*******//

// Create Books
ipcMain.on('create-book', (e, book) => {
    state.addBook(book);
});

// Update Books
ipcMain.on('update-book', (e, book) => {
    throw new Error("Not implemented");
    state.updateBook(book);
});

// Delete Books
ipcMain.on('delete-book', (e, groupId) => {
    throw new Error("Not implemented");
    state.deleteBook(groupId);
});

//********//
// Events //
//********//

// Update Event
ipcMain.on('update-event', (e, event) => {
    state.updateEvents(event);
});

// Delete Event
ipcMain.on('delete-event', (e, eventId) => {
    throw new Error("Not implemented");
    state.deleteEvent(eventId);
});

//****************//
// Blackout Dates //
//****************//

// Create a Blackout Date
ipcMain.on('create-blackout-date', (e, blackoutDate) => {
    state.addBlackoutDate(blackoutDate);
});

// Delete a Blackout Date
ipcMain.on('delete-blackout-date', (e, blackoutDate) => {
    state.removeBlackoutDate(blackoutDate);
});