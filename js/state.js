/* 游戏状态：全部采用不可变更新，每次操作返回新状态，天然支持撤销。 */
(function () {
  'use strict';

  function copyGrid(grid) {
    return grid.map(function (row) { return row.slice(); });
  }

  function createGame(options) {
    return {
      size: options.size,
      puzzle: copyGrid(options.puzzle),
      solution: copyGrid(options.solution),
      entries: copyGrid(options.puzzle),
      history: [],
      hintsUsed: 0,
      theme: options.theme || null,
      difficulty: options.difficulty || null,
    };
  }

  function isGiven(state, row, col) {
    return state.puzzle[row][col] !== 0;
  }

  function withEntries(state, entries) {
    return {
      size: state.size,
      puzzle: state.puzzle,
      solution: state.solution,
      entries: entries,
      history: state.history.concat([state.entries]),
      hintsUsed: state.hintsUsed,
      theme: state.theme,
      difficulty: state.difficulty,
    };
  }

  function placeSymbol(state, row, col, value) {
    if (isGiven(state, row, col) || state.entries[row][col] === value) return state;
    var entries = copyGrid(state.entries);
    entries[row][col] = value;
    return withEntries(state, entries);
  }

  function eraseCell(state, row, col) {
    if (isGiven(state, row, col) || state.entries[row][col] === 0) return state;
    var entries = copyGrid(state.entries);
    entries[row][col] = 0;
    return withEntries(state, entries);
  }

  function undo(state) {
    if (state.history.length === 0) return state;
    return {
      size: state.size,
      puzzle: state.puzzle,
      solution: state.solution,
      entries: state.history[state.history.length - 1],
      history: state.history.slice(0, -1),
      hintsUsed: state.hintsUsed,
      theme: state.theme,
      difficulty: state.difficulty,
    };
  }

  function isWrong(state, row, col) {
    var v = state.entries[row][col];
    return v !== 0 && v !== state.solution[row][col];
  }

  function isComplete(state) {
    for (var r = 0; r < state.size; r++) {
      for (var c = 0; c < state.size; c++) {
        if (state.entries[r][c] !== state.solution[r][c]) return false;
      }
    }
    return true;
  }

  /* 提示：优先纠正一个填错的格子，否则填入一个空格的正确答案。 */
  function applyHint(state) {
    var target = null;
    for (var r = 0; r < state.size && !target; r++) {
      for (var c = 0; c < state.size && !target; c++) {
        if (isWrong(state, r, c)) target = { r: r, c: c };
      }
    }
    if (!target) {
      var empties = [];
      for (var r2 = 0; r2 < state.size; r2++) {
        for (var c2 = 0; c2 < state.size; c2++) {
          if (state.entries[r2][c2] === 0) empties.push({ r: r2, c: c2 });
        }
      }
      if (empties.length === 0) return state;
      target = empties[Math.floor(Math.random() * empties.length)];
    }
    var next = placeSymbol(state, target.r, target.c, state.solution[target.r][target.c]);
    if (next === state) return state;
    return {
      size: next.size,
      puzzle: next.puzzle,
      solution: next.solution,
      entries: next.entries,
      history: next.history,
      hintsUsed: next.hintsUsed + 1,
      theme: next.theme,
      difficulty: next.difficulty,
    };
  }

  var api = {
    createGame: createGame,
    isGiven: isGiven,
    placeSymbol: placeSymbol,
    eraseCell: eraseCell,
    undo: undo,
    isWrong: isWrong,
    isComplete: isComplete,
    applyHint: applyHint,
  };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.KidSudoku = window.KidSudoku || {};
    window.KidSudoku.state = api;
  }
})();
