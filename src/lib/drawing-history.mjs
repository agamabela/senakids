export function commitDrawing(state, action) {
  return { actions: [...state.actions, action], future: [] };
}
export function undoDrawing(state) {
  if (!state.actions.length) return state;
  return { actions: state.actions.slice(0, -1), future: [state.actions.at(-1), ...state.future] };
}
export function redoDrawing(state) {
  if (!state.future.length) return state;
  return { actions: [...state.actions, state.future[0]], future: state.future.slice(1) };
}
