// const { ipcRenderer } = require("electron");

let calEventsFilePath = '';
let calEvents = '';
let calendar;
const todaysDate = getFormattedDate();
const estEndDate = getEstEndDate();
const minDate = getDateYearOffset(-1);
const maxDate = getDateYearOffset(1);

// Load the events file path and sets the dates for the forms on window load
window.onload = (event) => {
  ipcRenderer.send('getEventsFilePath', {}); // Loads the event files into the view...for some reason
  setFormDates(); // Set the form dates to the current date
};

// Receive the file location of the events.json file...eventually a consequence of window.onLoad
ipcRenderer.on('eventsFilePath', (filePath) => {
  calEventsFilePath = filePath; // Global variable to store the file path
  // console.log(`received from main ${filePath}`);
  loadEvents(filePath, initializeCalendar);
});

ipcRenderer.on('events-updated', (filePath) => {
  // console.log(`Events Updated: ${filePath}`);
  loadEvents(filePath, updateCalendarEvents);
});

function loadEvents(filePath, callback) {
  fetch(filePath)
    .then((response) => response.json())
    .then((json) => {
      calEvents = json;
      const todaysDate = getFormattedDate();
      callback(todaysDate, calEvents.events);
    })
    .then(() => buildNavBar());
}

// Get todays date so that the calendar knows where to open to
function getFormattedDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

function getDateYearOffset(offset) {
  let date = new Date();
  const year = date.getFullYear() + offset;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getEstEndDate() {
  let date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate() + 10).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function setFormDates() {
  document.getElementById('receiveDate').value = todaysDate;
  document.getElementById('receiveDate').min = minDate;
  document.getElementById('receiveDate').max = maxDate;

  document.getElementById('dueDate').value = estEndDate;
  document.getElementById('dueDate').min = minDate;
  document.getElementById('dueDate').max = maxDate;
}

function alertSuccess(message){
  Toastify.toast({
    text: message,
    duration: 500,
    close: false,
    style:{
      background: 'green',
      color: 'white',
      textAlign: 'center'
    }
  });
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
    // initialDate: '2024-01-12',
    initialDate: todaysDate,
    navLinks: true, // can click day/week names to navigate views
    editable: true,
    selectable: true,
    dayMaxEvents: true, // allow "more" link when too many events
    contentHeight: 'auto',
    // events: [
    //   {
    //     title: 'All Day Event',
    //     start: '2024-06-01'
    //   },
    //   {
    //     title: 'Long Event',
    //     start: '2024-06-07',
    //     end: '2024-06-10'
    //   },
    //   {
    //     groupId: 999,
    //     title: '0 Repeating Event',
    //     start: '2024-06-09T16:00:00'
    //   },
    //   {
    //     groupId: 999,
    //     title: '1 Repeating Event',
    //     start: '2024-06-16T16:00:00'
    //   },
    //   {
    //     title: 'Conference',
    //     start: '2024-06-11',
    //     end: '2024-06-13'
    //   },
    //   {
    //     title: 'Meeting',
    //     start: '2024-06-12T10:30:00',
    //     end: '2024-06-12T12:30:00'
    //   },
    //   {
    //     title: 'Lunch',
    //     start: '2024-06-12T12:00:00'
    //   },
    //   {
    //     title: 'Meeting',
    //     start: '2024-06-12T14:30:00'
    //   },
    //   {
    //     title: 'Happy Hour',
    //     start: '2024-06-12T17:30:00'
    //   },
    //   {
    //     title: 'Dinner',
    //     start: '2024-06-12T20:00:00'
    //   },
    //   {
    //     title: 'Birthday Party',
    //     start: '2024-06-13T07:00:00'
    //   },
    //   {
    //     title: 'Click for Google',
    //     url: 'http://google.com/',
    //     start: '2024-06-28'
    //   }
    // ],
    events: currEvents,
    dateClick: function() {
      console.log(`date clicked`);
    }
  });

  calendar.render();

  calendar.on('dateClick', function(info) {
    console.log('clicked on ' + info.dateStr);
  });
};

function updateCalendarEvents(todaysDate, newEvents) {
  calendar.removeAllEvents(); // Remove existing events
  calendar.addEventSource(newEvents); // Add new events
}

///////////////////////////////
//     IPC Communications    //
///////////////////////////////
//#region IPC Communications

//******//
// Send //
//******//

//*********//
// Receive //
//*********//

//#endregion IPC Communications

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