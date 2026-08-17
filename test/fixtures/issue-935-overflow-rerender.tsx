import process from 'node:process';
import {runIssue450RerenderFixture} from './issue-450-fixture-helpers.js';

// Pre-existing terminal output that must survive Ink's full-clear fallback.
const rows = Number(process.argv[2]) || 6;
for (let index = 0; index < rows; index++) {
	process.stdout.write(`#935 scrollback ${index}\n`);
}

runIssue450RerenderFixture({
	heightForFrame: rows => rows + 1,
});
