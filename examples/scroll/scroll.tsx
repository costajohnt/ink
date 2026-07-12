import React, {useRef, useState} from 'react';
import {
	render,
	Box,
	Text,
	useInput,
	useApp,
	useBoxMetrics,
} from '../../src/index.js';

function ScrollView({
	height,
	children,
}: {
	readonly height: number;
	readonly children: React.ReactNode;
}) {
	const ref = useRef(null);
	const {clientHeight, scrollHeight} = useBoxMetrics(ref);
	const [scrollTop, setScrollTop] = useState(0);
	const maxScrollTop = Math.max(0, scrollHeight - clientHeight);

	useInput((_input, key) => {
		if (key.upArrow) {
			setScrollTop(previousScrollTop => Math.max(0, previousScrollTop - 1));
		}

		if (key.downArrow) {
			setScrollTop(previousScrollTop =>
				Math.min(maxScrollTop, previousScrollTop + 1),
			);
		}
	});

	return (
		<Box flexDirection="column">
			<Box
				ref={ref}
				height={height}
				overflow="hidden"
				contentOffsetY={scrollTop}
				flexDirection="column"
				borderStyle="round"
			>
				{children}
			</Box>
			<Text dimColor>
				scrollTop={scrollTop}/{maxScrollTop} client={clientHeight} scroll=
				{scrollHeight} (↑/↓ to scroll, q to quit)
			</Text>
		</Box>
	);
}

function Demo() {
	const {exit} = useApp();

	useInput(input => {
		if (input === 'q') {
			exit();
		}
	});

	return (
		<ScrollView height={10}>
			{Array.from({length: 40}, (_, index) => (
				<Text key={index}>
					Line {String(index + 1).padStart(2, '0')}{' '}
					{index % 5 === 0 ? '◀ marker' : ''}
				</Text>
			))}
		</ScrollView>
	);
}

render(<Demo />);
