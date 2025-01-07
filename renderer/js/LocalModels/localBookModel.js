class LocalBook {
    /**
     * Creates a Book instance.
     * @param {object} options - Object containing the book properties.
     * @param {string} options.title - The title of the book.
     * @param {string} options.author - The author of the book.
     * @param {string} options.type - The type of editing that is being done.
     * @param {number} options.pages - The total number of pages.
     * @param {number} options.words - The total number of words.
     * @param {string} options.receiveDate - [yyyy-mm-dd] The date that the book will be/ was received.
     * @param {string} options.dueDate - [yyyy-mm-dd] The date that the book is due.
     * @param {boolean} options.needsLetter - If the edit needs a letter written upon completion.
     * @param {number} options.letterDayFloat - The number of hours needed to write the letter.
     * @param {Array} options.otherTasks - Other tasks that need to be completed.
     * @param {Array} options.otherTaskFloat - Number of days that each other task requires.
     * @param {string} options.color - The color code associated with this book.
     * @throws {Error} If the receiveDate or dueDate format is invalid.
     */
    constructor(options) {
        const {
            title,
            author,
            type,
            pages,
            words,
            receiveDate,
            dueDate,
            needsLetter,
            letterDayFloat,
            otherTasks,
            otherTaskFloat,
            color,
        } = options;

        if (!isValidDate(receiveDate) || !isValidDate(dueDate)) {
            throw new Error("Invalid date format provided.");
        }
        this.groupId = null;
        this.title = title;
        this.author = author;
        this.type = type;
        this.pages = pages * 1;
        this.words = words * 1;
        this.receiveDate = receiveDate;
        this.dueDate = dueDate;
        this.needsLetter = needsLetter;
        this.letterDayFloat = letterDayFloat * 1;
        this.otherTasks = otherTasks;
        this.otherTaskFloat = otherTaskFloat * 1;
        this.color = color;

        // Placeholder for multiple users if necessary.
        this.userId = 1;
        this.userGroup = 1;
    }
}

