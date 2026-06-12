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

  /* 愿望猫（用户自备素材，仅个人非商业用途）。前 4 只配色区分度最高，供小棋盘使用 */
  var WISHCAT_DIR = 'assets/wishcats/';
  var WISHCATS = [
    { file: 'pink.png', name: '粉粉猫' },
    { file: 'crown.png', name: '皇冠猫' },
    { file: 'star.png', name: '星星猫' },
    { file: 'chef.png', name: '厨师猫' },
    { file: 'sailor.png', name: '水手猫' },
    { file: 'sporty.png', name: '元气猫' },
    { file: 'flower.png', name: '花花猫' },
    { file: 'glasses.png', name: '眼镜猫' },
    { file: 'bow.png', name: '蝴蝶结猫' },
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
      confetti: ['🦄', '🌈', '⭐'],
    },
    {
      id: 'wishcat',
      name: '愿望猫',
      icon: '😺',
      type: 'image',
      symbols: WISHCATS.map(function (c) { return WISHCAT_DIR + c.file; }),
      names: WISHCATS.map(function (c) { return c.name; }),
      confetti: ['😺', '💖', '⭐'],
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
