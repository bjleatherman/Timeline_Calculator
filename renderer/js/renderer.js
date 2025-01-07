// const { ipcRenderer } = require("electron");

let calEventsFilePath = '';
let calEvents = '';
let calendar;
let todaysDate = '';
let estEndDate = '';
let minDate = ''; 
let maxDate = ''; 
const estEndDateOffset = 10;

// Load the events file path and sets the dates for the forms on window load
window.onload = (event) => {
  getEventsFilePathFromMain();
  todaysDate = getFormattedDate();
  estEndDate = getEstEndDate();
  minDate = getDateYearOffset(-1);
  maxDate = getDateYearOffset(1);
  setFormDates(); // Set the form dates to the current date
};

// Show the data from events file
// Updates calendar and nav bar
function loadEvents(filePath, callback) {
  fetch(filePath) // Get the file
    .then((response) => response.json()) // Parse the JSON
    .then((json) => {
      calEvents = json; // Store the events in a global variable
      const todaysDate = getFormattedDate(); // Get the current date
      callback(todaysDate, calEvents.events); // Initialize/Update the calendar
    })
    .then(() => buildNavBar()); // Build the nav bar
}

// Initialize the calendar object
function initializeCalendar(todaysDate, currEvents) {
var calendarEl = document.getElementById('calendar');

  calendar = new FullCalendar.Calendar(calendarEl, {
    headerToolbar: {
      left: 'prev,next, today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
      // right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    initialDate: todaysDate,
    navLinks: true, // can click day/week names to navigate views
    editable: true,
    selectable: true,
    dayMaxEvents: true, // allow "more" link when too many events
    contentHeight: 'auto',
    // events: calEvents.events,
    dateClick: function(info) {
      handleDateClick(info);
    }, 
    eventClick: function(info) {
      handleEventClick(info);
    }
  });

  calendar.render();

  calendar.on('dateClick', function(info) {
    console.log('clicked on ' + info.dateStr);
  });
};

////////////////////////////////////
//    Other IPC Communications    //
////////////////////////////////////
//#region Other IPC Communications

//******//
// Send //
//******//

// Get the file path of the events.json file
//   Triggers ipcRenderer.on('eventsFilePath',...)
//   Eventually loads the events.json file into the view
function getEventsFilePathFromMain() {
  ipcRenderer.send('getEventsFilePath', {});
}

//*********//
// Receive //
//*********//

// Receive the file location of the events.json file build nav bar and initialize the calendar
ipcRenderer.on('eventsFilePath', (filePath) => {
  calEventsFilePath = filePath; // Global variable to store the file path
  loadEvents(filePath, initializeCalendar);
});

// Receive the updated events.json file, build the nav bar and update the calendar
ipcRenderer.on('events-updated', (filePath) => {
  loadEvents(filePath, updateCalendarEvents);
});

//#endregion Other IPC Communications

////////////////////////////
//     CRUD Operations    //
////////////////////////////
//#region CRUD Operations

//*******//
// Books //
//*******//

// Create a new book
function createBook(book) {
  ipcRenderer.send('create-book', book);
}

// Update a book
function updateBook(book) {
  ipcRenderer.send('update-book', book);
}

// Delete a book
function deleteBook(bookId) {
  ipcRenderer.send('delete-book', bookId);
}

//********//
// Events //
//********//

// Update an event
function updateEvent(event) {
  ipcRenderer.send('update-event', event);
}

// Delete an event
function deleteEvent(eventId) {
  ipcRenderer.send('delete-event', eventId);
}

//****************//
// Blackout Dates //
//****************//

// Create a new blackout date
function createBlackoutDate(blackoutDate) {
  ipcRenderer.send('create-blackout-date', blackoutDatedate);
}

// Delete a blackout date
function deleteBlackoutDate(blackoutDateId) {
  ipcRenderer.send('delete-blackout-date', blackoutDateId);
}
//#endregion CRUD Operations