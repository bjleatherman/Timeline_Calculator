// Description: Handles all UI updates and event listeners for the front end.

const submitBtn = document.getElementById('new-book-submit');
const newBookForm = document.getElementById('new-book-form');
const editBookForm = document.getElementById('edit-book-form');
const editEventForm = document.getElementById('edit-event-form');
const sideBarDataView = document.getElementById('book-sidebar-menu');
const editDeleteBtn = document.getElementById('delete-book');

// ?
const editBookModal = document.getElementById('edit-book-modal');
const editEventModal = document.getElementById('edit-event-modal');

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
    
    // Remove existing events
    calendar.removeAllEvents();
    
    // Add new events
    calendar.addEventSource(newEvents);

    try{
        // Generate blackout events
        const blackoutEvents = generateBlackoutEvents();
        if (blackoutEvents) {
            calendar.addEventSource(blackoutEvents);
        }
    }
    catch (error) {
        console.error(`Error generating blackout events: ${error}`);
    }
}

// Handles clicking on an event in the calendar
function handleEventClick(info) {
    if (info.event.groupId * 1  === blackoutEventsGroupId) {
        handleDateClick(info);
    }
    else {
        handleUserEventClick(info);
    }
}

// Handles clicking on a date in the calendar
function handleDateClick(info) {

    let date = getDateFromCalInfo(info);
    let blackoutDate = getBlackoutDate(date);
    handleBlackoutDateChange(blackoutDate, date);
}

// Handles clicking on a user event in the calendar
function handleUserEventClick(info) {
    
    const eventId = info.event.extendedProps.eventId * 1;
    const groupId = info.event.groupId * 1;
    console.log(`Event Clicked:
        EventId: ${eventId}
        GroupId: ${groupId}`);

    if(eventId < 0) { return; } // Don't allow edits on placeholder dates
    
    // Get the event from data storage
    const event = getEventFromIds(eventId, groupId);
    const book = getBookFromId(groupId);

    // Populate the edit event modal with the event data
    showEditEventModal(event, book);
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

    // console.log(`building navbar`);
    // console.log(calEvents.books);

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
        titleDiv.className = 'mt-1';
        titleDiv.textContent = book.title;

        titleContainer.appendChild(titleDiv);
        parentA.appendChild(titleContainer);

        // div that collapses and holds the ul with book data
        let collapseDiv = document.createElement('div');
        collapseDiv.className = 'collapse my-3';
        collapseDiv.id = bookGroup;

        // ul that holds the list of book attributes
        let childUl = document.createElement('ul');
        childUl.className = 'list-group list-group-flush rounded-2'

        // Edit button goes at the top of the dissapearing list
        let btnLi = document.createElement('li');
        btnLi.className = 'list-group-item d-flex flex-column';

        let editBtn = document.createElement('button');
        editBtn.className = 'btn btn-secondary edit-btn my-2';
        editBtn.textContent = 'Edit';
        editBtn.setAttribute('value', book.groupId)

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

// Edit buttons in navbar sidebar
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

    document.getElementById('startDate').value = todaysDate;
    document.getElementById('startDate').min = minDate;
    document.getElementById('startDate').max = maxDate;
  
    document.getElementById('dueDate').value = estEndDate;
    document.getElementById('dueDate').min = minDate;
    document.getElementById('dueDate').max = maxDate;
  }
  
// Populates the Edit book modal with the book data then shows the modal
// Called from .edit-btn event listener - recieves book object from bookId bound to .edit-btn
function showEditBookModal(book) {
    const editModal = new bootstrap.Modal(document.getElementById('edit-book-modal'))
    editBookForm.setAttribute('value', book.groupId);
    document.getElementById('edit-title').value = book.title;
    document.getElementById('edit-author').value = book.author;
    document.getElementById('edit-words').value = book.words;
    document.getElementById('edit-pages').value = book.pages;
    document.getElementById('edit-type').value = book.type;
    document.getElementById('edit-letterDayFloat').value = book.letterDayFloat;
    document.getElementById('edit-receiveDate').value = book.receiveDate;
    document.getElementById('edit-startDate').value = book.startDate;
    document.getElementById('edit-dueDate').value = book.dueDate;
    document.getElementById('edit-color-picker').value = book.color;

    editModal.show()
}

