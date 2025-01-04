// Description: Handles all UI updates and event listeners for the front end.

const submitBtn = document.getElementById('new-book-submit');
const newBookForm = document.getElementById('new-book-form');
const editBookForm = document.getElementById('edit-book-form');
const sideBarDataView = document.getElementById('book-sidebar-menu');
const editDeleteBtn = document.getElementById('delete-book');

let editBtns = '';

//////////////////////
//    UI Updates    //
//////////////////////
//#region UI Updates

//**********//
// Calendar //
//**********//

// Updates the events on the calendar with new events
function updateCalendarEvents(todaysDate, newEvents) {
    calendar.removeAllEvents(); // Remove existing events
    calendar.addEventSource(newEvents); // Add new events
}

//*********//
// Alerts  //
//*********//

// Alert user of Success
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

//**********//
// Nav Bars //
//**********//

// Populate book group window
function buildNavBar() {

    // Clear all <a> elements except the one with id "new-book-list-btn"
    Array.from(sideBarDataView.children).forEach((child) => {
        if (child.id !== 'new-book-list-btn') {
            sideBarDataView.removeChild(child);
        }
    });

    console.log(`building navbar`);
    console.log(calEvents.books);

    calEvents.books.forEach((book) => {

        dataToDisplay = {
            //'Progress: ': `${formatNumbersWithComma(book.currentProgress)} Words`,
            'Author: ': book.author,
            'Dates: ': `${formatDateToMDYY(book.receiveDate)}-${formatDateToMDYY(book.dueDate)}`,
            'Word Count: ': formatNumbersWithComma(book.words),
            'Editing Type: ': book.type,
            // 'Blackout Dates': book.blackoutDates,
            // Handle BlackoutDates Elsewhere
        };

        const textContrastColor =  getContrastColor(book.color)

        // id for bootstrap collapse group
        const bookGroup = `book-group-${book.groupId}`;
        
        // list item that will go into #book-sidebar
        let parentA = document.createElement('a');
        parentA.className= 'list-group-item list-group-item-action';
        parentA.href = '#'
        parentA.setAttribute('data-bs-toggle', 'collapse');
        parentA.setAttribute('data-bs-target', `#${bookGroup}`);
        parentA.setAttribute('aria-expanded', 'false');
        parentA.style.color = textContrastColor;
        parentA.style.backgroundColor = book.color;
        
        // Unexpanded Title info
        let titleContainer = document.createElement('div');
        titleContainer.className = 'd-flex w-100 justify-content-between';
        
        let titleDiv = document.createElement('h5');
        titleDiv.className = 'mb-1';
        titleDiv.textContent = book.title;

        titleContainer.appendChild(titleDiv);
        parentA.appendChild(titleContainer);

        // div that collapses and holds the ul with book data
        let collapseDiv = document.createElement('div');
        collapseDiv.className = 'collapse'
        collapseDiv.id = bookGroup

        // ul that holds the list of book attributes
        let childUl = document.createElement('ul');
        childUl.className = 'list-group list-group-flush rounded-2'

        // Edit button goes at the top of the dissapearing list
        let btnLi = document.createElement('li');
        btnLi.className = 'list-group-item d-flex flex-column';

        let editBtn = document.createElement('button');
        editBtn.className = 'btn btn-secondary edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.setAttribute('value', bookGroup)

        btnLi.appendChild(editBtn)
        childUl.appendChild(btnLi);

        // li that show the information from the book data
        Object.entries(dataToDisplay).forEach(([key, value]) => {
            let li = document.createElement('li');
            li.className = 'list-group-item d-flex flex-column';
            
            let dataKey = document.createElement('div');
            dataKey.textContent = key;
            dataKey.style.overflowWrap = 'word-wrap';
            dataKey.style.textDecoration = 'underline'

            let dataValue = document.createElement('div');
            dataValue.textContent = value;
            dataValue.style.overflowWrap = 'break-word';
            dataValue.style.fontStyle = 'italic'

            // Append children to list item
            li.appendChild(dataKey);
            li.appendChild(dataValue);

            childUl.appendChild(li);
        });

        // Append book details lists to collapsable div
        collapseDiv.appendChild(childUl);

        parentA.appendChild(collapseDiv)

        // Append everything to the DOM
        sideBarDataView.appendChild(parentA);
    });

    updateEditBtns();
}

