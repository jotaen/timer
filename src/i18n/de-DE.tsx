import React from "react"
import en, { ParseErrorDictionary } from "./en-GB.tsx"

export default {
  name: "Deutsch",
  back: "Zurück",
  settings: "Einstellungen",
  fullscreen: "Vollbild",
  exitFullscreen: "Vollbild beenden",
  fullscreenError: "Fehler: Vollbild wird von deinem Endgerät blockiert",
  newTimerProgram: "Neues Timer-Programm",
  tryDemoTimer: "Demo-Timer ausprobieren",
  confirmClearProgram: "Dein aktuelles Programm wird gelöscht. Fortfahren?",
  createdBy: "Erstellt von",
  starOn: "Gib uns einen Stern auf",

  beepCountdownTitle: "„Piep“-Countdown",
  beepHint:
    "Zählt die letzten 3 Sekunden einer Aktivität mit einem „Piep“-Ton " +
    "herunter. (Hinweis: Damit dies funktioniert darf der Klingelton deines Geräts " +
    "nicht stummgeschaltet sein.)",
  volume: "Lautstärke:",
  callOutTitlesTitle: "Titel ansagen",
  callOutTitlesHint: "Liest den Titel vor, wenn eine Aktivität beginnt.",
  voiceLanguage: "Stimme/Sprache:",
  appLanguageTitle: "App-Sprache",
  appLanguageHint:
    "Wenn du die Sprache änderst, solltest du auch die Stimme anpassen (siehe unten bei „Titel ansagen“).",

  appTitle: "Programmierbarer Timer",
  paused: "(Pausiert)",

  edit: "Bearbeiten",
  share: "Teilen",
  menu: "Menü",
  start: "Start",
  pause: "Pause",
  resume: "Fortsetzen",
  reset: "Zurücksetzen",
  confirmReset: "Bist du sicher?",

  save: "Speichern",
  titlePlaceholder: "Titel",
  programPlaceholder: "Programm",
  readonlyHint: "Timer zurücksetzen, um Änderungen vorzunehmen.",
  syntaxRulesTitle: "Syntaxregeln",
  errorPrefix: "Fehler: ",
  lineNumber: (n: number) => `Zeile ${n}:`,

  copyUrl: "URL in Zwischenablage kopieren",
  urlCopied: "URL kopiert!",
  copyFailed: "Kopieren fehlgeschlagen!",
  shareHint: [
    "Dein Timer-Programm ist in der URL und im QR-Code eincodiert.",
    "Du kannst es mit anderen teilen oder z.B. als Lesezeichen speichern.",
  ],

  unsavedChangesConfirm:
    "Du hast ungespeicherte Änderungen. Möchtest du die Seite wirklich verlassen?",

  parseErrors: {
    TITLE_TOO_LONG: {
      message: "Titel darf nicht länger als 30 Zeichen sein",
    },
    EMPTY_LINE: {
      message: "Unzulässige leere Zeile",
      hint: "Leere Zeilen sind nicht erlaubt.",
    },
    INVALID_INDENTATION: {
      message: "Ungültige Einrückung",
      hint: "Die Einrückung muss ein Vielfaches von 2 Leerzeichen sein.",
    },
    INVALID_DURATION: {
      message: "Ungültige Dauer",
      hint: "Eine Dauer muss im Format MM:SS oder M:SS angegeben werden und größer als null sein.",
    },
    MISSING_SPACE_SEPARATOR: {
      message: "Fehlendes Leerzeichen vor dem Titel der Aktivität",
    },
    EMPTY_LOOP: {
      message: "Unzulässige leere Schleife",
      hint:
        "Eine Schleife muss mindestens eine Aktivität oder eine weitere " +
        "Schleife enthalten.",
    },
    INVALID_REPETITIONS: {
      message: "Ungültige Wiederholungsanzahl",
      hint: "Eine Schleife muss mindestens einmal wiederholt werden.",
    },
    INVALID_ENTRY: {
      message: "Ungültiger Eintrag",
      hint: "Erwartet wurde eine Aktivität oder eine Schleife.",
    },
  } as ParseErrorDictionary,

  demoProgram: {
    title: "Sport!",
    items: [
      {
        kind: "ACTIVITY",
        title: "Bereit machen",
        duration: 10,
        skipLast: false,
      },
      {
        kind: "LOOP",
        repeat: 4,
        items: [
          {
            kind: "ACTIVITY",
            title: "Trainieren",
            duration: 30,
            skipLast: false,
          },
          { kind: "ACTIVITY", title: "Pause", duration: 15, skipLast: true },
        ],
      },
      {
        kind: "LOOP",
        repeat: 3,
        items: [
          {
            kind: "ACTIVITY",
            title: "Dehnen",
            duration: 45,
            skipLast: false,
          },
          {
            kind: "ACTIVITY",
            title: "Lockern",
            duration: 15,
            skipLast: false,
          },
          {
            kind: "ACTIVITY",
            title: "Position wechseln",
            duration: 10,
            skipLast: true,
          },
        ],
      },
      {
        kind: "ACTIVITY",
        title: "Runterkommen",
        duration: 45,
        skipLast: false,
      },
    ],
  },

  SyntaxRules() {
    return (
      <>
        <p>
          Ein Timer-Programm wird zeilenweise verarbeitet, wobei eine Zeile
          entweder eine Aktivität oder der Beginn einer Schleife ist.
        </p>
        <h4>Aktivität</h4>
        <p>
          Eine Aktivität wird durch einen Zeitwert ausgedrückt, optional gefolgt
          von einem Titel (getrennt durch ein Leerzeichen). Der Zeitwert muss im
          Format <code>MM:SS</code> oder <code>M:SS</code> (Minuten, Sekunden)
          angegeben werden. Beispiele:
          <br />
          <code>0:45</code>, <code>10:00</code>, <code>2:30 Training!</code>
        </p>
        <h4>Schleife</h4>
        <p>
          Eine Schleife wird als Wiederholungsanzahl ausgedrückt, z.B.{" "}
          <code>2x</code>, was bedeutet, dass der folgende Block eingerückter
          Zeilen in dieser Anzahl wiederholt wird. Die Einrückung beträgt
          2&nbsp;Leerzeichen. Schleifen können beliebig verschachtelt sein.
        </p>
        <p>
          Wenn dem Zeitwert einer Aktivität ein Sternchen folgt (z.&nbsp;B.{" "}
          <code>0:45*</code>), wird diese Aktivität bei der letzten
          Schleifenwiederholung übersprungen.
        </p>
      </>
    )
  },
} satisfies typeof en
