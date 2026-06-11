/* 主流程：屏幕切换、设置选择、游戏事件、胜利流程、进度存档。 */
(function () {
  'use strict';

  var K = window.KidSudoku;
  var SETTINGS_KEY = 'kidSudoku.settings';
  var STARS_KEY = 'kidSudoku.stars';

  var SIZE_OPTIONS = [
    { size: 4, label: '4×4', tip: '我是新手' },
    { size: 5, label: '5×5', tip: '热身一下' },
    { size: 6, label: '6×6', tip: '有点意思' },
    { size: 7, label: '7×7', tip: '动动脑筋' },
    { size: 8, label: '8×8', tip: '我很厉害' },
    { size: 9, label: '9×9', tip: '大师挑战' },
  ];
  var DIFFICULTY_OPTIONS = [
    { id: 'easy', label: '简单', stars: 1 },
    { id: 'medium', label: '普通', stars: 2 },
    { id: 'hard', label: '挑战', stars: 3 },
  ];
  var PRAISES = ['太棒了！', '你真聪明！', '数独小达人！', '完美完成！', '好厉害呀！', '继续加油！'];

  var settings = { size: 4, themeId: 'animals', difficulty: 'easy' };
  var game = null;
  var view = { selectedCell: null, activeSymbol: null, lastMove: null };

  var el = {};

  function loadSettings() {
    try {
      var raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (K.generator.SUPPORTED_SIZES.indexOf(saved.size) !== -1) settings.size = saved.size;
      if (K.themes.getTheme(saved.themeId).id === saved.themeId) settings.themeId = saved.themeId;
      if (['easy', 'medium', 'hard'].indexOf(saved.difficulty) !== -1) settings.difficulty = saved.difficulty;
    } catch (e) { /* 存档损坏就用默认设置 */ }
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) { /* 忽略 */ }
  }

  function getStars() {
    try {
      var n = parseInt(localStorage.getItem(STARS_KEY), 10);
      return isNaN(n) ? 0 : n;
    } catch (e) {
      return 0;
    }
  }

  function addStars(n) {
    try {
      localStorage.setItem(STARS_KEY, String(getStars() + n));
    } catch (e) { /* 忽略 */ }
  }

  /* ---------- 主页 ---------- */

  function renderOptionGroup(container, options, isSelected, onPick) {
    container.innerHTML = '';
    options.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn' + (isSelected(opt) ? ' selected' : '');
      btn.innerHTML = opt.html;
      btn.addEventListener('click', function () {
        K.audio.playTap();
        onPick(opt);
        renderHome();
      });
      container.appendChild(btn);
    });
  }

  function renderHome() {
    el.starsTotal.textContent = getStars();

    renderOptionGroup(
      el.sizeOptions,
      SIZE_OPTIONS.map(function (o) {
        return { size: o.size, html: '<b>' + o.label + '</b><small>' + o.tip + '</small>' };
      }),
      function (opt) { return opt.size === settings.size; },
      function (opt) { settings.size = opt.size; saveSettings(); }
    );

    renderOptionGroup(
      el.themeOptions,
      K.themes.THEMES.map(function (t) {
        return { id: t.id, html: '<span class="opt-icon">' + t.icon + '</span><small>' + t.name + '</small>' };
      }),
      function (opt) { return opt.id === settings.themeId; },
      function (opt) { settings.themeId = opt.id; saveSettings(); }
    );

    renderOptionGroup(
      el.difficultyOptions,
      DIFFICULTY_OPTIONS.map(function (d) {
        return { id: d.id, html: '<b>' + '⭐'.repeat(d.stars) + '</b><small>' + d.label + '</small>' };
      }),
      function (opt) { return opt.id === settings.difficulty; },
      function (opt) { settings.difficulty = opt.id; saveSettings(); }
    );
  }

  function showScreen(name) {
    el.homeScreen.classList.toggle('hidden', name !== 'home');
    el.gameScreen.classList.toggle('hidden', name !== 'game');
    el.winOverlay.classList.add('hidden');
  }

  /* ---------- 游戏 ---------- */

  function startGame() {
    var theme = K.themes.getTheme(settings.themeId);
    var generated;
    try {
      generated = K.generator.generatePuzzle(settings.size, settings.difficulty);
    } catch (e) {
      alert('出题失败了，请再试一次哦');
      return;
    }
    game = K.state.createGame({
      size: settings.size,
      puzzle: generated.puzzle,
      solution: generated.solution,
      theme: theme,
      difficulty: settings.difficulty,
    });
    view = { selectedCell: null, activeSymbol: null, lastMove: null };
    el.gameBadge.textContent = theme.icon + ' ' + settings.size + '×' + settings.size;
    showScreen('game');
    renderGame();
  }

  function renderGame() {
    K.ui.renderBoard(el.board, game, view, handlers);
    K.ui.renderPalette(el.palette, game, view, handlers);
    el.undoBtn.disabled = game.history.length === 0;
  }

  function place(r, c, value) {
    var next = K.state.placeSymbol(game, r, c, value);
    if (next === game) return;
    game = next;
    var wrong = K.state.isWrong(game, r, c);
    view = Object.assign({}, view, { lastMove: { r: r, c: c, wrong: wrong } });
    if (wrong) K.audio.playWrong();
    else K.audio.playPlace();
    renderGame();
    if (K.state.isComplete(game)) {
      setTimeout(celebrate, 350);
    }
  }

  function erase(r, c) {
    var next = K.state.eraseCell(game, r, c);
    if (next === game) return;
    game = next;
    view = Object.assign({}, view, { lastMove: null });
    K.audio.playTap();
    renderGame();
  }

  /* 交互不变式：selectedCell 和 activeSymbol 任何时刻最多只有一个生效，
   * 避免“格子和图案同时高亮”的混乱。 */
  var handlers = {
    onCellClick: function (r, c) {
      if (K.state.isGiven(game, r, c)) {
        if (view.activeSymbol) {
          // 印章模式下点题目格：保持印章，不抢占选中态
          K.audio.playTap();
          return;
        }
        // 点题目格：高亮相同符号，帮助观察；再点一次取消
        var selGiven = view.selectedCell;
        var sameGiven = selGiven && selGiven.r === r && selGiven.c === c;
        view = Object.assign({}, view, { selectedCell: sameGiven ? null : { r: r, c: c }, lastMove: null });
        K.audio.playTap();
        renderGame();
        return;
      }
      if (view.activeSymbol === 'eraser') {
        erase(r, c);
        return;
      }
      if (typeof view.activeSymbol === 'number') {
        place(r, c, view.activeSymbol);
        return;
      }
      var sel = view.selectedCell;
      var same = sel && sel.r === r && sel.c === c;
      view = Object.assign({}, view, { selectedCell: same ? null : { r: r, c: c }, lastMove: null });
      K.audio.playTap();
      renderGame();
    },

    onSymbolClick: function (value) {
      var sel = view.selectedCell;
      if (sel && !view.activeSymbol && !K.state.isGiven(game, sel.r, sel.c)) {
        place(sel.r, sel.c, value);
        return;
      }
      // 没选格子（或选的是题目格）：把符号当作“印章”，再点格子直接盖上去
      var nextActive = view.activeSymbol === value ? null : value;
      view = Object.assign({}, view, { activeSymbol: nextActive, selectedCell: null, lastMove: null });
      K.audio.playTap();
      renderGame();
    },

    onEraserClick: function () {
      var sel = view.selectedCell;
      if (sel && !view.activeSymbol && !K.state.isGiven(game, sel.r, sel.c)) {
        erase(sel.r, sel.c);
        return;
      }
      var nextActive = view.activeSymbol === 'eraser' ? null : 'eraser';
      view = Object.assign({}, view, { activeSymbol: nextActive, selectedCell: null, lastMove: null });
      K.audio.playTap();
      renderGame();
    },
  };

  function onHint() {
    var next = K.state.applyHint(game);
    if (next === game) return;
    game = next;
    view = Object.assign({}, view, { lastMove: null });
    K.audio.playHint();
    renderGame();
    if (K.state.isComplete(game)) setTimeout(celebrate, 350);
  }

  function onUndo() {
    var next = K.state.undo(game);
    if (next === game) return;
    game = next;
    view = Object.assign({}, view, { lastMove: null });
    K.audio.playTap();
    renderGame();
  }

  function celebrate() {
    // 延迟触发期间可能已点了“换一题”，确认当前盘面仍是完成态
    if (!K.state.isComplete(game)) return;
    var earned = DIFFICULTY_OPTIONS.filter(function (d) { return d.id === game.difficulty; })[0].stars;
    addStars(earned);
    K.audio.playWin();
    K.confetti.launch(game.theme.type === 'emoji' ? game.theme.symbols.slice(0, game.size) : ['⭐', '🎉'], 3500);
    el.winPraise.textContent = PRAISES[Math.floor(Math.random() * PRAISES.length)];
    el.winStars.textContent = '⭐'.repeat(earned);
    el.winTotal.textContent = '一共收集了 ' + getStars() + ' 颗星星';
    el.winOverlay.classList.remove('hidden');
  }

  function updateMuteButton() {
    el.muteBtn.textContent = K.audio.isMuted() ? '🔇' : '🔊';
    el.muteBtn.setAttribute('aria-label', K.audio.isMuted() ? '打开声音' : '关闭声音');
  }

  /* ---------- 键盘支持（数字键、退格、方向键） ---------- */

  function onKeyDown(e) {
    if (!game || el.gameScreen.classList.contains('hidden')) return;
    var sel = view.selectedCell;
    var n = parseInt(e.key, 10);
    if (!isNaN(n) && n >= 1 && n <= game.size && sel) {
      place(sel.r, sel.c, n);
      return;
    }
    if ((e.key === 'Backspace' || e.key === 'Delete') && sel) {
      e.preventDefault();
      erase(sel.r, sel.c);
      return;
    }
    var dr = { ArrowUp: -1, ArrowDown: 1 }[e.key] || 0;
    var dc = { ArrowLeft: -1, ArrowRight: 1 }[e.key] || 0;
    if (dr || dc) {
      e.preventDefault();
      var r = sel ? Math.min(Math.max(sel.r + dr, 0), game.size - 1) : 0;
      var c = sel ? Math.min(Math.max(sel.c + dc, 0), game.size - 1) : 0;
      view = Object.assign({}, view, { selectedCell: { r: r, c: c }, activeSymbol: null });
      renderGame();
    }
  }

  /* ---------- 启动 ---------- */

  function init() {
    el = {
      homeScreen: document.getElementById('home-screen'),
      gameScreen: document.getElementById('game-screen'),
      winOverlay: document.getElementById('win-overlay'),
      starsTotal: document.getElementById('stars-total'),
      sizeOptions: document.getElementById('size-options'),
      themeOptions: document.getElementById('theme-options'),
      difficultyOptions: document.getElementById('difficulty-options'),
      startBtn: document.getElementById('start-btn'),
      board: document.getElementById('board'),
      palette: document.getElementById('palette'),
      gameBadge: document.getElementById('game-badge'),
      homeBtn: document.getElementById('home-btn'),
      muteBtn: document.getElementById('mute-btn'),
      hintBtn: document.getElementById('hint-btn'),
      undoBtn: document.getElementById('undo-btn'),
      newBtn: document.getElementById('new-btn'),
      winPraise: document.getElementById('win-praise'),
      winStars: document.getElementById('win-stars'),
      winTotal: document.getElementById('win-total'),
      winAgainBtn: document.getElementById('win-again-btn'),
      winHomeBtn: document.getElementById('win-home-btn'),
    };

    loadSettings();
    renderHome();
    updateMuteButton();

    el.startBtn.addEventListener('click', function () { K.audio.playTap(); startGame(); });
    el.homeBtn.addEventListener('click', function () { K.audio.playTap(); showScreen('home'); renderHome(); });
    el.muteBtn.addEventListener('click', function () { K.audio.toggleMute(); updateMuteButton(); K.audio.playTap(); });
    el.hintBtn.addEventListener('click', onHint);
    el.undoBtn.addEventListener('click', onUndo);
    el.newBtn.addEventListener('click', function () { K.audio.playTap(); startGame(); });
    el.winAgainBtn.addEventListener('click', function () { K.audio.playTap(); startGame(); });
    el.winHomeBtn.addEventListener('click', function () { K.audio.playTap(); showScreen('home'); renderHome(); });
    document.addEventListener('keydown', onKeyDown);

    showScreen('home');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
