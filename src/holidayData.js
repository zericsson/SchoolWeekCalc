import { fetchHolidays } from "./api/holidaysApi.js";
import { getReadableDateString } from "./dateExtension.js";

export const HolidayType = {
    ONLY_SCHOOL_VACATION: "school_vacation",
    ONLY_PUBLIC_HOLIDAY: "public_holiday",
    SCHOOL_VACATION_AND_PUBLIC_HOLIDAY: "schoolVacationAndPublicHoliday"
}

/**
 * Gibt eine Map von Ferien- und/oder Feiertagen zurück
 * @param {string} holidayDataType - Der Typ der zu filternden Feiertage
 * @param {string} federalState - Das Bundesland
 * @param {string} startDateStr - Startdatum im Format YYYY-MM-DD
 * @param {string} endDateStr - Enddatum im Format YYYY-MM-DD
 * @returns {Promise<Map<string, {date: string, type: string}>>}
 */
export async function getHolidayDayList(holidayDataType, federalState, startDateStr, endDateStr) {
    const holidaysApiResult = await fetchHolidays(federalState, startDateStr, endDateStr);
    const holidays = new Map();

    for (const entry of holidaysApiResult.data) {
        if (holidayDataType !== HolidayType.SCHOOL_VACATION_AND_PUBLIC_HOLIDAY && entry.type !== holidayDataType) {
            continue;
        }

        const [startYear, startMonth, startDay] = entry.starts_on.split('-').map(Number);
        const [endYear,   endMonth,   endDay  ] = entry.ends_on.split('-').map(Number);

        const currentDate = new Date(startYear, startMonth - 1, startDay);
        const endDate     = new Date(endYear,   endMonth   - 1, endDay);

        while (currentDate <= endDate) {
            const dateStr = getReadableDateString(currentDate);
            const existing = holidays.get(dateStr);

            const shouldOverwrite = !existing || (entry.type === HolidayType.ONLY_SCHOOL_VACATION && existing.type === HolidayType.ONLY_PUBLIC_HOLIDAY);

            if (shouldOverwrite) {
                holidays.set(dateStr, { date: dateStr, type: entry.type });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

  return holidays;
}