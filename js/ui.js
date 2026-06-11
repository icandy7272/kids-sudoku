/* 渲染层：根据游戏状态重建棋盘和符号面板 DOM。
 * view = { selectedCell, activeSymbol, lastMove }，handlers 由 main.js 提供。 */
(function () {
  'use strict';

  var boxes = window.KidSudoku.boxes;
  var stateMod = window.KidSudoku.state;

  function symbolFor(theme, value) {
    return theme.symbols[value - 1];
  }

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
      if (sel.r === r && sel.c === c) cls.push('selected');
      else if (sel.r === r || sel.c === c) cls.push('hl-line');
      var selVal = game.entries[sel.r][sel.c];
      if (selVal !== 0 && v === selVal) cls.push('hl-same');
    }
    if (view.activeSymbol && typeof view.activeSymbol === 'number' && v === view.activeSymbol) {
      cls.push('hl-same');
    }

    var last = view.lastMove;
    if (last && last.r === r && last.c === c) {
      cls.push(last.wrong ? 'anim-wiggle' : 'anim-pop');
    }
    return cls.join(' ');
  }

  function renderBoard(container, game, view, handlers) {
    var theme = game.theme;
    container.innerHTML = '';
    container.style.setProperty('--n', game.size);
    container.classList.toggle('numbers-theme', theme.type === 'number');

    for (var r = 0; r < game.size; r++) {
      for (var c = 0; c < game.size; c++) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = cellClasses(game, view, r, c);
        var v = game.entries[r][c];
        if (v !== 0) {
          btn.textContent = symbolFor(theme, v);
          if (theme.type === 'number') btn.classList.add('num-' + v);
          btn.setAttribute('aria-label', '第' + (r + 1) + '行第' + (c + 1) + '列：' + symbolFor(theme, v));
        } else {
          btn.setAttribute('aria-label', '第' + (r + 1) + '行第' + (c + 1) + '列：空');
        }
        (function (row, col) {
          btn.addEventListener('click', function () { handlers.onCellClick(row, col); });
        })(r, c);
        container.appendChild(btn);
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
      if (view.activeSymbol === v) btn.classList.add('active');

      var remaining = countRemaining(game, v);
      if (remaining <= 0) btn.classList.add('done');

      var face = document.createElement('span');
      face.className = 'symbol-face';
      face.textContent = symbolFor(theme, v);
      btn.appendChild(face);

      var badge = document.createElement('span');
      badge.className = 'symbol-count';
      badge.textContent = remaining > 0 ? remaining : '✓';
      btn.appendChild(badge);

      btn.setAttribute('aria-label', '选择' + symbolFor(theme, v) + '，还差' + Math.max(remaining, 0) + '个');
      (function (value) {
        btn.addEventListener('click', function () { handlers.onSymbolClick(value); });
      })(v);
      container.appendChild(btn);
    }

    var eraser = document.createElement('button');
    eraser.type = 'button';
    eraser.className = 'symbol-btn eraser';
    if (view.activeSymbol === 'eraser') eraser.classList.add('active');
    eraser.innerHTML = '<span class="symbol-face">🧽</span>';
    eraser.setAttribute('aria-label', '橡皮擦');
    eraser.addEventListener('click', function () { handlers.onEraserClick(); });
    container.appendChild(eraser);
  }

  window.KidSudoku.ui = {
    renderBoard: renderBoard,
    renderPalette: renderPalette,
  };
})();
