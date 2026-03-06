import { fetchHolidays } from "./api/holidaysApi.js";
import { getReadableDateString } from "./dateExtension.js";

export const HolidayType = {
    ONLY_SCHOOL_VACATION: "school_vacation",
    ONLY_PUBLIC_HOLIDAY: "public_holiday",
    SCHOOL_VACATION_AND_PUBLIC_HOLIDAY: "schoolVacationAndPublicHoliday"
}

/**
 * Gibt eine Set von Ferien- und/oder Feiertagen zurück
 * @param {string} holidayDataType - Der Typ der zu filternden Feiertage
 * @param {string} federalState - Das Bundesland
 * @param {string} startDateStr - Startdatum im Format YYYY-MM-DD
 * @param {string} endDateStr - Enddatum im Format YYYY-MM-DD
 * @returns {Promise<Set<string>>} - Set von Feiertagen im Format YYYY-MM-DD
 */
export async function getHolidayDayList(holidayDataType, federalState, startDateStr, endDateStr) {
    const holidaysApiResult = await fetchHolidays(federalState, startDateStr, endDateStr);

    const holidays = new Set();

    for (let i = 0; i < holidaysApiResult.data.length; i++) {
        // Filter nach Feiertag-Typ
        if (holidayDataType !== HolidayType.SCHOOL_VACATION_AND_PUBLIC_HOLIDAY) {
            if (holidaysApiResult.data[i].type !== holidayDataType) {
                continue;
            }
        }
        
        // Parse dates properly to avoid timezone issues
        const [startYear, startMonth, startDay] = holidaysApiResult.data[i].starts_on.split('-');
        const [endYear, endMonth, endDay] = holidaysApiResult.data[i].ends_on.split('-');
        
        const currentDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
        const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));

        // Iteriere durch alle Tage in diesem Feiertag
        while (currentDate <= endDate) {
            // Add all days (weekdays and weekends) for holidays
            holidays.add(getReadableDateString(currentDate));

            // einen Tag weitergehen
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    return holidays;
}