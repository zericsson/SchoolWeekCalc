import { getHolidayDayList, HolidayType } from "../../src/holidayData.js";
import { getNumberOfISOWeeks } from "../../src/schoolWeekCalculator.js";
import { getReadableDateString } from "../../src/dateExtension.js";

// App version
const APP_VERSION = "1.0.2";

// Wir warten, bis das HTML vollständig geladen ist
document.addEventListener("DOMContentLoaded", () => {
  // Initialize help modal
  initializeHelpModal();

  const form = document.getElementById("schoolWeeksForm");
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const federalStateSelect = document.getElementById("federalState"); //Bundesland
  const resultContainer = document.getElementById("result-container");
  const submissionInfoContainer = document.getElementById("submission-info-container");
  const schoolDaysCell = document.getElementById("school-days");
  const calendarWeeksCell = document.getElementById("calendar-weeks");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // verhindert Seiten-Reload

    try {
        const holidays = await getHolidayDayList(HolidayType.SCHOOL_VACATION_AND_PUBLIC_HOLIDAY, federalStateSelect.value, startDateInput.value, endDateInput.value);
        
        // Calculate school days
        const schoolDays = calculateSchoolDays(startDateInput.value, endDateInput.value, holidays);
        
        // Calculate school weeks
        const schoolWeeks = getNumberOfISOWeeks(startDateInput.value, endDateInput.value, holidays);

        // Update table
        schoolDaysCell.textContent = schoolDays;
        calendarWeeksCell.textContent = schoolWeeks;
        resultContainer.style.display = "block";

        // Display submission info
        displaySubmissionInfo(startDateInput.value, endDateInput.value, federalStateSelect);
        submissionInfoContainer.style.display = "block";

        // Render calendar
        renderCalendarRange(startDateInput.value, endDateInput.value, holidays);
    
    } catch (error) {
        // Hide results and submission info on error
        resultContainer.style.display = "none";
        submissionInfoContainer.style.display = "none";
        document.getElementById("calendar-container").innerHTML = "";
        alert("Fehler: " + error.message);
    }
  });
  
});

/**
 * Berechnet die Anzahl der Schultage zwischen zwei Daten
 * @param {string} startDateStr - Startdatum im Format YYYY-MM-DD
 * @param {string} endDateStr - Enddatum im Format YYYY-MM-DD
 * @param {Set<string>} holidays - Set von Feiertagen
 * @returns {number} - Anzahl der Schultage
 */
function calculateSchoolDays(startDateStr, endDateStr, holidays) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

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

/**
 * Displays the submission information (start date, end date, federal state, and timestamp)
 * @param {string} startDateStr - Startdatum im Format YYYY-MM-DD
 * @param {string} endDateStr - Enddatum im Format YYYY-MM-DD
 * @param {HTMLSelectElement} federalStateSelect - The federal state select element
 */
function displaySubmissionInfo(startDateStr, endDateStr, federalStateSelect) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  
  // Format dates in German locale
  const startDateFormatted = startDate.toLocaleDateString('de-DE');
  const endDateFormatted = endDate.toLocaleDateString('de-DE');
  
  // Get the selected federal state text
  const federalStateName = federalStateSelect.options[federalStateSelect.selectedIndex].text;
  
  // Get current time
  const now = new Date();
  const timeFormatted = now.toLocaleString('de-DE');
  
  // Update the info elements
  document.getElementById("info-startDate").textContent = startDateFormatted;
  document.getElementById("info-endDate").textContent = endDateFormatted;
  document.getElementById("info-federalState").textContent = federalStateName;
  document.getElementById("info-timestamp").textContent = timeFormatted;
}

function renderCalendarRange(startStr, endStr, holidays) {
  const container = document.getElementById("calendar-container");
  container.innerHTML = "";

  const startDate = new Date(startStr);
  const endDate = new Date(endStr);

  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (current <= endDate) {
    renderMonth(
      current.getFullYear(),
      current.getMonth(),
      startDate,
      endDate,
      container,
      holidays
    );

    current.setMonth(current.getMonth() + 1);
  }
}

function renderMonth(year, month, startDate, endDate, container, holidays) {
  const monthDiv = document.createElement("div");
  monthDiv.classList.add("month");

  const title = document.createElement("div");
  title.classList.add("month-title");
  title.textContent = new Date(year, month).toLocaleString("de-DE", {
    month: "long",
    year: "numeric",
  });

  // Create weekday headers
  const weekdayHeaders = document.createElement("div");
  weekdayHeaders.classList.add("weekday-headers");
  const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  weekdays.forEach(day => {
    const header = document.createElement("div");
    header.classList.add("weekday-header");
    header.textContent = day;
    weekdayHeaders.appendChild(header);
  });

  const grid = document.createElement("div");
  grid.classList.add("calendar-grid");

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // JS: Sonntag=0 → wir wollen Montag=0
  let startWeekday = (firstDay.getDay() + 6) % 7;

  // Leere Felder vor Monatsbeginn
  for (let i = 0; i < startWeekday; i++) {
    const empty = document.createElement("div");
    empty.classList.add("day", "outside-range");
    grid.appendChild(empty);
  }

  // Tage des Monats
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);

    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.textContent = day;

    // Check if it's a weekend (Saturday = 6, Sunday = 0 in JS)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Normalize dates for comparison (remove time component)
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    if (normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd) {
      dayDiv.classList.add("inside-range");
      
      // Build tooltip with date and day type(s)
      const tooltipParts = [];
      const dateStr = getReadableDateString(date);
      
      // Add formatted date
      const formattedDate = date.toLocaleDateString("de-DE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      tooltipParts.push(formattedDate);
      
      // Check day types
      const dayTypes = [];
      
      if (isWeekend) {
        dayTypes.push("Wochenendtag");
      }
      
      if (holidays.has(dateStr)) {
        dayTypes.push("Schulfrei");
        dayDiv.classList.add("holiday");
      } else if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dayTypes.push("Schultag");
      }
      
      // Add day types to tooltip
      if (dayTypes.length > 0) {
        tooltipParts.push(dayTypes.join(", "));
      }
      
      // Set tooltip using title attribute
      dayDiv.title = tooltipParts.join("\n");
      
      // Add weekend class only if it's not a holiday
      if (holidays.has(dateStr)) {
        // Holiday class already added
      } else if (isWeekend) {
        dayDiv.classList.add("weekend");
      }
    } else {
      dayDiv.classList.add("outside-range");
    }

    grid.appendChild(dayDiv);
  }

  monthDiv.appendChild(title);
  monthDiv.appendChild(weekdayHeaders);
  monthDiv.appendChild(grid);
  container.appendChild(monthDiv);
}

/**
 * Initializes the help modal functionality
 */
function initializeHelpModal() {
  const helpBtn = document.getElementById("helpBtn");
  const helpModal = document.getElementById("helpModal");
  const closeBtn = document.querySelector(".close-btn");
  const appVersionElement = document.getElementById("app-version");

  // Set app version in modal
  appVersionElement.textContent = APP_VERSION;

  // Open modal when help button is clicked
  helpBtn.addEventListener("click", () => {
    helpModal.style.display = "block";
  });

  // Close modal when close button is clicked
  closeBtn.addEventListener("click", () => {
    helpModal.style.display = "none";
  });

  // Close modal when clicking outside of modal content
  window.addEventListener("click", (event) => {
    if (event.target === helpModal) {
      helpModal.style.display = "none";
    }
  });

  // Close modal when pressing Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && helpModal.style.display === "block") {
      helpModal.style.display = "none";
    }
  });
}
