import { getReadableDateString } from "./dateExtension.js";

/**
 * Berechnet die Anzahl der ISO-Schulwochen zwischen zwei Daten unter Berücksichtigung von Ferien und Feiertagen
 * @param {string} startDateStr - Startdatum im Format YYYY-MM-DD
 * @param {string} endDateStr - Enddatum im Format YYYY-MM-DD
 * @param {Set<string>} holidays - Set von Feiertagen im Format YYYY-MM-DD
 * @returns {string} - Anzahl der Schulwochen mit einer Dezimalstelle
 */
export function getNumberOfISOWeeks(startDateStr, endDateStr, holidays) {
  // Parse dates manually to avoid timezone issues
  const [startYear, startMonth, startDay] = startDateStr.split('-');
  const [endYear, endMonth, endDay] = endDateStr.split('-');
  
  const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
  const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));

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

  // Erste Woche anteilig (basierend auf Wochentag, nicht auf Schultage)
  const firstWeekPart = calculateStartWeekPart(startDate, holidays, startISO);

  // Letzte Woche anteilig (basierend auf Wochentag, nicht auf Schultage)
  const lastWeekPart = calculateEndWeekPart(endDate, holidays, endISO);

  // Ganze Wochen dazwischen
  const fullWeeksBetween = calculateFullWeeksBetween(startISO, endISO, holidays);

  return (firstWeekPart + fullWeeksBetween + lastWeekPart).toFixed(1);
}

/**
 * Returns ISO week data for a given date without duplicate weeks across years.
 * The week is uniquely identified by its Monday (weekStart).
 * Uses local date/time throughout; DST-safe arithmetic via UTC noon anchors.
 *
 * @param {Date} date
 * @returns {{isoYear:number, isoWeek:number, weekStart:Date}}
 */
function getISOWeekData(date) {
  // Normalize to local midnight (strips time component in local time)
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Rewind to Monday of the current ISO week (local time)
  const day = d.getDay() || 7; // Sunday (0) → 7
  d.setDate(d.getDate() - day + 1);
  const weekStart = new Date(d); // unique week identifier

  // Determine ISO year via Thursday rule (local time)
  const thursday = new Date(d);
  thursday.setDate(thursday.getDate() + 3);
  const isoYear = thursday.getFullYear();

  // Anchor both week boundaries at UTC noon to neutralise DST offsets
  // during millisecond arithmetic
  const weekStartUTC = Date.UTC(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate(),
    12 // noon anchor
  );
  const firstThursday = new Date(isoYear, 0, 4);
  const firstDay = firstThursday.getDay() || 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 1); // Monday of week 1
  const firstThursdayUTC = Date.UTC(
    firstThursday.getFullYear(),
    firstThursday.getMonth(),
    firstThursday.getDate(),
    12 // noon anchor
  );

  const isoWeek = Math.round((weekStartUTC - firstThursdayUTC) / 604800000) + 1;

  return { isoYear, isoWeek, weekStart };
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
 * Berechnet den Anteil der Startwoche basierend auf dem Wochentag
 * Wenn das Datum ein 'schulfreier' Tag ist, wird der nächste Schultag geprüft
 * Formel: (startWeekDay_DayOfWeek * 0.2)
 * Montag = 5, Dienstag = 4, Mittwoch = 3, Donnerstag = 2, Freitag = 1
 * Samstag = 0, Sonntag = 0
 * @param {Date} date - Das Startdatum
 * @param {Set<string>} holidays - Set von Feiertagen im Format YYYY-MM-DD
 * @returns {number} - Anteil der Startwoche (0-1)
 */
function calculateStartWeekPart(date, holidays, isoWeek) {
  const dayOfWeek = date.getDay();
  const dateStr = getReadableDateString(date);
  const isHoliday = holidays.has(dateStr);

  // dayOfWeek: 0 = Sonntag, 1 = Montag, ..., 6 = Samstag
  // Wenn das Datum ein Wochenendtag oder 'schulfreier' Tag ist, nächsten Tag prüfen
  if (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const nextWeek = getISOWeekData(nextDate);
    if (nextWeek.weekStart.toDateString() !== isoWeek.weekStart.toDateString()) {
      return 0;
    }

    return calculateStartWeekPart(nextDate, holidays, isoWeek);
  }
  
  // Montag (1) -> 5, Dienstag (2) -> 4, ..., Freitag (5) -> 1
  const weekValue = 6 - dayOfWeek;
  return weekValue / 5;
}

