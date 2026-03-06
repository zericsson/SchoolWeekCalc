# CalcSchoolWeeks
*von Eric Zasadzki*


## Berechnung A - WeeksOutOfDays
Input:      startDate, endDate, federal_state
Output:     
Anzahl der Wochen - float 
(
    anzahlTage_ohne_FerienOderFeiertage / 5
)
---

## Berechnung B - WeeksOutOfISOWeeks
Input:      startDate, endDate, federal_state
Output:     
Anzahl der Wochen - float 
(
    if (wochentagBeiBegin != samstag || wochentagBeiBegin != sonntag) wochentagBeiBegin = 0;
    if (wochentagBeiSchluss != samstag || wochentagBeiSchluss != sonntag) wochentagBeiSchluss = 0; 
    wochentagBeiBegin * 0.2 + anzahlKalenderWochen - 2 + wochentageBeiSchluss * 0.2

    0 -> 0
    1 -> 5
    2 -> 4
    3 -> 3
    4 -> 2
    5 -> 1
    6 -> 0

    6 - (tage)
)
---