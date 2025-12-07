# GDG PUP Pomodoro Timer

A small Pomodoro timer built for the GDG PUP JavaScript study jam. It demonstrates DOM manipulation, state management, and modular JS in a single, easy-to-read `main.js`.

## What it does

- Focus/Short Break/Long Break modes with preset durations (25/5/15 minutes).
- Start, Pause, and Reset controls with live countdown.
- Automatic mode switching after each session; tracks completed focus sessions.
- Mode buttons highlight the active mode.

## Quick start

1) Clone or download this repo.
2) Open `src/pomodoro.html` in your browser (or with VS Code Live Server).
3) Click **Start** to begin; **Pause**/**Reset** and mode buttons respond immediately.

## Project layout

- `src/pomodoro.html` — the page markup.
- `src/styles/pomodoro.css` — styling for the timer UI.
- `src/js/main.js` — all timer logic, state, and UI wiring (single file).
- `src/__tests__/pomodoro.test.js` — logic tests for timer/task utilities.

## Development notes

- Adjust durations in `DURATIONS` inside `src/js/main.js`.
- The timer state and helpers are exported from `src/js/main.js` for reuse.
- Tests are written for Jest-style runners; point your test runner at `src/__tests__/pomodoro.test.js` if you have Jest set up.

Happy coding!
