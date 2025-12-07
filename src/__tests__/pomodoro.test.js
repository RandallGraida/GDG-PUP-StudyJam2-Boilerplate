import {
  createPomodoroState,
  tickTimer,
  switchMode,
  addTask,
  editTask,
  MAX_TASKS,
} from '../js/main.js';

describe('Pomodoro timer core logic', () => {
  it('formats and decrements timer correctly with focus default', () => {
    const state = createPomodoroState();
    expect(state.remainingSeconds).toBe(25 * 60);

    const { nextState, completedCycle } = tickTimer(state);
    expect(completedCycle).toBe(false);
    expect(nextState.remainingSeconds).toBe(25 * 60 - 1);
  });

  it('completes a focus session and switches to short break while counting iterations', () => {
    const state = {
      ...createPomodoroState(),
      remainingSeconds: 1,
      completedPomodoros: 3,
    };

    const { nextState, completedCycle } = tickTimer(state);
    expect(completedCycle).toBe(true);
    expect(nextState.mode).toBe('long-break');
    expect(nextState.remainingSeconds).toBe(15 * 60);
    expect(nextState.completedPomodoros).toBe(4);
  });

  it('switches modes explicitly and resets timer durations', () => {
    const state = createPomodoroState();
    const shortBreak = switchMode(state, 'short-break');
    expect(shortBreak.mode).toBe('short-break');
    expect(shortBreak.remainingSeconds).toBe(5 * 60);

    const longBreak = switchMode(shortBreak, 'long-break');
    expect(longBreak.remainingSeconds).toBe(15 * 60);
  });
});

describe('Task management', () => {
  it('adds tasks with notes until the limit is reached', () => {
    let state = createPomodoroState();
    for (let i = 0; i < MAX_TASKS; i += 1) {
      state = addTask(state, { title: `Task ${i + 1}`, notes: 'note' });
    }
    expect(state.tasks).toHaveLength(MAX_TASKS);
    expect(() =>
      addTask(state, { title: 'Task 11', notes: 'extra' })
    ).toThrow('Task limit reached');
  });

  it('edits tasks and preserves notes field', () => {
    let state = createPomodoroState();
    state = addTask(state, { title: 'Write', notes: 'demo' });
    const taskId = state.tasks[0].id;

    state = editTask(state, taskId, { title: 'Write tests', notes: 'Jest' });

    expect(state.tasks[0].title).toBe('Write tests');
    expect(state.tasks[0].notes).toBe('Jest');
  });

  it('throws when editing a missing task id', () => {
    const state = createPomodoroState();
    expect(() =>
      editTask(state, 'missing-id', { title: 'Nope', notes: 'None' })
    ).toThrow('Task not found');
  });
});
