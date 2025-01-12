const { ServiceLocator } = require('../Services/ServiceLocator.js');
const Event = require('../Model/Event.js');

class BlackoutDateManager {
    constructor() {
        console.log(`BlackoutDateManager Constructed`);
    }

    addBlackoutDate() {

    }

    removeBlackoutDate() {

    }

    manageBlackoutDateEventsUpdate(blackoutDate, state) {

        const affectedBooks = state.books.filter(book =>
            book.startDate <= blackoutDate.date &&
            book.dueDate >= blackoutDate.date
        );

        if (affectedBooks.length <= 0) {
            return state.events;
        }

        const updatedEvents = this.calcEventsBlackoutDateChange(affectedBooks,state);
        return this.mergeUpdatedEvents(updatedEvents, state);
    }

    calcEventsBlackoutDateChange(affectedBooks, state) {

        const newEvents = [];

        // Iterate over the affected books, updating each of their event groups
        affectedBooks.forEach(book => {

            // Get the first event for each book and use it to recalculate the events from there
            const firstEventData = state.events.find(event => 
                book.groupId === event.groupId &&
                event.eventId === 1
            );

            if (!firstEventData) {
                throw new Error(`No event was found with Event Id ${firstEventData.eventId} and GroupId ${firstEventData.groupId}`);
            }
            
            const recalculatedEvents = state.updateFromSingleEvent(firstEventData, false, true);
            newEvents.push(...recalculatedEvents);
        });

        return newEvents
    }

    mergeUpdatedEvents(updatedEvents, state) {
        // Extract all affected groupIds
        const affectedGroupIds = new Set(updatedEvents.map(event => event.groupId));
    
        // Filter out events that belong to affected groupIds
        state.events = state.events.filter(event => !affectedGroupIds.has(event.groupId));
    
        // Add the updated events to state.events
        return state.events.concat(updatedEvents);
    }
}

exports.BlackoutDateManager = BlackoutDateManager;