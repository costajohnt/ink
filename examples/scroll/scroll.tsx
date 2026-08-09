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
	const {clientWidth, clientHeight, scrollWidth, scrollHeight} =
		useBoxMetrics(ref);
	const [scrollTop, setScrollTop] = useState(0);
	const [scrollLeft, setScrollLeft] = useState(0);
	const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
	const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);

	useInput((_input, key) => {
		if (key.upArrow) {
			setScrollTop(previousScrollTop => Math.max(0, previousScrollTop - 1));
		}

		if (key.downArrow) {
			setScrollTop(previousScrollTop =>
				Math.min(maxScrollTop, previousScrollTop + 1),
			);
		}

		if (key.leftArrow) {
			setScrollLeft(previousScrollLeft => Math.max(0, previousScrollLeft - 2));
		}

		if (key.rightArrow) {
			setScrollLeft(previousScrollLeft =>
				Math.min(maxScrollLeft, previousScrollLeft + 2),
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
				contentOffsetX={scrollLeft}
				flexDirection="column"
				borderStyle="round"
			>
				{/* flexShrink=0 keeps the content at its natural height, so it can overflow (and scroll) instead of being squeezed into the viewport. The explicit width gives the content a horizontal extent wider than the viewport; without it, text wraps or truncates at the viewport edge and there is nothing to scroll horizontally. */}
				<Box flexDirection="column" flexShrink={0} width={140}>
					{children}
				</Box>
			</Box>
			<Text dimColor>
				scrollTop={scrollTop}/{maxScrollTop} scrollLeft={scrollLeft}/
				{maxScrollLeft} client={clientWidth}x{clientHeight} scroll=
				{scrollWidth}x{scrollHeight} (arrows to scroll, q to quit)
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
				<Text key={index} wrap="truncate">
					Line {String(index + 1).padStart(2, '0')}{' '}
					{index % 5 === 0
						? `◀ marker ${'·'.repeat(100)} end-of-line-${index + 1} ▶`
						: ''}
				</Text>
			))}
		</ScrollView>
	);
}

render(<Demo />);
