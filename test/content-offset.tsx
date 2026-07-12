import React from 'react';
import test from 'ava';
import boxen from 'boxen';
import {Box, Text} from '../src/index.js';
import {renderToString} from './helpers/render-to-string.js';

test('contentOffsetY - scrolls content up', t => {
	const output = renderToString(
		<Box
			height={2}
			overflowY="hidden"
			contentOffsetY={1}
			flexDirection="column"
		>
			<Box flexDirection="column" flexShrink={0}>
				<Text>Line 1</Text>
				<Text>Line 2</Text>
				<Text>Line 3</Text>
			</Box>
		</Box>,
	);

	t.is(output, 'Line 2\nLine 3');
});

test('contentOffsetY - zero offset renders content unchanged', t => {
	const output = renderToString(
		<Box
			height={2}
			overflowY="hidden"
			contentOffsetY={0}
			flexDirection="column"
		>
			<Box flexDirection="column" flexShrink={0}>
				<Text>Line 1</Text>
				<Text>Line 2</Text>
				<Text>Line 3</Text>
			</Box>
		</Box>,
	);

	t.is(output, 'Line 1\nLine 2');
});

test('contentOffsetY - offset beyond content renders empty', t => {
	const output = renderToString(
		<Box
			height={2}
			overflowY="hidden"
			contentOffsetY={5}
			flexDirection="column"
		>
			<Box flexDirection="column" flexShrink={0}>
				<Text>Line 1</Text>
				<Text>Line 2</Text>
			</Box>
		</Box>,
	);

	t.is(output, '\n');
});

test('contentOffsetX - scrolls content left', t => {
	const output = renderToString(
		<Box width={5} overflowX="hidden" contentOffsetX={6}>
			<Box width={11} flexShrink={0}>
				<Text>Hello World</Text>
			</Box>
		</Box>,
	);

	t.is(output, 'World');
});

test('contentOffsetX and contentOffsetY - scroll both directions', t => {
	const output = renderToString(
		<Box
			width={3}
			height={2}
			overflow="hidden"
			contentOffsetX={2}
			contentOffsetY={1}
			flexDirection="column"
		>
			<Box flexDirection="column" flexShrink={0} width={5}>
				<Text>aaaaa</Text>
				<Text>bbbbb</Text>
				<Text>ccccc</Text>
			</Box>
		</Box>,
	);

	t.is(output, 'bbb\nccc');
});

test('contentOffsetY - content stays inside border', t => {
	const output = renderToString(
		<Box
			height={4}
			width={8}
			overflowY="hidden"
			contentOffsetY={1}
			borderStyle="round"
			flexDirection="column"
		>
			<Box flexDirection="column" flexShrink={0}>
				<Text>Line 1</Text>
				<Text>Line 2</Text>
				<Text>Line 3</Text>
			</Box>
		</Box>,
	);

	t.is(output, boxen('Line 2\nLine 3', {borderStyle: 'round', width: 8}));
});

test('contentOffsetY - nested offset containers compose', t => {
	const output = renderToString(
		<Box
			height={2}
			overflowY="hidden"
			contentOffsetY={1}
			flexDirection="column"
		>
			<Box
				height={4}
				overflowY="hidden"
				contentOffsetY={1}
				flexDirection="column"
				flexShrink={0}
			>
				<Box flexDirection="column" flexShrink={0}>
					<Text>Line 1</Text>
					<Text>Line 2</Text>
					<Text>Line 3</Text>
					<Text>Line 4</Text>
				</Box>
			</Box>
		</Box>,
	);

	// Inner box scrolls to lines 2-4; outer box shows rows 2-3 of that: lines 3-4.
	t.is(output, 'Line 3\nLine 4');
});
