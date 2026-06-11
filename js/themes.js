/* 符号主题：每个主题提供至多 9 个符号，按棋盘大小取前 N 个。
 * type: 'emoji' 直接渲染字符；'number' 渲染彩色数字；'svg' 渲染内联 SVG。 */
(function () {
  'use strict';

  /* 原创卡通小马头像：身体色 + 鬃毛色组合区分角色，独角兽带小角。
   * 图层：后层鬃毛 → 头 → 口鼻 → 前层刘海 → 角/耳朵 → 眼睛。 */
  function ponySvg(body, maneColors, horn) {
    function maneCircles(positions) {
      var out = '';
      for (var i = 0; i < positions.length; i++) {
        out += '<circle cx="' + positions[i][0] + '" cy="' + positions[i][1] + '" r="' + positions[i][2] +
          '" fill="' + maneColors[i % maneColors.length] + '"/>';
      }
      return out;
    }
    var stroke = ' stroke="rgba(80,60,90,0.25)" stroke-width="1.5"';
    var hornSvg = horn
      ? '<polygon points="44,1 50,16 36,13" fill="#f7d978" stroke="rgba(80,60,90,0.3)" stroke-width="1"/>'
      : '';
    return '<svg viewBox="0 0 64 64" aria-hidden="true">' +
      maneCircles([[16, 22, 11], [11, 36, 10], [14, 50, 8]]) +
      '<ellipse cx="37" cy="40" rx="21" ry="19" fill="' + body + '"' + stroke + '/>' +
      '<ellipse cx="51" cy="47" rx="9" ry="7.5" fill="rgba(255,255,255,0.45)"/>' +
      maneCircles([[34, 15, 10], [23, 18, 9]]) +
      hornSvg +
      '<polygon points="53,7 61,24 46,21" fill="' + body + '"' + stroke + '/>' +
      '<ellipse cx="40" cy="38" rx="6.5" ry="7.5" fill="#fff"/>' +
      '<circle cx="41" cy="39" r="3.4" fill="#3a2e4d"/>' +
      '<circle cx="42.5" cy="36.5" r="1.3" fill="#fff"/>' +
      '<circle cx="54" cy="46" r="1.8" fill="rgba(80,60,90,0.45)"/>' +
      '</svg>';
  }

  var PONIES = [
    { name: '紫紫', body: '#c9a3e8', mane: ['#5a4494', '#e84f9b', '#5a4494', '#5a4494'], horn: true },
    { name: '粉粉', body: '#f9b7d4', mane: ['#e84f9b'], horn: false },
    { name: '彩虹', body: '#9ad9f5', mane: ['#e8484f', '#f5c842', '#4f8fe8', '#6cc24a'], horn: false },
    { name: '柔柔', body: '#fdf1b8', mane: ['#f7a8c4'], horn: false },
    { name: '雪白', body: '#f3eefb', mane: ['#8a4fd0'], horn: true },
    { name: '橙橙', body: '#f5b15c', mane: ['#f7e08e'], horn: false },
    { name: '夜夜', body: '#5a6ab8', mane: ['#7ab8f0'], horn: true },
    { name: '金金', body: '#fdf6e3', mane: ['#a8e8d0', '#f7b8d4', '#b8c4f7'], horn: true },
    { name: '薄荷', body: '#b8e8d8', mane: ['#2ea88f', '#f7f7f7'], horn: false },
  ];

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
      id: 'pony',
      name: '小马',
      icon: '🦄',
      type: 'svg',
      symbols: PONIES.map(function (p) { return ponySvg(p.body, p.mane, p.horn); }),
      names: PONIES.map(function (p) { return p.name; }),
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
