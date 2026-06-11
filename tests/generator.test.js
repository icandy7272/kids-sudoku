'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const generator = require('../js/generator.js');
const solver = require('../js/solver.js');
const boxes = require('../js/boxes.js');

const ALL_SIZES = [4, 5, 6, 7, 8, 9];

function assertValidFullGrid(grid, size) {
  const expected = [];
  for (let v = 1; v <= size; v++) expected.push(v);
  // rows
  for (let r = 0; r < size; r++) {
    assert.deepEqual([...grid[r]].sort((a, b) => a - b), expected, `row ${r}`);
  }
  // columns
  for (let c = 0; c < size; c++) {
    const col = grid.map((row) => row[c]);
    assert.deepEqual(col.sort((a, b) => a - b), expected, `col ${c}`);
  }
  // boxes
  if (boxes.getBoxDims(size)) {
    const byBox = new Map();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const b = boxes.getBoxIndex(size, r, c);
        if (!byBox.has(b)) byBox.set(b, []);
        byBox.get(b).push(grid[r][c]);
      }
    }
    for (const [b, vals] of byBox) {
      assert.deepEqual(vals.sort((a, b2) => a - b2), expected, `box ${b}`);
    }
  }
}

test('generateFull produces a valid grid for every size', () => {
  for (const size of ALL_SIZES) {
    const grid = generator.generateFull(size, generator.createRng(42));
    assertValidFullGrid(grid, size);
  }
});

test('generatePuzzle: puzzle is a subset of its solution', () => {
  for (const size of ALL_SIZES) {
    const { puzzle, solution } = generator.generatePuzzle(size, 'medium', 7);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (puzzle[r][c] !== 0) {
          assert.equal(puzzle[r][c], solution[r][c], `cell ${r},${c} size ${size}`);
        }
      }
    }
    assertValidFullGrid(solution, size);
  }
});

test('generatePuzzle: every puzzle has exactly one solution', () => {
  for (const size of ALL_SIZES) {
    for (const difficulty of ['easy', 'medium', 'hard']) {
      const { puzzle } = generator.generatePuzzle(size, difficulty, 99);
      assert.equal(
        solver.countSolutions(puzzle, size, 2),
        1,
        `size ${size} ${difficulty}`
      );
    }
  }
});

test('generatePuzzle: difficulty controls how many cells are removed', () => {
  const size = 9;
  const count = (grid) => grid.flat().filter((v) => v === 0).length;
  const easy = count(generator.generatePuzzle(size, 'easy', 5).puzzle);
  const hard = count(generator.generatePuzzle(size, 'hard', 5).puzzle);
  assert.ok(easy > 0, 'easy removes at least one cell');
  assert.ok(easy <= Math.ceil(size * size * 0.3), 'easy removes at most 30%');
  assert.ok(hard <= Math.ceil(size * size * 0.55), 'hard removes at most 55%');
  assert.ok(hard > easy, 'hard removes more than easy');
});

test('generatePuzzle is deterministic for the same seed', () => {
  const a = generator.generatePuzzle(6, 'medium', 123);
  const b = generator.generatePuzzle(6, 'medium', 123);
  assert.deepEqual(a, b);
});

test('generatePuzzle rejects unknown sizes and difficulties', () => {
  assert.throws(() => generator.generatePuzzle(3, 'easy', 1));
  assert.throws(() => generator.generatePuzzle(10, 'easy', 1));
  assert.throws(() => generator.generatePuzzle(9, 'impossible', 1));
});
