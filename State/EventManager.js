const Event = require ('../Model/Event.js');

class EventManager {
    
    constructor() {
        console.log(`EventManager Constructed`);
        this.avgHoursPerDay = 5;
    }

    calculateDailyGoals(wordsRemaining, pagesRemaining, editingUnitsRemaining) {
        if (editingUnitsRemaining > 0) {
            const wordsPerUnit = Math.ceil(wordsRemaining / editingUnitsRemaining);
            const pagesPerUnit = Math.ceil(pagesRemaining / editingUnitsRemaining);
            const unitsForDay = Math.min(this.avgHoursPerDay, editingUnitsRemaining);
    
            return {
                wordGoal: unitsForDay * wordsPerUnit,
                pageGoal: unitsForDay * pagesPerUnit,
            };
        }
        return { wordGoal: 0, pageGoal: 0 };
    }

    generateEventsForNewBook(book, validDates) {
        let newEvents = [];
        validDates.forEach(date => {
            newEvents.push(this.generateNextEvent(book, date, newEvents, validDates));
        });
        return newEvents;
    }

    generateNextEvent(book, date, newEvents, validDates, updatedEvent=[]) {
        const { groupId, title, words, pages, letterDayFloat, color } = book;
        const isLastAvailableDay = (date === validDates[validDates.length - 1]);

        const previousEvent = newEvents[newEvents.length - 1] || {};
        const wordProgress = updatedEvent.userWordProgress || ((previousEvent.userWordProgress || previousEvent.wordGoal) || 0);
        const pageProgress = updatedEvent.userPageProgress || ((previousEvent.userPageProgress || previousEvent.pageGoal) || 0);
        let letterProgress = previousEvent.cumLetterHours || 0;

        const totalDatesRemaining = validDates.filter(x => x >= date).length;
        const totalUnitsRemaining = totalDatesRemaining * this.avgHoursPerDay;
        const editingUnitsRemaining = Math.max(totalUnitsRemaining - letterDayFloat, 0);

        let wordGoal = words;
        let pageGoal = pages;
        let dailyLetterHours = 0;

        if (isLastAvailableDay) {
            wordGoal = words; // Complete all remaining words
            pageGoal = pages; // Complete all remaining pages
            dailyLetterHours = letterDayFloat - letterProgress; // Remaining letter hours
            letterProgress += dailyLetterHours;
        } else {
            const wordsRemaining = words - wordProgress;
            const pagesRemaining = pages - pageProgress;
            const { wordGoal: dailyWordGoal, pageGoal: dailyPageGoal } = this.calculateDailyGoals(wordsRemaining, pagesRemaining, editingUnitsRemaining);

            wordGoal = wordProgress + dailyWordGoal;
            pageGoal = pageProgress + dailyPageGoal;

            if (totalUnitsRemaining <= letterDayFloat - letterProgress) {
                dailyLetterHours = Math.max(this.avgHoursPerDay - editingUnitsRemaining, 0);
                letterProgress += dailyLetterHours;
            }
        }

        const backgroundColor = color;
        const borderColor = color;
        const textColor = this.getTextColor(color);

        return new Event({
            groupId: groupId,
            eventId: (previousEvent.eventId || 0) + 1,
            title: this.eventTitleGenerator(title, wordProgress, wordGoal, dailyLetterHours),
            start: date,
            wordsReached: wordProgress,
            wordGoal: wordGoal,
            pagesReached: pageProgress,
            pageGoal: pageGoal,
            dayLetterHours: dailyLetterHours,
            cumLetterHours: letterProgress,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            textColor: textColor,
            userWordProgress: updatedEvent.userWordProgress || 0,
            userPageProgress: updatedEvent.userPageProgress || 0,
        });
        
    }

    updateEvents(book, validDates, events, updatedEvent) {
        const { groupId, title, pages, words, letterDayFloat } = book;
    
        // Find the index of updatedEvent in the ordered events
        const updatedEventIndex = events.findIndex(event => event.eventId === updatedEvent.eventId);
        if (updatedEventIndex === -1) {
            console.error(`Updated event with ID ${updatedEvent.eventId} not found in the events list.`);
            return events; // Return the original list if the event isn't found
        }
    
        // Separate events before and after the updatedEvent
        const previousEvents = events.slice(0, updatedEventIndex);
        const remainingDates = validDates.slice(updatedEventIndex);
    
        // Regenerate events starting from the updatedEvent
        const newEvents = [...previousEvents];
        let currentEventData = updatedEvent;
    
        remainingDates.forEach((date, index) => {
            if (index < 1){
                // Treat UpdatedEvent Differently
                currentEventData = this.generateNextEvent(book, date, newEvents, remainingDates, updatedEvent);
            } 
            else {
                currentEventData = this.generateNextEvent(book, date, newEvents, remainingDates);
            }
            newEvents.push(currentEventData);
        });
    
        // Combine the previous and newly generated events
        return [...newEvents];
    }
    

    eventTitleGenerator(bookTitle, wordsReached, wordGoal, dailyLetterHours) {
        let WRFormatted = wordsReached;
        let WGFormatted = wordGoal;
        
        if (wordsReached > 1000){
            WRFormatted = (wordsReached / 1000).toFixed(1) + 'k';
        }

        if (wordGoal > 1000) {
            WGFormatted = (wordGoal / 1000).toFixed(1) + 'k';
        }
        
        const title = bookTitle;

        return `${title}: ${WRFormatted} of ${WGFormatted}${(dailyLetterHours > 0 ? ' & Letter' : '')}`
    }

    getTextColor(color) {
        // Convert hex color to RGB
        let r, g, b;
    
        if (color.startsWith('#')) {
          const hex = color.slice(1);
          if (hex.length === 3) {
            // Short hex format (e.g., #123)
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
          } else if (hex.length === 6) {
            // Full hex format (e.g., #112233)
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
          } else {
            throw new Error('Invalid hex color format');
          }
        } else {
          throw new Error('Color must be in hex format (e.g., #123 or #112233)');
        }
    
        // Calculate relative luminance
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    
        // Return light or dark text color based on luminance
        return luminance > 186 ? '#000000' : '#FFFFFF';
      }
}

exports.EventManager = EventManager;