/**
 * Berechnet den Anteil der Endwoche basierend auf dem Wochentag
 * Wenn das Datum ein 'schulfreier' Tag ist, wird der vorherige Schultag geprüft
 * Formel: (endWeekDay_DayOfWeek * 0.2)
 * Montag = 1, Dienstag = 2, Mittwoch = 3, Donnerstag = 4, Freitag = 5
 * Samstag = 0, Sonntag = 0
 * @param {Date} date - Das Enddatum
 * @param {Set<string>} holidays - Set von Feiertagen im Format YYYY-MM-DD
 * @returns {number} - Anteil der Endwoche (0-1)
 */
function calculateEndWeekPart(date, holidays, isoWeek) {
  const dayOfWeek = date.getDay();
  const dateStr = getReadableDateString(date);
  const isHoliday = holidays.has(dateStr);
  
  // dayOfWeek: 0 = Sonntag, 1 = Montag, ..., 6 = Samstag
  // Wenn das Datum ein Wochenendtag oder 'schulfreier' Tag ist, vorherigen Tag prüfen
  if (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) {
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    
    const prevWeek = getISOWeekData(prevDate);
    if (prevWeek.weekStart.toDateString() !== isoWeek.weekStart.toDateString()) {
      return 0;
    }

    return calculateEndWeekPart(prevDate, holidays, isoWeek);
  }
  
  // Montag (1) -> 1, Dienstag (2) -> 2, ..., Freitag (5) -> 5
  return dayOfWeek / 5;
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
 * Eine Woche zählt als Schulwoche, wenn sie mindestens einen Schultag enthält
 * @param {object} startISO - ISO-Wochendaten des Startdatums
 * @param {object} endISO - ISO-Wochendaten des Enddatums
 * @param {Set<string>} holidays - Set von Feiertagen im Format YYYY-MM-DD
 * @returns {number} - Anzahl der ganzen Schulwochen (ohne Partial-Wochen)
 */
function calculateFullWeeksBetween(startISO, endISO, holidays) {
  let schoolWeeks = 0;

  let year = startISO.isoYear;
  let week = startISO.isoWeek + 1;

  while (
    year < endISO.isoYear ||
    (year === endISO.isoYear && week < endISO.isoWeek)
  ) {
    // Get the start date of this ISO week
    const weekStartDate = getDateFromISOWeek(year, week);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Check if this week has at least one school day
    if (hasSchoolDay(weekStartDate, weekEndDate, holidays)) {
      schoolWeeks++;
    }

    week++;

    const weeksInYear = getISOWeeksInYear(year);
    if (week > weeksInYear) {
      week = 1;
      year++;
    }
  }

  return schoolWeeks;
}

/**
 * Berechnet das Startdatum einer ISO-Woche
 * @param {number} year - ISO-Jahr
 * @param {number} week - ISO-Wochennummer
 * @returns {Date} - Startdatum (Montag) der Woche
 */
function getDateFromISOWeek(year, week) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}

/**
 * Prüft, ob eine Woche mindestens einen Schultag enthält
 * @param {Date} start - Startdatum der Woche (Montag)
 * @param {Date} end - Enddatum der Woche (Sonntag)
 * @param {Set<string>} holidays - Set von Feiertagen
 * @returns {boolean} - true, wenn die Woche mindestens einen Schultag hat
 */
function hasSchoolDay(start, end, holidays) {
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    const isWeekday = day >= 1 && day <= 5;
    const dateStr = getReadableDateString(current);
    const isHoliday = holidays.has(dateStr);

    if (isWeekday && !isHoliday) {
      return true;
    }

    current.setDate(current.getDate() + 1);
  }

  return false;
}

/**
 * Gibt die Anzahl der ISO-Wochen in einem Jahr zurück
 * @param {number} year - Das Jahr
 * @returns {number} - Anzahl der ISO-Wochen (52 oder 53)
 */
function getISOWeeksInYear(year) {
  // Check the last day of the year to determine the week count
  const d = new Date(year, 11, 31);
  const week = getISOWeekData(d).isoWeek;
  return week === 1 ? 52 : week;
}
