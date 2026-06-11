/* 宫格划分：每种棋盘尺寸对应的宫（box）形状与索引。
 * 5×5 / 7×7 无法均分矩形宫，采用拉丁方阵规则（只查行和列）。 */
(function () {
  'use strict';

  var BOX_DIMS = {
    4: { rows: 2, cols: 2 },
    6: { rows: 2, cols: 3 },
    8: { rows: 2, cols: 4 },
    9: { rows: 3, cols: 3 },
  };

  function getBoxDims(size) {
    return BOX_DIMS[size] || null;
  }

  function getBoxIndex(size, row, col) {
    var dims = getBoxDims(size);
    if (!dims) return -1;
    var boxesPerRow = size / dims.cols;
    return Math.floor(row / dims.rows) * boxesPerRow + Math.floor(col / dims.cols);
  }

  var api = { getBoxDims: getBoxDims, getBoxIndex: getBoxIndex };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    window.KidSudoku = window.KidSudoku || {};
    window.KidSudoku.boxes = api;
  }
})();