// Populates the Edit event modal with the event data then shows the modal
function showEditEventModal(event, book) {

    const eventModal = new bootstrap.Modal(editEventModal)
    editEventForm.setAttribute('value', event.groupId);

    const modalTitle = `Edit Event for ${book.title}: ${formatDateToMDYY(event.start)}`;
    document.getElementById('edit-event-modal-title').textContent = modalTitle;

    // Visible Inputs
    // document.getElementById('edit-userWordProgress').placeholder = event.wordGoal;
    document.getElementById('edit-userPageProgress').value = event.userPageProgress != 0 ? event.userPageProgress : event.pageGoal;
    
    // Visible Labels
    document.getElementById('edit-pagesReached-label').textContent = `Words at the start of day: ${event.pagesReached}`;
    document.getElementById('edit-pageGoal-label').textContent = `Word Goal: ${event.pageGoal}`;
    document.getElementById('edit-dayLetterHours-label').textContent = `Hours expected to spend on the letter today: ${event.dayLetterHours}`;
    
    // Hidden Inputs
    document.getElementById('edit-wordsReached').value = event.wordsReached;
    document.getElementById('edit-wordGoal').value = event.wordGoal;
    document.getElementById('edit-dayLetterHours').value = event.dayLetterHours;
    document.getElementById('edit-groupId').value = event.groupId;
    document.getElementById('edit-eventId').value = event.eventId;
    document.getElementById('edit-title').value = event.title;
    document.getElementById('edit-start').value = event.start;
    document.getElementById('edit-userWordProgress').value = event.userWordProgress;
    document.getElementById('edit-pagesReached').value = event.pagesReached;
    document.getElementById('edit-pageGoal').value = event.pageGoal;
    document.getElementById('edit-cumLetterHours').value = event.cumLetterHours;
    document.getElementById('edit-backgroundColor').value = event.backgroundColor;
    document.getElementById('edit-borderColor').value = event.borderColor;
    document.getElementById('edit-textColor').value = event.textColor;

    eventModal.show()
}

//#endregion UI Updates

////////////////////////////////
//   Handle CRUD Operations   //
////////////////////////////////
//#region CRUD Operations

//*******//
// Books //
//*******//
//#region Books UI CRUD

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
        const groupId = editBookForm.getAttribute('value');
        
        var modal = bootstrap.Modal.getInstance(document.getElementById('edit-book-modal'));
        modal.hide();
        
        deleteBook(groupId);
    }
}
//#endregion Books UI CRUD

//********//
// Events //
//********//

// Update an event from the edit event form modal
function editEventFromModal(event) {

    console.log(`editEventFromModal`);
    // throw new Error('Not implemented');

    // prevents refreshing page
    event.preventDefault();
    
    if (!editEventForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        alert("Please fill out all required fields.");
    }
    var formData = new FormData(editEventForm);
    var formObj = {};
    formData.forEach((value,key) =>{
        formObj[key] = value;
    });

    // Close and reset Modal
    editEventForm.reset();
    var modal = bootstrap.Modal.getInstance(document.getElementById('edit-event-modal'));
    modal.hide();

    // Handle edit event input
    updatedEvent = new LocalEvent(formObj);
    updateEvent(updatedEvent);
}
//#endregion CRUD Operations

//**************//
// BlacoutDates //
//**************//

// Determine if a blackout date should be added or removed
function handleBlackoutDateChange(blackoutDate, date) {
    // Check if that date is a blackout date
    if (blackoutDate) {
        // If it is a blackout date, ask the user if they want to delete it
        if (confirm('Are you sure you want to delete this blackout date?')) {
            // User clicked yes, proceed with delete
            deleteBlackoutDate(blackoutDate);
        }
    } 
    else {
        // If it is not a blackout date, ask the user if they want to add it
        if (confirm('Do you want to set date as a blackout date?')) {
            // User clicked yes, proceed with delete
            blackoutDate = new localBlackoutDate(date);
            createBlackoutDate(blackoutDate);
        }
    }
}

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

// Edit Event Submit Button in Edit Event Modal
editEventForm.addEventListener('submit', (event) => {
    editEventFromModal(event);
});

// Edit Buttons in Sidebar
function addEditBtnListener(btn) {
    btn.addEventListener('click', function(event) {
        event.stopPropagation();
        
        // Get book to edit
        const bookId = btn.value;
        const book = getBookFromId(bookId)
        showEditBookModal(book)
    });
}
//#endregion Event Listeners