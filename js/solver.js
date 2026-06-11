/* 回溯解算器：判断落子合法性、求解、统计解的数量（用于唯一解校验）。
 * 网格表示：二维数组，0 = 空格，1..size = 符号编号。 */
(function () {
  'use strict';

  var isNode = typeof module !== 'undefined' && module.exports;
  var boxes = isNode ? require('./boxes.js') : window.KidSudoku.boxes;

  function isValidPlacement(grid, size, row, col, value) {
    for (var i = 0; i < size; i++) {
      if (i !== col && grid[row][i] === value) return false;
      if (i !== row && grid[i][col] === value) return false;
    }
    var dims = boxes.getBoxDims(size);
    if (dims) {
      var r0 = Math.floor(row / dims.rows) * dims.rows;
      var c0 = Math.floor(col / dims.cols) * dims.cols;
      for (var r = r0; r < r0 + dims.rows; r++) {
        for (var c = c0; c < c0 + dims.cols; c++) {
          if ((r !== row || c !== col) && grid[r][c] === value) return false;
        }
      }
    }
    return true;
  }

  function copyGrid(grid) {
    return grid.map(function (row) { return row.slice(); });
  }

  function findEmpty(grid, size) {
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (grid[r][c] === 0) return { r: r, c: c };
      }
    }
    return null;
  }

  /* 已填入的格子之间是否存在冲突（用于解数量统计前的快速排除）。 */
  function hasContradiction(grid, size) {
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        var v = grid[r][c];
        if (v !== 0 && !isValidPlacement(grid, size, r, c, v)) return true;
      }
    }
    return false;
  }

  function solveInPlace(grid, size) {
    var empty = findEmpty(grid, size);
    if (!empty) return true;
    for (var v = 1; v <= size; v++) {
      if (isValidPlacement(grid, size, empty.r, empty.c, v)) {
        grid[empty.r][empty.c] = v;
        if (solveInPlace(grid, size)) return true;
        grid[empty.r][empty.c] = 0;
      }
    }
    return false;
  }

  function solve(grid, size) {
    if (hasContradiction(grid, size)) return null;
    var work = copyGrid(grid);
    return solveInPlace(work, size) ? work : null;
  }

  /* 统计解的数量，最多数到 limit 即提前返回。 */
  function countSolutions(grid, size, limit) {
    if (hasContradiction(grid, size)) return 0;
    var work = copyGrid(grid);
    var count = 0;

    function walk() {
      var empty = findEmpty(work, size);
      if (!empty) {
        count++;
        return;
      }
      for (var v = 1; v <= size && count < limit; v++) {
        if (isValidPlacement(work, size, empty.r, empty.c, v)) {
          work[empty.r][empty.c] = v;
          walk();
          work[empty.r][empty.c] = 0;
        }
      }
    }

    walk();
    return count;
  }

  var api = {
    isValidPlacement: isValidPlacement,
    solve: solve,
    countSolutions: countSolutions,
    copyGrid: copyGrid,
  };
  if (isNode) {
    module.exports = api;
  } else {
    window.KidSudoku = window.KidSudoku || {};
    window.KidSudoku.solver = api;
  }
})();
