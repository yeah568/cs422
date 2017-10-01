const WIDTH = 4;
const HEIGHT = 3;
const NUM_VALID = 9;

const BLOCKED = {
	row: 1,
	col: 1,
}

const TERMINAL1 = {
	row: 2,
	col: 3,
}

const TERMINAL2 = {
	row: 1,
	col: 3,
}

const Actions = {
	UP: 1,
	DOWN: 2,
	LEFT: 3,
	RIGHT: 4,
};

function getObservationProbability(e, i, j) {
	let a;
	switch (e) {
		case 1:
			a = [.1, .1, .1, .1, 0, .1, .9, .9, .9, .1, 0, 0];
			break;
		case 2:
			a = [.9, .9, .9, .9, 0, .9, .1, .1, .1, .9, 0, 0];
			break;
		case 3:
			a = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1];
			break;
	}
	return a[i * HEIGHT + j];
}

function isValidCoord(i, j) {
	const inGrid = i >= 0 && i <= WIDTH - 1 && j >= 0 && j <= HEIGHT - 1;
	const isBlocked = i === BLOCKED.col && j === BLOCKED.row;
	return inGrid && !isBlocked;
}

function getPossiblePrevState(a, i, j) {
	const prev = [];
	switch (a) {
		case Actions.UP:
			// came from below
			if (isValidCoord(i, j - 1)) {
				prev.push({i: i, j: j-1, prob: 0.8});
			}
			// came from left
			if (isValidCoord(i - 1, j)) {
				prev.push({i: i-1, j: j, prob: 0.1});
			}
			// came from right
			if (isValidCoord(i + 1, j)) {
				prev.push({i: i+1, j: j, prob: 0.1});
			}
			//
			if (isValidCoord(i, j+1) && (!isValidCoord(i-1,j) || !isValidCoord(i+1, j))) {
				prev.push({i: i, j: j, prob: 0.1});
			} else if (!isValidCoord(i, j + 1) && (!isValidCoord(i-1,j) || !isValidCoord(i+1, j))) {
				prev.push({i: i, j: j, prob: 0.9});
			} else if (!isValidCoord(i, j+1)) {
				prev.push({i: i, j: j, prob: 0.8});
			}

			break;
		case Actions.DOWN:
			break;
		case Actions.LEFT:
			break;
		case Actions.RIGHT:
			break;
	}
	//console.log(`calculating prevs for ${i} ${j}`)
	//console.log('possible prevs: ', prev);
	return prev;
}

function eq(i, j, coord) {
	return i === coord.col && j === coord.row;
}

// indexing goes from bottom left corner
// goes up column, then moves one column right

function initBeliefState(s) {
	const b = [];
	for (let i = 0; i < WIDTH * HEIGHT; i++) {
		b[i] = 0;
	}
	if (s) {
		b[s.row + s.col * HEIGHT] = 1;
	} else {
		for (let i = 0; i < WIDTH; i++) {
			for (let j = 0; j < HEIGHT; j++) {
				if (eq(i, j, BLOCKED) || eq(i, j, TERMINAL1) || eq(i, j, TERMINAL2)) {
						b[i * HEIGHT + j] = 0;
				} else {
					b[i * HEIGHT + j] = 1 / NUM_VALID;
				}
			}
		}
	}
	return b;
}

function updateBeliefState(b, a, e) {
	const updated = [];
	for (let i = 0; i < WIDTH; i++) {
		for (let j = 0; j < HEIGHT; j++) {
			if (eq(i, j, BLOCKED)) {
				updated[i * HEIGHT + j] = 0;
			} else {
				const prevs = getPossiblePrevState(a, i, j)
				const sum = prevs.reduce((prev, s) => {
					return prev + s.prob * b[s.i * HEIGHT + s.j]
				}, 0);
				updated[i * HEIGHT + j] = getObservationProbability(e, i, j) * sum
			}
		}
	}

	const alpha = updated.reduce((acc, e) => acc + e, 0);
	const normalized = updated.map(e => e/alpha);
	//console.log('update: ', normalized);
	return normalized;
}

function run(actions, envs, s) {
	let belief = initBeliefState(s);
	//console.log('init: ', belief);
	for (let i = 0; i < actions.length; i++) {
		belief = updateBeliefState(belief, actions[i], envs[i]);
	}
	return belief;
}

// converted to 0-indexed positions
console.log('run 1', run([Actions.UP, Actions.UP, Actions.UP], [2, 2, 2]));
console.log('run 2', run([Actions.UP, Actions.UP, Actions.UP], [1, 1, 1]));
// run([Actions.RIGHT, Actions.RIGHT, Actions.UP], [1, 1, 3], {row: 1, col: 2});
// run([Actions.UP, Actions.RIGHT, Actions.RIGHT, Actions.RIGHT], [2, 2, 1, 1], {row: 0, col: 0});
