import test, {type TestContext} from 'node:test';
import React from 'react';
import {render, useInput, usePaste} from '../src/index.js';
import createStdout from './helpers/create-stdout.js';
import {createStdin, emitReadable} from './helpers/create-stdin.js';
import term from './helpers/term.js';
import {act} from './helpers/act.js';

test('usePaste - receives bracketed paste as single text blob', async (t: TestContext) => {
	const ps = term('use-paste', ['basic']);
	ps.write('\u{1B}[200~hello world\u{1B}[201~');
	await ps.waitForExit();
	t.assert.ok(ps.output.includes('exited'));
	t.assert.ok(
		ps.output.includes('\u{1B}[?2004h'),
		'bracketed paste mode was enabled',
	);
	t.assert.ok(
		ps.output.includes('\u{1B}[?2004l'),
		'bracketed paste mode was disabled on exit',
	);
});

test('usePaste - paste content with escape sequences is delivered verbatim', async (t: TestContext) => {
	const ps = term('use-paste', ['escapeSequences']);
	ps.write('\u{1B}[200~hello\u{1B}[Aworld\u{1B}[201~');
	await ps.waitForExit();
	t.assert.ok(ps.output.includes('exited'));
});

test('usePaste - useInput does not receive bracketed paste content', async (t: TestContext) => {
	const ps = term('use-paste', ['noUseInput']);
	ps.write('\u{1B}[200~hello\u{1B}[201~');
	await ps.waitForExit();
	t.assert.ok(ps.output.includes('exited'));
});

test('usePaste - multiple simultaneous hooks both receive the same paste event', async (t: TestContext) => {
	const ps = term('use-paste', ['multipleHooks']);
	ps.write('\u{1B}[200~hello\u{1B}[201~');
	await ps.waitForExit();
	t.assert.ok(ps.output.includes('exited'));
});

test('usePaste - unterminated paste is flushed after a delay and input recovers', async (t: TestContext) => {
	const stdin = createStdin();
	const pastes: string[] = [];
	const inputs: string[] = [];
	function Example() {
		usePaste(text => {
			pastes.push(text);
		});
		useInput(input => {
			inputs.push(input);
		});
		return null;
	}

	let instance!: ReturnType<typeof render>;
	await act(async () => {
		instance = render(<Example />, {
			stdin,
			stdout: createStdout(),
			patchConsole: false,
		});
	});
	t.after(() => {
		instance.unmount();
	});
	await act(async () => {
		emitReadable(stdin, '\u{1B}[200~hello');
	});
	await act(async () => {
		emitReadable(stdin, ' world');
	});
	t.assert.deepStrictEqual(pastes, []);
	await act(async () => {
		await new Promise(resolve => {
			setTimeout(resolve, 1200);
		});
	});
	await act(async () => {
		emitReadable(stdin, 'q');
	});

	t.assert.deepStrictEqual(pastes, ['hello world']);
	t.assert.deepStrictEqual(inputs, ['q']);
});
