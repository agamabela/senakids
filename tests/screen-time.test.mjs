import test from 'node:test';
import assert from 'node:assert/strict';
import { addScreenTime, isBreakDue } from '../src/lib/screen-time.mjs';
test('counts visible elapsed time and resets at the local day boundary', () => {
  assert.deepEqual(addScreenTime({day:'2026-10-22',seconds:10},'2026-10-22',5,true),{day:'2026-10-22',seconds:15,notified:false});
  assert.equal(addScreenTime({day:'2026-10-22',seconds:10},'2026-10-22',5,false).seconds,10);
  assert.equal(addScreenTime({day:'2026-10-21',seconds:1000},'2026-10-22',5,true).seconds,5);
});
test('reminds once at the selected limit, never when disabled', () => {
  assert.equal(isBreakDue({seconds:899},15),false);
  assert.equal(isBreakDue({seconds:900},15),true);
  assert.equal(isBreakDue({seconds:900,notified:true},15),false);
  assert.equal(isBreakDue({seconds:9999},0),false);
});
