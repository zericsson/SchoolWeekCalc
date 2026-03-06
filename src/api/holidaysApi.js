const BASE_URL = "https://www.mehr-schulferien.de/api/v2.1";

/**
 * Holt Ferientage für einen Zeitraum zwischen zwei Daten
 * @param {string} startDateStr
 * @param {string} endDateStr
 */

export async function fetchHolidays(state, startDateStr, endDateStr) {

    const url = `${BASE_URL}/federal-states/${state.toLowerCase()}/periods?start_date=${startDateStr}&end_date=${endDateStr}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Fehler beim Laden der Feriendaten (${state})`);
    }

    return await response.json();
}