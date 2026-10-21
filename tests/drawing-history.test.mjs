import test from 'node:test';
import assert from 'node:assert/strict';
import { commitDrawing, undoDrawing, redoDrawing } from '../src/lib/drawing-history.mjs';

test('undo restores a cleared picture and redo reapplies the clear', () => {
  const line = { tool: 'brush', points: [{ x: 1, y: 2 }] };
  let state = commitDrawing({ actions: [], future: [] }, line);
  state = commitDrawing(state, { tool: 'clear' });
  state = undoDrawing(state);
  assert.deepEqual(state.actions, [line]);
  assert.equal(redoDrawing(state).actions.at(-1).tool, 'clear');
});
test('a new stroke after undo discards the old redo branch', () => {
  let state = commitDrawing({ actions: [], future: [] }, { tool: 'star' });
  state = undoDrawing(state);
  state = commitDrawing(state, { tool: 'circle' });
  assert.deepEqual(redoDrawing(state).actions, [{ tool: 'circle' }]);
});
