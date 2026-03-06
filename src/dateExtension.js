/**
 * Converts a Date object to ISO 8601 format string (YYYY-MM-DD)
 * @param {Date} date - The date to convert
 * @returns {string} - ISO 8601 formatted date string
 */
export function getReadableDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}