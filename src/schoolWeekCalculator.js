import { getReadableDateString } from "./dateExtension.js";

/**
 * Berechnet die Anzahl der ISO-Schulwochen zwischen zwei Daten unter Berücksichtigung von Ferien und Feiertagen
 * @param {string} startDateStr - Startdatum im Format YYYY-MM-DD
 * @param {string} endDateStr - Enddatum im Format YYYY-MM-DD
 * @param {Set<string>} holidays - Set von Feiertagen im Format YYYY-MM-DD
 * @returns {string} - Anzahl der Schulwochen mit einer Dezimalstelle
 */
export function getNumberOfISOWeeks(startDateStr, endDateStr, holidays) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (startDate > endDate) {
    throw new Error("Startdatum liegt nach dem Enddatum");
  }

  const startISO = getISOWeekData(startDate);
  const endISO = getISOWeekData(endDate);

  // Spezialfall: alles in einer ISO-Woche
  if (
    startISO.isoYear === endISO.isoYear &&
    startISO.isoWeek === endISO.isoWeek
  ) {
    return calculatePartialWeek(startDate, endDate, holidays);
  }

  // Erste Woche anteilig
  const endOfStartWeek = getEndOfISOWeek(startDate);
  const firstWeekPart = calculatePartialWeek(startDate, endOfStartWeek, holidays);

  // Letzte Woche anteilig
  const startOfEndWeek = getStartOfISOWeek(endDate);
  const lastWeekPart = calculatePartialWeek(startOfEndWeek, endDate, holidays);

  // Ganze Wochen dazwischen
  const fullWeeksBetween = calculateFullWeeksBetween(startISO, endISO);

  return (firstWeekPart + fullWeeksBetween + lastWeekPart).toFixed(1);
}

/**
 * Gibt ISO-Wochendaten für ein bestimmtes Datum zurück
 * @param {Date} date - Das Datum
 * @returns {object} - Objekt mit isoYear und isoWeek
 */
function getISOWeekData(date) {
  const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  
  // Donnerstag bestimmt ISO-Jahr
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7));
  
  const isoYear = tempDate.getUTCFullYear();
  
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const weekNumber = Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);

  return { isoYear, isoWeek: weekNumber };
}

/**
 * Gibt die ISO-Wochennummer für ein bestimmtes Datum zurück
 * @param {Date} date - Das Datum
 * @returns {number} - Die ISO-Wochennummer
 */
export function getISOWeekNumber(date) {
  // UTC verwenden, um Zeitzonenprobleme zu vermeiden
  const target = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));

  // Donnerstag bestimmt die KW
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);

  // Erster Donnerstag des Jahres
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));

  const diffInDays = (target - firstThursday) / 86400000;

  return 2 + Math.floor(diffInDays / 7);
}

function getStartOfISOWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  if (day !== 1) {
    d.setDate(d.getDate() - (day - 1));
  }
  return d;
}

function getEndOfISOWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  if (day !== 7) {
    d.setDate(d.getDate() + (7 - day));
  }
  return d;
}

/**
 * Berechnet Schultage für einen Teilzeitraum einer Woche
 * @param {Date} start - Startdatum
 * @param {Date} end - Enddatum
 * @param {Set<string>} holidays - Set von Feiertagen
 * @returns {number} - Anteil der Schultage als Dezimalzahl (0-1)
 */
function calculatePartialWeek(start, end, holidays) {
  let schoolDays = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    const isWeekday = day >= 1 && day <= 5;
    const dateStr = getReadableDateString(current);
    const isHoliday = holidays.has(dateStr);

    if (isWeekday && !isHoliday) {
      schoolDays++;
    }

    current.setDate(current.getDate() + 1);
  }

  return schoolDays / 5;
}

/**
 * Berechnet die Anzahl ganzer Schulwochen zwischen zwei ISO-Wochen
 * @param {object} startISO - ISO-Wochendaten des Startdatums
 * @param {object} endISO - ISO-Wochendaten des Enddatums
 * @returns {number} - Anzahl der ganzen Wochen (ohne Partial-Wochen)
 */
function calculateFullWeeksBetween(startISO, endISO) {
  let weeks = 0;

  let year = startISO.isoYear;
  let week = startISO.isoWeek + 1;

  while (
    year < endISO.isoYear ||
    (year === endISO.isoYear && week < endISO.isoWeek)
  ) {
    weeks++;

    week++;

    const weeksInYear = getISOWeeksInYear(year);
    if (week > weeksInYear) {
      week = 1;
      year++;
    }
  }

  return weeks;
}

/**
 * Gibt die Anzahl der ISO-Wochen in einem Jahr zurück
 * @param {number} year - Das Jahr
 * @returns {number} - Anzahl der ISO-Wochen (52 oder 53)
 */
function getISOWeeksInYear(year) {
  const d = new Date(Date.UTC(year, 11, 31));
  const week = getISOWeekData(d).isoWeek;
  return week === 1 ? 52 : week;
}
