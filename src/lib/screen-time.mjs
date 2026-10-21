export function addScreenTime(previous, day, elapsed, visible) {
  const current = previous?.day === day ? previous : { day, seconds: 0, notified: false };
  return { day, seconds: Math.max(0, Number(current.seconds) || 0) + (visible ? Math.max(0, elapsed) : 0), notified: !!current.notified };
}
export function isBreakDue(usage, minutes) {
  return minutes > 0 && !usage.notified && usage.seconds >= minutes * 60;
}
