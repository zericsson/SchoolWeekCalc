# SchoolWeekCalc

Ein webbasierter Rechner zur Berechnung von Schultagen und Schulwochen zwischen zwei Daten, unter Berücksichtigung von Feiertagen und Schulferien der deutschen Bundesländer.

**Autor:** Eric Zasadzki

## Features

- **Flexible Datumsauswahl:** Berechne Schultage und Schulwochen für beliebige Zeiträume
- **Bundesland-spezifisch:** Berücksichtigung aller offiziellen Feiertage und Schulferien für jedes deutsche Bundesland
- **Zwei Berechnungsmethoden:**
  - **Methode A (Arbeitstage):** Basierend auf tatsächlichen Schultagen
  - **Methode B (Kalenderwochen):** Basierend auf ISO-8601 Kalenderwochen
- **Persistent:** Automatisches Speichern von Einstellungen im lokalen Speicher
- **Benutzerfreundliche Oberfläche:** Responsive Design mit Hilfesystem
- **API-Integration:** Dynamisches Laden von Feiertagen über externe API

## Technologie

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Architecture:** Modular mit separaten Utility-Funktionen
- **Datenspeicherung:** LocalStorage für Benutzerpräferenzen
- **API:** [mehr-schulferien.de API](https://github.com/mehr-schulferien-de/www.mehr-schulferien.de) für aktuelle Feiertags- und Schulferiendata

## Projektstruktur

```
CalcSchoolWeeks/
├── index.html                 # Hauptseite mit UI
├── README.md                  # Diese Datei
├── public/
│   ├── css/
│   │   └── styles.css        # Styling und responsive Design
│   └── js/
│       └── app.js            # Hauptanwendungslogik
└── src/
    ├── dateExtension.js      # Date-Prototyp-Erweiterungen
    ├── holidayData.js        # Statische Feiertagsdaten
    ├── schoolWeekCalculator.js   # Berechnungslogik Schulwochen
    ├── schoolDayCalculator.js    # Berechnungslogik Schultage
    └── api/
        └── holidaysApi.js    # API-Kommunikation für Feiertage
```

## Installation & Verwendung

### Lokal ausführen

1. **Repository klonen:**
   ```bash
   git clone https://github.com/zericsson/SchoolWeekCalc.git
   cd SchoolWeekCalc
   ```

2. **Im Browser öffnen:**
   - Öffnen Sie `index.html` direkt in einem modernen Webbrowser oder
   - Verwenden Sie einen lokalen Server:
   ```bash
   python3 -m http.server 8000
   # oder mit Node.js
   npx serve
   ```

3. **Anwendung nutzen:**
   - Wählen Sie Start- und Enddatum
   - Wählen Sie das gewünschte Bundesland
   - Ergebnisse werden sofort angezeigt

## Berechnungsmethoden Schulwochen

### Auf Basis von 'Kalenderwochen': ISO-8601 Kalenderwochen
Basierend auf ISO-Kalenderwochen mit gewichteter Berechnung für Randwochen. Volle Wochen zählen nur, wenn sie mindestens einen Schultag enthalten (Feiertage und Schulferien berücksichtigt).

**Formel:**
```
Schulwochen = (Anteil_Startwoche) + (Volle_Schulwochen) + (Anteil_Endwoche)
```

Wobei:
- **Anteil_Startwoche** (je nach Wochentag des Startdatums):
  - Montag = 1.0, Dienstag = 0.8, Mittwoch = 0.6, Donnerstag = 0.4, Freitag = 0.2
  - Samstag, Sonntag = 0
- **Volle_Schulwochen**: ISO-Wochen zwischen Start und End, die mindestens einen Schultag enthalten
- **Anteil_Endwoche** (je nach Wochentag des Enddatums):
  - Montag = 0.2, Dienstag = 0.4, Mittwoch = 0.6, Donnerstag = 0.8, Freitag = 1.0
  - Samstag, Sonntag = 0

### Auf Basis von 'Schultagen': Idealwochenberechnung
Zählt die tatsächlichen Schultage (Montag-Freitag) ohne Feiertage und Schulferien und teilt durch 5.

**Formel:**
```
Schulwochen = Anzahl_Schultage / 5
```

## Features der Benutzeroberfläche

- **Hilfe-Modal:** Integrierte Anleitung zur Verwendung
- **Fehlerbehandlung:** Validierung von Eingaben mit aussagekräftigen Fehlermeldungen
- **Responsive Design:** Optimiert für Desktop und Mobile
- **LocalStorage Integration:** Automatisches Speichern der letzten Eingaben

## Browser-Kompatibilität

- Chrome/Chromium (empfohlen)
- Firefox
- Safari
- Edge
- Moderne Mobile Browser

## Datenschutz

Diese Anwendung:
- Speichert keine Daten auf externen Servern (außer API-Abfragen für Feiertage)
- Verwendet nur LocalStorage im Browser des Benutzers
- Benötigt keine Anmeldung oder persönliche Daten

## Lizenz

Dieses Projekt ist Open Source. Weitere Details siehe LICENSE-Datei.

## Kontakt & Support

Für Fragen oder Bug-Reports erstellen Sie bitte ein Issue im [GitHub-Repository](https://github.com/zericsson/SchoolWeekCalc/issues).

---

**Zuletzt aktualisiert:** März 2026