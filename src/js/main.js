// Centralized timer durations (seconds) for each mode.
export const DURATIONS = {
  focus: 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

// ===== Core timer helpers =====
export function createPomodoroState() {
  return {
    mode: 'focus',
    remainingSeconds: DURATIONS.focus,
    completedPomodoros: 0,
    isRunning: false,
    tasks: [],
  };
}

export function getDurationForMode(mode) {
  return DURATIONS[mode] || DURATIONS.focus;
}

export function switchMode(state, mode) {
  const nextDuration = getDurationForMode(mode);
  return {
    ...state,
    mode,
    remainingSeconds: nextDuration,
    isRunning: false,
  };
}

export function tickTimer(state) {
  if (state.remainingSeconds > 1) {
    return {
      nextState: { ...state, remainingSeconds: state.remainingSeconds - 1 },
      completedCycle: false,
    };
  }

  let completedPomodoros = state.completedPomodoros;
  let nextMode;

  if (state.mode === 'focus') {
    completedPomodoros += 1;
    nextMode = completedPomodoros % 4 === 0 ? 'long-break' : 'short-break';
  } else {
    nextMode = 'focus';
  }

  const nextDuration = getDurationForMode(nextMode);

  return {
    nextState: {
      ...state,
      mode: nextMode,
      remainingSeconds: nextDuration,
      completedPomodoros,
      isRunning: false,
    },
    completedCycle: true,
  };
}

export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// ===== UI helpers =====
export function updateModeButtons(modeButtons, activeMode) {
  for (const button of modeButtons) {
    if (button.dataset.mode === activeMode) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  }
}

/**
 * Initializes the Pomodoro application by setting up the UI, state, and event listeners.
 * This function orchestrates the entire application, from DOM element selection to
 * timer management and task handling. It is designed to be self-contained and
 * can be safely run in both browser and server-side environments for testing.
 *
 * @param {Document} [doc=globalThis.document] - The document object to interact with,
 * allowing for dependency injection in non-browser environments.
 */
export function initializePomodoroApp(
  doc = globalThis.document === undefined ? null : globalThis.document
) {
  // Abort initialization if the document or its core methods are unavailable.
  if (!doc?.getElementById) {
    return;
  }

  // --- DOM Element Selection ---
  // Retrieve all necessary DOM elements for the application to function.
  // If any critical element is missing, the function will exit early.
  const timerDisplay = doc.getElementById('timer-display');
  const modeButtons = doc.querySelectorAll('[data-mode]');
  const startButton = doc.getElementById('start-btn');
  const pauseButton = doc.getElementById('pause-btn');
  const resetButton = doc.getElementById('reset-btn');
  const iterationCount = doc.getElementById('iteration-count');

  // Ensure all critical UI components are present before proceeding.
  if (!timerDisplay || !startButton || !pauseButton || !resetButton) {
    console.error('A critical UI element is missing from the DOM.');
    return;
  }

  // --- State and Interval Management ---
  let state = createPomodoroState();
  let intervalId = null;

  /**
   * Stops the main timer interval, preventing further ticks.
   * This function clears the active interval and updates the state to reflect
   * that the timer is no longer running.
   */
  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    state = { ...state, isRunning: false };
  }

  // ========= START Live Coding: Render Pipeline =========
  /**
   * Main render pipeline.
   * This function synchronizes the entire UI with the current application state.
   * It updates the timer display, pomodoro completion count, and task list.
   * It also ensures that UI elements like mode buttons reflect the current state.
   */
  function render() {
    timerDisplay.textContent = formatTime(state.remainingSeconds);
    if (iterationCount) {
      iterationCount.textContent = `${state.completedPomodoros}`;
    }
    // Update the visual state of mode selection buttons.
    updateModeButtons(modeButtons, state.mode);
    updateControls();
  }
  // ========= END Live Coding =========

  // ========= START Live Coding: Timer Controls (Start/Pause/Reset) =========
  /**
   * Keeps control buttons in sync with running/paused state for quick visual feedback.
   */
  function updateControls() {
    startButton.disabled = state.isRunning;
    pauseButton.disabled = !state.isRunning;
  }

  /**
   * Starts the timer loop.
   * If the timer is not already running, it sets up a `setInterval` to tick
   * every second. On each tick, it updates the state and re-renders the UI.
   * If a pomodoro cycle completes, it automatically stops the timer.
   */
  function startTimer() {
    if (intervalId) {
      return; // Prevent multiple intervals from running simultaneously.
    }
    state = { ...state, isRunning: true };
    render(); // Immediate UI feedback.
    intervalId = setInterval(() => {
      const { nextState, completedCycle } = tickTimer(state);
      state = nextState;
      render(); // Update UI every second.

      // Stop the timer if the session (e.g., focus, break) has ended.
      if (completedCycle) {
        stopTimer();
        render(); // Refresh controls after stopping.
      }
    }, 1000);
  }

  /**
   * Pauses the timer by stopping the interval.
   */
  function pauseTimer() {
    stopTimer();
    render(); // Ensure UI reflects the paused state.
  }

  /**
   * Resets the timer to the initial state for the 'focus' mode.
   * It stops any active timer and restores the default duration.
   */
  function resetTimer() {
    stopTimer();
    state = switchMode(
      { ...state, remainingSeconds: getDurationForMode('focus') },
      'focus'
    );
    render();
  }

  // --- Event Listener Attachments ---

  // Attach core timer controls.
  startButton.addEventListener('click', startTimer);
  pauseButton.addEventListener('click', pauseTimer);
  resetButton.addEventListener('click', resetTimer);
  // ========= END Live Coding =========

  // ========= START Live Coding: Mode Switching Events =========
  // Attach listeners for mode-switching buttons (Focus, Short Break, Long Break).
  for (const button of modeButtons) {
    button.addEventListener('click', () => {
      stopTimer();
      const newMode = button.dataset.mode;
      state = switchMode(state, newMode);
      render();
    });
  }
  // ========= END Live Coding =========

  // --- Initial Render ---
  // Perform an initial render to display the default state when the app loads.
  render();
}

/**
 * Expose the application initialization function to the global scope for browser environments.
 * This allows the application to be started from an inline script tag or developer console.
 * The application is automatically initialized once the DOM is fully loaded.
 */
if (globalThis.window !== undefined) {
  globalThis.PomodoroApp = {
    initializePomodoroApp,
  };
  if (document.readyState === 'loading') {
    globalThis.addEventListener('DOMContentLoaded', () => initializePomodoroApp());
  } else {
    // If the script loads after DOMContentLoaded, initialize immediately.
    initializePomodoroApp();
  }
}
