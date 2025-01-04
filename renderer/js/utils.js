// Description: This file contains utility functions that are used in the front end.

///////////////////////////////////
//    Model Related Functions    //
///////////////////////////////////

//*******//
// Books //
//*******//

// Gets the book object from the bookId
function getBookFromId(id){
    let foundBook = ''
    calEvents.books.forEach((book) => {
        if (book.groupId == id) {
            foundBook = book
        }
    });

    if (foundBook === '') {
        console.error(`No book found for groupId ${id}`);
        return '';
    }

    return foundBook;
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

// Formats a date string to MM/DD/YY
function formatDateToMDYY(dateString) {
    const date = new Date(dateString);
    const options = {year: '2-digit', month: 'numeric', day: 'numeric'};
    return new Intl.DateTimeFormat('en-US', options).format(date);
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