const fs = require('fs');
const readFiles  = require ('fs');
const Book = require( '../Model/Book.js');
const Event = require( '../Model/Event.js');
const BlackoutDate = require( '../Model/BlackoutDate.js');
const json = require( 'stream/consumers');
const group = require( 'console');

class State {
    /**
     * Manages the state of the application respective to data.json
     */
    constructor(bookManager, eventManager, blackoutDateManager, dataFilePath) {
        this.dataFilePath = dataFilePath;
        this.books = [];
        this.nextGroupId;
        this.events = [];
        this.blackoutDates =[];
        this.blackoutDatesSet = new Set();
        this.bookManager = bookManager;
        this.eventManager = eventManager;
        this.blackoutDateManager = blackoutDateManager;

        this.loadState();
    }

    // Load state from file
    loadState() {
        try {
            const rawData = fs.readFileSync(this.dataFilePath, 'utf-8');
            const jsonData = JSON.parse(rawData);
    
            this.books = (jsonData.books || []).map(bookData => {
                return new Book(bookData);
            });
    
            this.blackoutDates = (jsonData.blackoutDates || []).map(blackoutDateData => {
                const blackoutDateParams = Object.values(blackoutDateData);
                this.blackoutDatesSet.add(blackoutDateData.date);
                return new BlackoutDate(...blackoutDateParams);
            });
    
            this.events = (jsonData.events || []).map(eventData => {
                return new Event(eventData);
            });
    
                this.nextGroupId = this.books.reduce((maxId, book) => Math.max(maxId, book.groupId || 0), 0) + 1;
    
        } catch (error) {
            console.error("Error loading state, initializing defaults:", error);
            // Don't accidentally reset the whole project
            
            // this.books = [];
            // this.blackoutDates = [];
            // this.events = [];
            // this.nextGroupId = 1;
        }
    }
    
    // Save current state to file
    saveState () {
        const jsonData = {
            books: this.books,
            nextGroupId: this.nextGroupId, 
            blackoutDates: this.blackoutDates,
            events: this.events
        };
        fs.writeFileSync(this.dataFilePath, JSON.stringify(jsonData, null,2), 'utf-8');
    }

    // Resets the data storage to blank
    resetState() {
        this.books = [];
        this.blackoutDates = [];
        this.blackoutDatesSet = new Set();
        this.events = [];
        this.nextGroupId = 1;
        this.saveState();
    }

    getNextGroupId () {
        return this.nextGroupId;
    }

    getBlackoutDates() {
        return this.blackoutDates();
    }

    ////////////////////////////
    //     CRUD Operations    //
    ////////////////////////////
    //#region CRUD Operations

    //*******//
    // Books //
    //*******//
    //#region Books

    // Add new book
    addBook(book) {
        let newBook = new Book(book);
        newBook.groupId = this.nextGroupId;
        const events = this.generateEventsForNewBook(newBook);
        this.nextGroupId += 1;
        this.books.push(newBook);
        this.events.push(...events);
        this.saveState();
    }

    // Update a book
    updateBook(updatedBook) {
        
        throw new Error('Not implemented');

        const book = this.books.find(book => book.groupId === updatedBook.groupId);
        if (!book) {
            console.error(`No book found for groupId ${updatedBook.groupId}`);
        }
    }

    // Delete a book
    deleteBook(groupId) {
        // Remove the book
        const book = this.books.find(book => book.id === groupId);
        if (book) {
            this.books = this.books.filter(book => book.groupId !== groupId);
        }
        
        // Remove the events
        const events = this.events.filter(event => event.groupId === groupId);
        if (events.length > 0) {
            this.events = this.events.filter(event => event.groupId !== groupId);
        }

        this.saveState();
    }
    //#endregion Books

    //********//
    // Events //
    //********//
    //#region Events

    // Update events from a specific event point
    updateEvents(updatedEvent, saveState=true, returnEvents=false) {
        console.log(updatedEvent);
        console.log(updatedEvent.groupId);
        const book = this.books.find(book => book.groupId === updatedEvent.groupId);
        if (!book) {
            console.error(`No book found for groupId ${updatedEvent.groupId}`);
            return;
        }
    
        const validDates = this.getValidDates(book);
        const events = this.events.filter(event => event.groupId === updatedEvent.groupId);
    
        const updatedEvents = this.eventManager.updateEvents(book, validDates, events, updatedEvent);
        this.events = this.events.filter(event => event.groupId !== updatedEvent.groupId).concat(updatedEvents);
    
        if (saveState){
            this.saveState();
        }

        if (returnEvents) {
            return this.events;
        }
    }

    // Delete an event
    deleteEvent(eventId) {
        throw new Error('Not implemented');

        // Would need to update the event calculations, this wont work
        this.events = this.events.filter(event => event.id !== eventId);
        this.saveState();
    }
    //#endregion Events

    //****************//
    // Blackout Dates //
    //****************//
    //#region Blackout Dates

    // Add new blackout date
    addBlackoutDate(blackoutDate) {
        if (!this.blackoutDatesSet.has(blackoutDate.date)) {
            this.blackoutDates.push(blackoutDate);
            this.blackoutDatesSet.add(blackoutDate.date);
            
            this.events = this.blackoutDateManager.manageBlackoutDateEventsUpdate(
                blackoutDate,
                this
            );
            
            this.saveState();
        }
    }

    // Removes a blackout date
    removeBlackoutDate(blackoutDate) {
        if(this.blackoutDatesSet.has(blackoutDate.date)) {
            this.blackoutDates = this.blackoutDates.filter(bd => bd.date !== blackoutDate.date);
            this.blackoutDatesSet.delete(blackoutDate.date);

            this. events = this.blackoutDateManager.manageBlackoutDateEventsUpdate(
                blackoutDate, 
                this
            );
            
            this.saveState();
        }
    }
    //#endregion Blackout Dates
    //#endregion CRUD Operations
    
    /////////////////////////////
    //     Helper Functions    //
    /////////////////////////////

    // Generates events for a new book
    generateEventsForNewBook (book) {
        const validDates = this.getValidDates(book);
        return this.eventManager.generateEventsForNewBook(book, validDates)
    }

    // Returns the valid dates for a book
    getValidDates(book) {
        const { receiveDate, dueDate } = book
        const incrementDate = (dateString) => {
            const [year, month, day] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, day + 1); // Increment by one day
            return date.toISOString().split('T')[0]; // Convert back to YYYY-MM-DD
        };
    
        const dates = [];
        let current = receiveDate;
    
        while (current <= dueDate) {
            if (!this.blackoutDatesSet.has(current)) {
                dates.push(current); // Add the date if it’s not in blackout dates
            }
            current = incrementDate(current); // Increment to the next day
        }
    
        return dates;
    }
}

exports.State = State;