import process from 'node:process';
import {runIssue450RerenderFixture} from './issue-450-fixture-helpers.js';

// Pre-existing terminal output that must survive Ink's full-clear fallback.
const rows = Number(process.argv[2]) || 6;
for (let index = 0; index < rows; index++) {
	process.stdout.write(`#935 scrollback ${index}\n`);
}

runIssue450RerenderFixture({
	heightForFrame: rows => rows + 1,
	// The last frame is shorter than the one before it, so an incomplete clear
	// leaves the tail of the previous frame's row behind (`frame 8 STALE-ROW`).
	labelForFrame: frameCount =>
		frameCount === 7 ? 'frame 7 STALE-ROW' : `frame ${frameCount}`,
});
