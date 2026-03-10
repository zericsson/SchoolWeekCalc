/**
 * Berechnet die Anzahl der Schultage zwischen zwei Daten
 * @param {string} startDateStr - Startdatum im Format YYYY-MM-DD
 * @param {string} endDateStr - Enddatum im Format YYYY-MM-DD
 * @param {Set<string>} holidays - Set von Feiertagen
 * @returns {number} - Anzahl der Schultage
 */
function getSchoolDays(startDateStr, endDateStr, holidays) {
  // Parse dates manually to avoid timezone issues
  const [startYear, startMonth, startDay] = startDateStr.split('-');
  const [endYear, endMonth, endDay] = endDateStr.split('-');
  
  const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
  const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));

  let schoolDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // getDay(): 0 = Sonntag, 6 = Samstag

    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const dateStr = getReadableDateString(currentDate);
    const isHoliday = holidays.has(dateStr);

    if (isWeekday && !isHoliday) {
      schoolDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schoolDays;
}