/* 符号主题：每个主题提供至多 9 个符号，按棋盘大小取前 N 个。
 * type: 'emoji' 直接渲染字符；'number' 渲染彩色数字；'image' 渲染图片。 */
(function () {
  'use strict';

  /* 小马宝莉主角头像（图片版权归 Hasbro，仅个人非商业用途） */
  var PONY_DIR = 'assets/ponies/';
  var PONIES = [
    { file: 'twilight.png', name: '紫悦' },
    { file: 'pinkie.png', name: '碧琪' },
    { file: 'rainbow.png', name: '云宝' },
    { file: 'fluttershy.png', name: '柔柔' },
    { file: 'rarity.png', name: '珍奇' },
    { file: 'applejack.png', name: '苹果嘉儿' },
    { file: 'luna.png', name: '月亮公主' },
    { file: 'celestia.png', name: '宇宙公主' },
    { file: 'spike.png', name: '穗龙' },
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
      name: '小马宝莉',
      icon: '🦄',
      type: 'image',
      symbols: PONIES.map(function (p) { return PONY_DIR + p.file; }),
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
