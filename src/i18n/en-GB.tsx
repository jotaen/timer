import React from "react"
import { ErrorCode } from "../parse.ts"
import { Program } from "../program.ts"

export type ParseErrorDictionary = Record<
  ErrorCode,
  { message: string; hint?: string }
>

export default {
  name: "English",
  back: "Back",
  settings: "Settings",
  fullscreen: "Fullscreen",
  exitFullscreen: "Exit Fullscreen",
  fullscreenError: "Error: not possible",
  newTimerProgram: "New timer program",
  tryDemoTimer: "Try demo timer",
  confirmClearProgram: "Your current program will be cleared. Continue?",
  createdBy: "Created by",
  starOn: "Star on",

  beepCountdownTitle: "“Beep” Countdown",
  beepHint:
    "Count down the last 3 seconds of an activity with a “beep” sound. " +
    "(Note: make sure to unsilence your device ringtone for this to work.)",
  volume: "Volume:",
  callOutTitlesTitle: "Call Out Titles",
  callOutTitlesHint: "Read out the titles when an activity begins.",
  voiceLanguage: "Voice/Language:",
  appLanguageTitle: "App Language",
  appLanguageHint:
    "If you change the language, consider changing the voice as well (see below, “Call Out Titles”).",

  appTitle: "Programmable Timer",
  paused: "(Paused)",

  edit: "Edit",
  share: "Share",
  menu: "Menu",
  start: "Start",
  pause: "Pause",
  resume: "Resume",
  reset: "Reset",
  confirmReset: "Are you sure?",

  save: "Save",
  titlePlaceholder: "Title",
  programPlaceholder: "Program",
  readonlyHint: "Reset timer to make edits.",
  syntaxRulesTitle: "Syntax Rules",
  errorPrefix: "Error: ",
  lineNumber: (n: number) => `Line ${n}:`,

  copyUrl: "Copy URL to Clipboard",
  urlCopied: "URL Copied!",
  copyFailed: "Failed to copy!",
  shareHint: [
    "Your timer program is encoded in the URL and QR code.",
    "You can share it with others or save it as bookmark.",
  ],

  unsavedChangesConfirm:
    "You have unsaved changes. Are you sure you want to leave?",

  parseErrors: {
    TITLE_TOO_LONG: {
      message: "Title cannot be longer than 30 characters",
    },
    EMPTY_LINE: {
      message: "Illegal empty line",
      hint: "Blank or empty lines are not allowed.",
    },
    INVALID_INDENTATION: {
      message: "Invalid indentation",
      hint: "Indentation must be a multiple of 2 spaces.",
    },
    INVALID_DURATION: {
      message: "Invalid duration",
      hint: "A duration must be in the format MM:SS or M:SS, and greater than zero.",
    },
    MISSING_SPACE_SEPARATOR: {
      message: "Missing space separator before activity title",
    },
    EMPTY_LOOP: {
      message: "Illegal empty loop",
      hint: "Loop must contain at least one activity or another loop.",
    },
    INVALID_REPETITIONS: {
      message: "Invalid repetition count",
      hint: "A loop must repeat at least once.",
    },
    INVALID_ENTRY: {
      message: "Invalid entry",
      hint: "Expected an activity or a loop.",
    },
  } as ParseErrorDictionary,

  demoProgram: {
    title: "Sports!",
    items: [
      { kind: "ACTIVITY", title: "Get ready", duration: 10, skipLast: false },
      {
        kind: "LOOP",
        repeat: 3,
        items: [
          {
            kind: "ACTIVITY",
            title: "Work out",
            duration: 30,
            skipLast: false,
          },
          { kind: "ACTIVITY", title: "Rest", duration: 15, skipLast: true },
        ],
      },
      {
        kind: "LOOP",
        repeat: 4,
        items: [
          {
            kind: "ACTIVITY",
            title: "Stretch",
            duration: 45,
            skipLast: false,
          },
          {
            kind: "ACTIVITY",
            title: "Relax",
            duration: 15,
            skipLast: false,
          },
          {
            kind: "ACTIVITY",
            title: "Change position",
            duration: 10,
            skipLast: true,
          },
        ],
      },
      { kind: "ACTIVITY", title: "Cool down", duration: 20, skipLast: false },
    ],
  } as Program,

  SyntaxRules() {
    return (
      <>
        <p>
          A timer program is processed line by line, where each line denotes
          either an activity or a loop.
        </p>
        <h4>Activity</h4>
        <p>
          An activity is expressed by a time value, optionally followed by a
          title (separated by one space character). The time value must be
          formatted <code>MM:SS</code> or <code>M:SS</code> (minutes, seconds).
          Examples:
          <br />
          <code>0:45</code>, <code>10:00</code>, <code>2:30 Work Out!</code>
        </p>
        <h4>Loop</h4>
        <p>
          A loop is expressed as repetition count, e.g. <code>2x</code>,
          denoting that the following block of indented lines shall be repeated
          that many times. Indentation is 2&nbsp;space characters. Loops can be
          nested.
        </p>
        <p>
          If the time value of an activity is followed by an asterisk (e.g.,{" "}
          <code>0:45*</code>), the activity is skipped on the last loop
          iteration.
        </p>
      </>
    )
  },
}
