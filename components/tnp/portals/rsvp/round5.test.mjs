import test from 'node:test';
import { historicalImport, historicalTravel, completedGuardIsolation } from './round5-scenarios.mjs';
test('retained duplicate material replays its own accepted/rejected receipt but rejects unseen occurrence', historicalImport);
for (const direction of ['arrival', 'departure']) test(`clear ${direction} preserves historical evidence and releases active dependencies`, () => historicalTravel(direction));
test('completed route stays visible but cannot block current allocation or dispatch', completedGuardIsolation);
