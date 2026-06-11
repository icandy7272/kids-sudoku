/* 符号主题：每个主题提供至多 9 个符号，按棋盘大小取前 N 个。 */
(function () {
  'use strict';

  var THEMES = [
    {
      id: 'animals',
      name: '动物',
      icon: '🐶',
      type: 'emoji',
      symbols: ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵', '🦁'],
    },
    {
      id: 'fruits',
      name: '水果',
      icon: '🍎',
      type: 'emoji',
      symbols: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍑', '🥝', '🍒'],
    },
    {
      id: 'vehicles',
      name: '交通',
      icon: '🚗',
      type: 'emoji',
      symbols: ['🚗', '🚌', '🚒', '🚜', '✈️', '🚀', '🚁', '⛵', '🚲'],
    },
    {
      id: 'ocean',
      name: '海洋',
      icon: '🐳',
      type: 'emoji',
      symbols: ['🐳', '🐬', '🐠', '🐙', '🦀', '🐢', '🦈', '🐡', '🐚'],
    },
    {
      id: 'numbers',
      name: '数字',
      icon: '🔢',
      type: 'number',
      symbols: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    },
  ];

  function getTheme(id) {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].id === id) return THEMES[i];
    }
    return THEMES[0];
  }

  window.KidSudoku = window.KidSudoku || {};
  window.KidSudoku.themes = { THEMES: THEMES, getTheme: getTheme };
})();
