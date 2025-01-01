/**
 * Validates if a given string is in the format YYYY-MM-DD and represents a valid date.
 * @param {string} dateString - The date string to validate.
 * @returns {boolean} - Returns true if the date is valid, otherwise false.
 */
function isValidDate(dateString) {
    // Check if the string matches the format YYYY-MM-DD
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!dateRegex.test(dateString)) {
        return false; // Fails format check
    }

    // Split the string into components
    const [year, month, day] = dateString.split('-').map(Number);

    // Check if the date components form a valid date
    const date = new Date(year, month - 1, day); // Months are zero-indexed in JS Date
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

exports.isValidDate = isValidDate;