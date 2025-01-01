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
            book.receiveDate <= blackoutDate.date &&
            book.dueDate >= blackoutDate.date
        );

        if (affectedBooks.length <= 0) {
            return state.events;
        }

        const updatedEvents = this.calcEventsBlackoutDateChange(affectedBooks,state);
        return this.mergeUpdatedEvents(updatedEvents, state);
    }

    calcEventsBlackoutDateChange(affectedBooks, state) {

        const eventManager = ServiceLocator.get('eventManager');

        let newEvents = [];
        affectedBooks.forEach(book => {
            const firstEventData = state.events.filter(event => 
                book.groupId === event.groupId &&
                event.eventId === 1
            );

            if (firstEventData.length > 1) {
                throw new Error('There should only be a single first event in an event series');
            }

            if (firstEventData.length === 1) {
                const firstEvent = firstEventData.map(eventData => {
                    return new Event({ ...eventData });
                });
                
                const recalculatedEvents = state.updateEvents(firstEvent[0], false, true);
                newEvents.push(recalculatedEvents);
            }
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