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

/**
 * Lightens a hex color by the specified percentage.
 * @param {string} hexColor - The hex color code (e.g., "#ff5733").
 * @param {number} percent - The percentage to lighten (0 to 100).
 * @returns {string} - The lightened hex color.
 */
function lightenHexColor(hexColor, percent) {
    // Remove the hash symbol if present
    let color = hexColor.startsWith("#") ? hexColor.slice(1) : hexColor;

    // Parse the RGB values
    let r = parseInt(color.slice(0, 2), 16);
    let g = parseInt(color.slice(2, 4), 16);
    let b = parseInt(color.slice(4, 6), 16);

    // Calculate the lightening factor
    let lighten = (value) => Math.min(255, Math.floor(value + (255 - value) * (percent / 100)));

    // Apply lightening
    r = lighten(r);
    g = lighten(g);
    b = lighten(b);

    // Convert back to hex
    let toHex = (value) => value.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getContrastColor(color) {
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

exports.isValidDate = isValidDate;