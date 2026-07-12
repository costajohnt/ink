import Yoga from 'yoga-layout';
import {type DOMElement} from './dom.js';

type Output = {
	/**
	Horizontal position (0-based column) within the live layout region.
	*/
	x: number;

	/**
	Vertical position (0-based row) within the live layout region.
	*/
	y: number;

	/**
	Element width.
	*/
	width: number;

	/**
	Element height.
	*/
	height: number;

	/**
	Element width excluding borders.
	*/
	clientWidth: number;

	/**
	Element height excluding borders.
	*/
	clientHeight: number;

	/**
	Total width of the element's content, including content not visible due to overflow. Always at least `clientWidth`.
	*/
	scrollWidth: number;

	/**
	Total height of the element's content, including content not visible due to overflow. Always at least `clientHeight`.
	*/
	scrollHeight: number;
};

const emptyOutput: Output = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	clientWidth: 0,
	clientHeight: 0,
	scrollWidth: 0,
	scrollHeight: 0,
};

/**
Measure the layout metrics of a particular `<Box>` element.
Returns an object with `x`, `y`, `width`, `height`, `clientWidth`, `clientHeight`, `scrollWidth` and `scrollHeight` properties.

`x` and `y` are the element's position within the live layout region, computed by walking up the layout tree and accumulating each ancestor's offset. These are layout-tree coordinates, not terminal viewport coordinates. To compare them with mouse events, convert the event coordinates using the live region's viewport position. This is necessary even in alternate-screen mode when output, such as `<Static>` content, appears above the live region.

The remaining properties are useful when your component needs to know the amount of available space it has, or how far its content overflows. You can use them when you need to change the layout based on the length of its content, or to build scrollable views together with the `contentOffsetX`/`contentOffsetY` props.

Note: `measureElement()` returns zeros for all properties when called during render (before layout is calculated). Call it from post-render code, such as `useEffect`, `useLayoutEffect`, input handlers, or timer callbacks. When content changes, pass the relevant dependency to your effect so it re-measures after each update.
*/
const measureElement = (node: DOMElement): Output => {
	const {yogaNode} = node;

	if (!yogaNode) {
		return emptyOutput;
	}

	let x = yogaNode.getComputedLeft();
	let y = yogaNode.getComputedTop();

	let current = node.parentNode;

	while (current) {
		if (current.yogaNode) {
			x += current.yogaNode.getComputedLeft();
			y += current.yogaNode.getComputedTop();
		}

		current = current.parentNode;
	}

	const width = yogaNode.getComputedWidth();
	const height = yogaNode.getComputedHeight();
	const borderLeft = yogaNode.getComputedBorder(Yoga.EDGE_LEFT);
	const borderTop = yogaNode.getComputedBorder(Yoga.EDGE_TOP);

	const clientWidth =
		width - borderLeft - yogaNode.getComputedBorder(Yoga.EDGE_RIGHT);

	const clientHeight =
		height - borderTop - yogaNode.getComputedBorder(Yoga.EDGE_BOTTOM);

	let contentWidth = 0;
	let contentHeight = 0;

	for (let index = 0; index < yogaNode.getChildCount(); index++) {
		const child = yogaNode.getChild(index);

		contentWidth = Math.max(
			contentWidth,
			child.getComputedLeft() -
				borderLeft +
				child.getComputedWidth() +
				child.getComputedMargin(Yoga.EDGE_RIGHT),
		);

		contentHeight = Math.max(
			contentHeight,
			child.getComputedTop() -
				borderTop +
				child.getComputedHeight() +
				child.getComputedMargin(Yoga.EDGE_BOTTOM),
		);
	}

	return {
		x,
		y,
		width,
		height,
		clientWidth,
		clientHeight,
		scrollWidth: Math.max(contentWidth, clientWidth),
		scrollHeight: Math.max(contentHeight, clientHeight),
	};
};

export default measureElement;
export type {Output as ElementMetrics};
