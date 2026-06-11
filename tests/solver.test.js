'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const solver = require('../js/solver.js');

function gridFromRows(rows) {
  return rows.map((row) => row.slice());
}

// A valid full 4x4 solution (2x2 boxes).
const FULL_4 = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];

test('isValidPlacement rejects row, column and box duplicates', () => {
  const grid = gridFromRows([
    [1, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  assert.equal(solver.isValidPlacement(grid, 4, 0, 3, 1), false, 'row dup');
  assert.equal(solver.isValidPlacement(grid, 4, 3, 0, 1), false, 'col dup');
  assert.equal(solver.isValidPlacement(grid, 4, 1, 1, 1), false, 'box dup');
  assert.equal(solver.isValidPlacement(grid, 4, 1, 2, 1), true, 'free cell');
});

test('isValidPlacement ignores boxes for latin-square sizes', () => {
  const grid = [];
  for (let r = 0; r < 5; r++) grid.push([0, 0, 0, 0, 0]);
  grid[0][0] = 1;
  // Same "would-be box" but only row/col rules apply on 5x5.
  assert.equal(solver.isValidPlacement(grid, 5, 1, 1, 1), true);
  assert.equal(solver.isValidPlacement(grid, 5, 0, 4, 1), false, 'row dup');
  assert.equal(solver.isValidPlacement(grid, 5, 4, 0, 1), false, 'col dup');
});

test('solve completes a 4x4 puzzle to the known solution', () => {
  const puzzle = gridFromRows([
    [1, 0, 3, 0],
    [0, 4, 0, 2],
    [2, 0, 4, 0],
    [0, 3, 0, 1],
  ]);
  const solved = solver.solve(puzzle, 4);
  assert.deepEqual(solved, FULL_4);
  // input must not be mutated
  assert.equal(puzzle[0][1], 0);
});

test('solve returns null for an unsolvable grid', () => {
  const bad = gridFromRows([
    [1, 2, 3, 0],
    [0, 0, 0, 4], // forces (0,3) impossible: row has 1,2,3 and col has 4
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  assert.equal(solver.solve(bad, 4), null);
});

test('countSolutions: full valid grid has exactly 1', () => {
  assert.equal(solver.countSolutions(gridFromRows(FULL_4), 4, 2), 1);
});

test('countSolutions: empty grid hits the limit', () => {
  const empty = gridFromRows([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  assert.equal(solver.countSolutions(empty, 4, 2), 2);
});

test('countSolutions: contradictory grid has 0', () => {
  const bad = gridFromRows([
    [1, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  assert.equal(solver.countSolutions(bad, 4, 2), 0);
});

test('solve handles a known 9x9 puzzle', () => {
  const puzzle = gridFromRows([
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ]);
  const solved = solver.solve(puzzle, 9);
  assert.ok(solved, 'should be solvable');
  assert.equal(solved[0][2], 4);
  assert.equal(solved[8][0], 3);
  // every row contains 1..9
  for (const row of solved) {
    assert.deepEqual([...row].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  }
});
