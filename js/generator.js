/* 出题器：先回溯生成完整盘，再随机挖洞，每挖一格用解算器校验唯一解。
 * 接受随机种子，便于测试复现。 */
(function () {
  'use strict';

  var isNode = typeof module !== 'undefined' && module.exports;
  var solver = isNode ? require('./solver.js') : window.KidSudoku.solver;

  var SUPPORTED_SIZES = [4, 5, 6, 7, 8, 9];
  var REMOVAL_RATIOS = { easy: 0.3, medium: 0.45, hard: 0.55 };

  /* mulberry32：小巧的种子随机数生成器。 */
  function createRng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffled(items, rng) {
    var arr = items.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function emptyGrid(size) {
    var grid = [];
    for (var r = 0; r < size; r++) {
      var row = [];
      for (var c = 0; c < size; c++) row.push(0);
      grid.push(row);
    }
    return grid;
  }

  function generateFull(size, rng) {
    var grid = emptyGrid(size);
    var values = [];
    for (var v = 1; v <= size; v++) values.push(v);

    function fill(index) {
      if (index === size * size) return true;
      var r = Math.floor(index / size);
      var c = index % size;
      var candidates = shuffled(values, rng);
      for (var i = 0; i < candidates.length; i++) {
        if (solver.isValidPlacement(grid, size, r, c, candidates[i])) {
          grid[r][c] = candidates[i];
          if (fill(index + 1)) return true;
          grid[r][c] = 0;
        }
      }
      return false;
    }

    fill(0);
    return grid;
  }

  /* 随机顺序逐格尝试挖空；破坏唯一解就放回去。
   * 达到目标挖空数或所有格子试过一遍即停止，天然有上限不会卡死。 */
  function digHoles(solution, size, targetRemovals, rng) {
    var puzzle = solver.copyGrid(solution);
    var cells = [];
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) cells.push({ r: r, c: c });
    }
    var removed = 0;
    var order = shuffled(cells, rng);
    for (var i = 0; i < order.length && removed < targetRemovals; i++) {
      var cell = order[i];
      var backup = puzzle[cell.r][cell.c];
      puzzle[cell.r][cell.c] = 0;
      if (solver.countSolutions(puzzle, size, 2) === 1) {
        removed++;
      } else {
        puzzle[cell.r][cell.c] = backup;
      }
    }
    return puzzle;
  }

  function generatePuzzle(size, difficulty, seed) {
    if (SUPPORTED_SIZES.indexOf(size) === -1) {
      throw new Error('不支持的棋盘大小: ' + size);
    }
    var ratio = REMOVAL_RATIOS[difficulty];
    if (!ratio) {
      throw new Error('不支持的难度: ' + difficulty);
    }
    var rng = createRng(seed === undefined ? Math.floor(Math.random() * 1e9) : seed);
    var solution = generateFull(size, rng);
    var target = Math.floor(size * size * ratio);
    var puzzle = digHoles(solution, size, target, rng);
    return { puzzle: puzzle, solution: solution };
  }

  var api = {
    createRng: createRng,
    generateFull: generateFull,
    generatePuzzle: generatePuzzle,
    SUPPORTED_SIZES: SUPPORTED_SIZES,
  };
  if (isNode) {
    module.exports = api;
  } else {
    window.KidSudoku = window.KidSudoku || {};
    window.KidSudoku.generator = api;
  }
})();