// Edit buttons in sidebar
function updateEditBtns(){
    editBtns = document.querySelectorAll('.edit-btn');
    editBtns.forEach((btn)=>{
        addEditBtnListener(btn);
    });
}

//********//
// Modals //
//********//

// Sets the date fields in the modals to the current date and the due date to 10 days from now
function setFormDates() {
    document.getElementById('receiveDate').value = todaysDate;
    document.getElementById('receiveDate').min = minDate;
    document.getElementById('receiveDate').max = maxDate;
  
    document.getElementById('dueDate').value = estEndDate;
    document.getElementById('dueDate').min = minDate;
    document.getElementById('dueDate').max = maxDate;
  }
  
// Populates the Edit book modal with the book data then shows the modal
// Called from .edit-btn event listener - recieves book object from bookId bound to .edit-btn
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
//#endregion UI Updates

////////////////////////////////
//   Handle CRUD Operations   //
////////////////////////////////
//#region CRUD Operations

//*******//
// Books //
//*******//

// Create a book from the new book form modal
function addBookFromModal(event) {
    // prevents refreshing page
    event.preventDefault();
    
    if (!newBookForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        alert("Please fill out all required fields.");
    }
    var formData = new FormData(newBookForm);
    var formObj = {};
    formData.forEach((value,key) =>{
        formObj[key] = value;
    });

    // Close and reset Modal
    newBookForm.reset();
    var modal = bootstrap.Modal.getInstance(document.getElementById('new-book-modal'));
    modal.hide();
    setFormDates();

    // Handle new book input
    book = new LocalBook(formObj);
    createBook(book);
}

// Update a book from the edit book form modal
function editBookFromModal(event) {
    // prevents refreshing page
    event.preventDefault();

    console.log(`submitted edit to nothing`);
    
    if (!editBookForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        alert("Please fill out all required fields.");
    }
    var formData = new FormData(editBookForm);
    var formObj = {};
    formData.forEach((value,key) =>{
        formObj[key] = value;
    });

    // Close and reset Modal
    editBookForm.reset();
    var modal = bootstrap.Modal.getInstance(document.getElementById('edit-book-modal'));
    modal.hide();

    // Handle edit book input
    book = new LocalBook(formObj);
    updateBook(book);
}

// Delete a book from the delete book button in the edit modal
function deleteBookFromModal() {

    if (confirm('Are you sure you want to delete this book?')) {
        // User clicked yes, proceed with delete
        console.log('Delete confirmed');
        const bookId = editBookForm.getAttribute('value');

        var modal = bootstrap.Modal.getInstance(document.getElementById('edit-book-modal'));
        modal.hide();

        deleteBook(bookId);
    }
}
//#endregion CRUD Operations

/////////////////////////////
//   Add Event Listeners   //
/////////////////////////////
//#region Event Listeners

// Submit New Book Button in New Book Modal
newBookForm.addEventListener('submit', (event) => {
    addBookFromModal(event);
});

// Edit Book Submit Button in Edit Book Modal
editBookForm.addEventListener('submit', (event) => {
    editBookFromModal(event);
});

// Delete Button in Edit Book Modal
editDeleteBtn.addEventListener('click', () => {
    deleteBookFromModal();
});

// Edit Buttons in Sidebar
function addEditBtnListener(btn) {
    btn.addEventListener('click', function(event) {
        event.stopPropagation();
        
        // Get book to edit
        const bookId = btn.value;
        const book = getBookFromId(bookId)
        editBookModal(book)
    });
}
//#endregion Event Listeners