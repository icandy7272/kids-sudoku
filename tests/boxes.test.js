'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const boxes = require('../js/boxes.js');

test('getBoxDims returns box shape for divisible sizes', () => {
  assert.deepEqual(boxes.getBoxDims(4), { rows: 2, cols: 2 });
  assert.deepEqual(boxes.getBoxDims(6), { rows: 2, cols: 3 });
  assert.deepEqual(boxes.getBoxDims(8), { rows: 2, cols: 4 });
  assert.deepEqual(boxes.getBoxDims(9), { rows: 3, cols: 3 });
});

test('getBoxDims returns null for latin-square sizes (5, 7)', () => {
  assert.equal(boxes.getBoxDims(5), null);
  assert.equal(boxes.getBoxDims(7), null);
});

test('getBoxIndex maps cells to boxes for 6x6 (2-row x 3-col boxes)', () => {
  assert.equal(boxes.getBoxIndex(6, 0, 0), 0);
  assert.equal(boxes.getBoxIndex(6, 0, 3), 1);
  assert.equal(boxes.getBoxIndex(6, 1, 2), 0);
  assert.equal(boxes.getBoxIndex(6, 2, 0), 2);
  assert.equal(boxes.getBoxIndex(6, 5, 5), 5);
});

test('getBoxIndex maps cells to boxes for 9x9', () => {
  assert.equal(boxes.getBoxIndex(9, 0, 0), 0);
  assert.equal(boxes.getBoxIndex(9, 4, 4), 4);
  assert.equal(boxes.getBoxIndex(9, 8, 8), 8);
  assert.equal(boxes.getBoxIndex(9, 0, 8), 2);
  assert.equal(boxes.getBoxIndex(9, 8, 0), 6);
});

test('getBoxIndex returns -1 when size has no boxes', () => {
  assert.equal(boxes.getBoxIndex(5, 2, 2), -1);
  assert.equal(boxes.getBoxIndex(7, 0, 0), -1);
});

test('every box contains exactly size cells', () => {
  for (const size of [4, 6, 8, 9]) {
    const counts = new Map();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const b = boxes.getBoxIndex(size, r, c);
        counts.set(b, (counts.get(b) || 0) + 1);
      }
    }
    assert.equal(counts.size, size, `size ${size} should have ${size} boxes`);
    for (const [, n] of counts) assert.equal(n, size);
  }
});
