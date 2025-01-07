// Description: This file contains utility functions that are used in the front end.

///////////////////////////////////
//    Model Related Functions    //
///////////////////////////////////

//*******//
// Books //
//*******//

// Gets the book object from the bookId
function getBookFromId(groupId){
    let foundBook = ''
    calEvents.books.forEach((book) => {
        if (book.groupId == groupId) {
            foundBook = book
        }
    });

    if (foundBook === '') {
        console.error(`No book found for groupId ${groupId}`);
        return '';
    }

    return foundBook;
}

//********//
// Events //
//********//

// Gets the event object from the eventId and the groupId
function getEventFromIds(eventId, groupId){
    let foundEvent = ''
    calEvents.events.forEach((event) => {
        if (event.eventId == eventId && event.groupId == groupId) {
            foundEvent = event
        }
    });

    if (foundEvent === '') {
        console.error(`No event found for eventId ${id}`);
        return '';
    }

    return foundEvent;
}

//***************//
// BlackoutDates //
//***************//

// Gets all the blackout dates
function getBlackoutDates() {
    return calEvents.blackoutDates;
}

// Untested
function isBlackoutDate(date) {
    return calEvents.blackoutDates.dates.includes(date);
}

// Gets Blackout Date Object from the date
function getBlackoutDate(date) {
    let foundDate = '';
    calEvents.blackoutDates.forEach((blackoutDate) => {
        if (blackoutDate.date === date) {
            foundDate = blackoutDate;
        }
    });
    return foundDate;
}

// Generates events for calendar based onf the blackout dates in data storage
function generateBlackoutEvents() {
    const blackoutDates = getBlackoutDates();  // raw dates only
    if (!blackoutDates || blackoutDates.length === 0) return [];
  
    const events = blackoutDates.map((item) => ({
      groupId: blackoutEventsGroupId,
      title: 'Blackout Date',
      start: item.date,
      backgroundColor: 'gray',
      borderColor: 'black',
      textColor: 'white'
    }));
  
    return events; // Now only valid event objects
  }
  


////////////////////////////
//   Date Calculations    //
////////////////////////////
//#region Date Calculations

// Get todays date [YYYY-MM-DD]
function getFormattedDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// Get the date of today + specified offset in years [YYYY-MM-DD]
function getDateYearOffset(offset) {
    let date = new Date();
    const year = date.getFullYear() + offset;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Get the estimated due date of the book [YYYY-MM-DD]
function getEstEndDate() {
    let date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate() + estEndDateOffset).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
}
//#endregion Date Calculations

///////////////////////////////
//   Formatting Functions    //
///////////////////////////////
//#region Formatting Functions

//*********//
// Numbers //
//*********//

// Formats numbers with commas
function formatNumbersWithComma(num){
    if (num === undefined) {
        return '';
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//*********//
// Dates //
//*********//

// Formats a date string to M/D/YY
function formatDateToMDYY(dateString) {
    const date = new Date(dateString);
    const options = {
      year: '2-digit', 
      month: 'numeric', 
      day: 'numeric', 
      timeZone: 'UTC' // Force UTC
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

// Formats a date string to YYYY-MM-DD
function formatDateToYYYYMMDD(dateInput) {
    const date = new Date(dateInput); // Create a Date object from the input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// Chceks if a date is valid format [YYYY-MM-DD]
function isValidDate(dateString) {
    // Check if the string matches the format YYYY-MM-DD
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!dateRegex.test(dateString)) {
        return false; // Fails format check
    }

    // Split the string into components
    const [year, month, day] = dateString.split('-').map(Number);

    // Check if the date components form a valid date
    const date = new Date(year, month - 1, day); // Months are zero-indexed in JS Date
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

//******//
// Text //
//******//

// Gets the contrast color for a given hex color
function getContrastColor(hex) {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, '');
  
    // Parse the r, g, b values
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);
  
    // Calculate the brightness of the color
    let brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
    // Return black for light colors and white for dark colors
    return brightness > 155 ? 'black' : 'white';
}
//#endregion Formatting Functions