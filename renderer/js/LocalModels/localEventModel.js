class LocalEvent{
    /**
     * Creates an Event instance.
     * @param {number} groupId - The ID of the book group this event belongs to.
     * @param {number} eventId - The unique ID for the event.
     * @param {string} title - The title of the book or task.
     * @param {string} start - [yyyy-mm-dd] The start date of the event.
     * @param {number} userWordProgress - Progress of words as entered by the user
     * @param {number} userPageProgress - Progress of pages as entered by the user
     * @param {number} wordsReached - Words completed by this event.
     * @param {number} wordGoal - Word goal for this event.
     * @param {number} pagesReached - Pages completed by this event.
     * @param {number} pageGoal - Page goal for this event.
     * @param {number} dayLetterHours - Hours spent on letters for this day.
     * @param {number} cumLetterHours - Hours spent on letters for this event.
     * @param {string} backgroundColor - The color code associated with this book.
     * @param {string} borderColor - The color code associated with this book.
     * @param {string} textColor - Color of text to be displayed to user.
     * @throws {Error} If the start date format is invalid.
     */

    constructor(options) {
        const {
            groupId,
            eventId,
            title,
            start,
            wordsReached,
            wordGoal,
            pagesReached,
            pageGoal,
            dayLetterHours,
            cumLetterHours,
            backgroundColor,
            borderColor,
            textColor,
            userWordProgress = 0,
            userPageProgress = 0,
        } = options;

        if (!isValidDate(start)) {
            throw new Error("Invalid date format provided.");
        }

        this.groupId = groupId  * 1;
        this.eventId = eventId * 1;
        this.title = title;
        this.start = start;
        this.wordsReached = wordsReached * 1;
        this.wordGoal = wordGoal * 1;
        this.pagesReached = pagesReached * 1;
        this.pageGoal = pageGoal * 1;
        this.dayLetterHours = dayLetterHours * 1;
        this.cumLetterHours = cumLetterHours * 1;
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.textColor = textColor;
        this.userWordProgress = userWordProgress * 1;
        this.userPageProgress = userPageProgress * 1;

        // Placeholder for multiple users if necessary
        this.userId = 1;
        this.userGroup = 1;
    }
}