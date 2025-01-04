function updateEditBtns(){
    editBtns = document.querySelectorAll('.edit-btn');
    editBtns.forEach((btn) =>{
        btn.addEventListener('click', function(event) {
            event.stopPropagation();
            
            // Get book to edit
            const bookId = btn.value;
            const book = getBookFromId(bookId)
            editBookModal(book)
        });
    });
}

function editBookModal(book) {
 
    const editModal = new bootstrap.Modal(document.getElementById('edit-book-modal'))
    editBookForm.setAttribute('value', book.bookId);
    document.getElementById('edit-title').value = book.title;
    document.getElementById('edit-author').value = book.author;
    document.getElementById('edit-words').value = book.words;
    document.getElementById('edit-pages').value = book.pages;
    document.getElementById('edit-type').value = book.type;
    document.getElementById('edit-letterDayFloat').value = book.letterDayFloat;
    document.getElementById('edit-receiveDate').value = book.receiveDate;
    document.getElementById('edit-dueDate').value = book.dueDate;
    document.getElementById('edit-color-picker').value = book.color;

    editModal.show()
}

function getBookFromId(id){
    let foundBook = ''
    calEvents.books.forEach((book) => {
        if (book.bookId == id) {
            foundBook = book
        }
    });

    if (foundBook === '') {
        console.error(`No book found for bookId ${id}`);
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

function formatDateToMDYY(dateString) {
    const date = new Date(dateString);
    const options = {year: '2-digit', month: 'numeric', day: 'numeric'};
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

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