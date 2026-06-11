/* 渲染层：根据游戏状态重建棋盘和符号面板 DOM。
 * view = { selectedCell, activeSymbol, lastMove }，handlers 由 main.js 提供。 */
(function () {
  'use strict';

  var boxes = window.KidSudoku.boxes;
  var stateMod = window.KidSudoku.state;

  function symbolFor(theme, value) {
    return theme.symbols[value - 1];
  }

  /* 朗读/无障碍用的符号名称：SVG 主题用 names，emoji/数字直接用符号本身 */
  function symbolName(theme, value) {
    return theme.names ? theme.names[value - 1] : theme.symbols[value - 1];
  }

  /* 把符号填进元素：SVG 主题用 innerHTML，其余用 textContent */
  function setSymbol(elem, theme, value) {
    if (theme.type === 'svg') elem.innerHTML = symbolFor(theme, value);
    else elem.textContent = symbolFor(theme, value);
  }

  /* 蓝粉双色橡皮图标（Unicode 没有橡皮 emoji） */
  var ERASER_SVG = '<svg viewBox="0 0 64 64" aria-hidden="true">' +
    '<g transform="rotate(-35 32 32)">' +
    '<rect x="10" y="22" width="44" height="22" rx="6" fill="#5cc9f5" stroke="rgba(80,60,90,0.3)" stroke-width="1.5"/>' +
    '<path d="M32 22h16a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H32z" fill="#ff9ec0"/>' +
    '</g></svg>';

  function cellClasses(game, view, r, c) {
    var cls = ['cell'];
    var size = game.size;
    var v = game.entries[r][c];
    var dims = boxes.getBoxDims(size);

    if (stateMod.isGiven(game, r, c)) cls.push('given');
    if (stateMod.isWrong(game, r, c)) cls.push('wrong');

    if (dims) {
      // 相邻宫交替底色，让孩子一眼看清宫的范围
      var boxRow = Math.floor(r / dims.rows);
      var boxCol = Math.floor(c / dims.cols);
      if ((boxRow + boxCol) % 2 === 1) cls.push('box-alt');
    }

    var sel = view.selectedCell;
    if (sel) {
      if (sel.r === r && sel.c === c) {
        cls.push('selected');
        // 选中的格子已填对：外框转绿色作为正向反馈（填错保持红色，由 wrong 规则负责）
        if (v !== 0 && v === game.solution[r][c]) cls.push('correct');
      } else if (sel.r === r || sel.c === c) {
        cls.push('hl-line');
      }
      var selVal = game.entries[sel.r][sel.c];
      if (selVal !== 0 && v === selVal) cls.push('hl-same');
    }

    var last = view.lastMove;
    if (last && last.r === r && last.c === c) {
      cls.push(last.wrong ? 'anim-wiggle' : 'anim-pop');
    }
    return cls.join(' ');
  }

  function buildCell(game, view, handlers, r, c) {
    var theme = game.theme;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = cellClasses(game, view, r, c);
    var v = game.entries[r][c];
    if (v !== 0) {
      setSymbol(btn, theme, v);
      if (theme.type === 'number') btn.classList.add('num-' + v);
      btn.setAttribute('aria-label', '第' + (r + 1) + '行第' + (c + 1) + '列：' + symbolName(theme, v));
    } else {
      btn.setAttribute('aria-label', '第' + (r + 1) + '行第' + (c + 1) + '列：空');
    }
    btn.addEventListener('click', function () { handlers.onCellClick(r, c); });
    return btn;
  }

  /* 有宫的棋盘按“宫容器”嵌套渲染，每宫有明显外框；
   * 拉丁方阵（5×5/7×7）没有宫，保持平铺。 */
  function renderBoard(container, game, view, handlers) {
    var size = game.size;
    var dims = boxes.getBoxDims(size);
    container.innerHTML = '';
    container.style.setProperty('--n', size);
    container.classList.toggle('numbers-theme', game.theme.type === 'number');
    container.classList.toggle('boxed', !!dims);

    if (!dims) {
      for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
          container.appendChild(buildCell(game, view, handlers, r, c));
        }
      }
      return;
    }

    var boxesPerRow = size / dims.cols;
    var boxesPerCol = size / dims.rows;
    container.style.setProperty('--bpr', boxesPerRow);
    for (var br = 0; br < boxesPerCol; br++) {
      for (var bc = 0; bc < boxesPerRow; bc++) {
        var box = document.createElement('div');
        box.className = 'box' + ((br + bc) % 2 === 1 ? ' box-tint' : '');
        box.style.setProperty('--bc', dims.cols);
        for (var r2 = br * dims.rows; r2 < (br + 1) * dims.rows; r2++) {
          for (var c2 = bc * dims.cols; c2 < (bc + 1) * dims.cols; c2++) {
            box.appendChild(buildCell(game, view, handlers, r2, c2));
          }
        }
        container.appendChild(box);
      }
    }
  }

  function countRemaining(game, value) {
    var placed = 0;
    for (var r = 0; r < game.size; r++) {
      for (var c = 0; c < game.size; c++) {
        if (game.entries[r][c] === value) placed++;
      }
    }
    return game.size - placed;
  }

  function renderPalette(container, game, view, handlers) {
    var theme = game.theme;
    container.innerHTML = '';

    for (var v = 1; v <= game.size; v++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'symbol-btn';
      if (theme.type === 'number') btn.classList.add('num-' + v);

      var remaining = countRemaining(game, v);
      if (remaining <= 0) btn.classList.add('done');

      var face = document.createElement('span');
      face.className = 'symbol-face';
      setSymbol(face, theme, v);
      btn.appendChild(face);

      var badge = document.createElement('span');
      badge.className = 'symbol-count';
      badge.textContent = remaining > 0 ? remaining : '✓';
      btn.appendChild(badge);

      btn.setAttribute('aria-label', '填入' + symbolName(theme, v) + '，还差' + Math.max(remaining, 0) + '个');
      (function (value, button) {
        button.addEventListener('click', function () { handlers.onSymbolClick(value, button); });
      })(v, btn);
      container.appendChild(btn);
    }

    var eraser = document.createElement('button');
    eraser.type = 'button';
    eraser.className = 'symbol-btn eraser';
    eraser.innerHTML = '<span class="symbol-face">' + ERASER_SVG + '</span>';
    eraser.setAttribute('aria-label', '橡皮擦');
    eraser.addEventListener('click', function () { handlers.onEraserClick(eraser); });
    container.appendChild(eraser);
  }

  window.KidSudoku.ui = {
    renderBoard: renderBoard,
    renderPalette: renderPalette,
  };
})();
