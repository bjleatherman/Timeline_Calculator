class BookData{
    constructor(data) {
        this.bookId = this.getNextBookId();
        this.title = data['book-title'];
        this.author = data['author-name'];
        this.startDate = data['start-date'];
        this.endDate = data['end-date'];
        this.wordCount = data['word-count'];
        this.phase = data['phase'];
        this.jsonString = '';
        this.blackoutDates = [];
        this.currentProgress = 0;
        this.eventColor = data['event-color'];

        // Formatted for the calEvents.books
        this.data = this.setBookData();

        // Formatted for hte calEvents.events
        this.calEvents = this.formatForCalendar();
    }

    setBookData(){
        let data = {
            'bookId': this.bookId,
            'title': this.title,
            'author': this.author,
            'startDate': this.startDate,
            'endDate': this.endDate,
            'wordCount': this.wordCount,
            'phase': this.phase,
            'blackoutDates': this.blackoutDates,
            'currentProgress': 0,
            'color': this.eventColor,
        }
        return data;
    }

    formatForCalendar() {
        let dates = this.getDatesBetween(this.startDate, this.endDate);
        // console.log(dates);
        let daysCount = dates.length
        let weekendCount = 0;
        let blackoutDatesCount = 0;

        let totalUnits = 0;
        let wordsPerUnit = 0;
        let titleBuilder = '';
        let fullBookLength = this.wordCount
        let wordsAchieved = 0;

        dates.forEach(date => {
            if (calEvents.blackoutDates.includes(date) || this.blackoutDates.includes(date)){
                blackoutDatesCount ++;
            }
        });

        dates.forEach((date) => {
            // Dont count weekends if they are a blackout date
            if (!calEvents.blackoutDates.includes(date) && !this.blackoutDates.includes(date)){
                if(this.checkIfWeekend(date)){
                    weekendCount ++;
                }
            }
            
        });

        totalUnits = daysCount + weekendCount - blackoutDatesCount;
        wordsPerUnit = Math.round(this.wordCount / totalUnits)
        // console.log(`wordCount: ${this.wordCount}\ntotalUnits: ${totalUnits}\nwordsPerUnit: ${wordsPerUnit}\ndaysCount: ${daysCount}\nweekendCount: ${weekendCount}`);

        let events = [];
        
        dates.forEach((date) => {
            if (!calEvents.blackoutDates.includes(date) && !this.blackoutDates.includes(date)){
                let wordDayGoal = wordsPerUnit
                if (this.checkIfWeekend(date)) {
                    wordDayGoal *= 2;
                }

                wordsAchieved += wordDayGoal

                events.push({
                    'groupId': this.bookId,
                    'title': `${formatNumbersWithComma(wordsAchieved)}: ${this.title}`,
                    'start': date,
                    'word goal': `${formatNumbersWithComma(wordDayGoal)}`, 
                    'color': this.eventColor
                });
                
                fullBookLength -= wordDayGoal
            }
        });

        return events;
    }

    checkIfWeekend(dateString) {
        let date = new Date(dateString);
        let dayOfWeek = date.getUTCDay();
        return dayOfWeek === 0 || dayOfWeek === 6
    }

    getDatesBetween(startDate, endDate) {
        let dates = [];
        let currentDate = new Date(startDate);

        endDate = new Date(endDate);
        endDate.setHours(23, 59, 59, 999)

        while (currentDate <= endDate) {
            let dateString = currentDate.toISOString().split('T')[0];
            dates.push(dateString);

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }

    getNextBookId() {
        let newId = 1
        let usedGroupIds = []
        calEvents.events.forEach((event) => {
            if ('groupId' in event) {
                // console.log(event['groupId']);
                usedGroupIds.push(event['groupId'])
            }
        });
        
        while (usedGroupIds.includes(newId)) {
            newId ++;
        }
        
        return newId;
    }
}

// let book = new BookData(1, 'ass', 'titties', '2023-12-29', '2024-01-02', 1000)
// book.formatForCalendar();