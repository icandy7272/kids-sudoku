'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const stateMod = require('../js/state.js');

const PUZZLE = [
  [1, 0, 3, 0],
  [0, 4, 0, 2],
  [2, 0, 4, 0],
  [0, 3, 0, 1],
];
const SOLUTION = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];

function newGame() {
  return stateMod.createGame({ size: 4, puzzle: PUZZLE, solution: SOLUTION });
}

test('createGame copies the puzzle into entries', () => {
  const s = newGame();
  assert.deepEqual(s.entries, PUZZLE);
  assert.notEqual(s.entries, PUZZLE, 'must be a copy, not the same reference');
});

test('placeSymbol returns a new state and never mutates the old one', () => {
  const s1 = newGame();
  const s2 = stateMod.placeSymbol(s1, 0, 1, 2);
  assert.equal(s1.entries[0][1], 0, 'original untouched');
  assert.equal(s2.entries[0][1], 2);
  assert.notEqual(s1, s2);
});

test('placeSymbol cannot overwrite a given cell', () => {
  const s1 = newGame();
  const s2 = stateMod.placeSymbol(s1, 0, 0, 4);
  assert.equal(s2.entries[0][0], 1);
  assert.equal(s2, s1, 'no-op returns the same state');
});

test('eraseCell clears user entries but not givens', () => {
  const s1 = newGame();
  const s2 = stateMod.placeSymbol(s1, 0, 1, 2);
  const s3 = stateMod.eraseCell(s2, 0, 1);
  assert.equal(s3.entries[0][1], 0);
  const s4 = stateMod.eraseCell(s3, 0, 0);
  assert.equal(s4.entries[0][0], 1, 'given stays');
});

test('undo restores the previous entries', () => {
  const s1 = newGame();
  const s2 = stateMod.placeSymbol(s1, 0, 1, 2);
  const s3 = stateMod.placeSymbol(s2, 1, 0, 3);
  const s4 = stateMod.undo(s3);
  assert.deepEqual(s4.entries, s2.entries);
  const s5 = stateMod.undo(stateMod.undo(s4));
  assert.deepEqual(s5.entries, s1.entries, 'undo past the start is safe');
});

test('isWrong flags entries that differ from the solution', () => {
  const s1 = newGame();
  const wrong = stateMod.placeSymbol(s1, 0, 1, 4);
  assert.equal(stateMod.isWrong(wrong, 0, 1), true);
  const right = stateMod.placeSymbol(s1, 0, 1, 2);
  assert.equal(stateMod.isWrong(right, 0, 1), false);
  assert.equal(stateMod.isWrong(s1, 0, 3), false, 'empty cell is not wrong');
});

test('isComplete is true only when the board matches the solution', () => {
  let s = newGame();
  assert.equal(stateMod.isComplete(s), false);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (PUZZLE[r][c] === 0) s = stateMod.placeSymbol(s, r, c, SOLUTION[r][c]);
    }
  }
  assert.equal(stateMod.isComplete(s), true);
});

test('hint fills one empty cell with the correct value', () => {
  const s1 = newGame();
  const s2 = stateMod.applyHint(s1);
  let filled = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (PUZZLE[r][c] === 0 && s2.entries[r][c] !== 0) {
        filled++;
        assert.equal(s2.entries[r][c], SOLUTION[r][c]);
      }
    }
  }
  assert.equal(filled, 1);
  assert.equal(s2.hintsUsed, 1);
});

test('hint fixes a wrong cell before filling empty ones', () => {
  const s1 = stateMod.placeSymbol(newGame(), 0, 1, 4); // wrong
  const s2 = stateMod.applyHint(s1);
  assert.equal(s2.entries[0][1], 2, 'wrong cell corrected first');
});
