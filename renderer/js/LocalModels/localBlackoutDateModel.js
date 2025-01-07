class localBlackoutDate {
    /**
     * Creates a BlackoutDate instance.
     * @param {string} date - [yyyy-mm-dd] The date that will not be worked.
     * @throws {Error} If the blackout date format is invalid.
     */
    constructor(date) {
        
        if (!isValidDate(date)) {
            throw new Error("Invalid date format provided.");
        }
        
        this.date = date;

        // Placeholder for multiple users if necessary.
        this.userId = 1;
        this.userGroup = 1;
    }
}