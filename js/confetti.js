/* 庆祝彩纸：canvas 全屏动画，彩色纸片混合当前主题的 emoji 一起飘落。 */
(function () {
  'use strict';

  var COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ff9ff3', '#a29bfe'];
  var running = false;

  function launch(emojis, durationMs) {
    if (running) return;
    running = true;

    var canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var pieces = [];
    for (var i = 0; i < 140; i++) {
      var isEmoji = emojis.length > 0 && i % 4 === 0;
      pieces.push({
        x: Math.random() * canvas.width,
        y: -30 - Math.random() * canvas.height * 0.5,
        vx: (Math.random() - 0.5) * 2.5,
        vy: 2 + Math.random() * 3.5,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.2,
        size: isEmoji ? 22 + Math.random() * 14 : 7 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        emoji: isEmoji ? emojis[i % emojis.length] : null,
      });
    }

    var start = Date.now();
    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var j = 0; j < pieces.length; j++) {
        var p = pieces[j];
        p.x += p.vx + Math.sin((Date.now() / 300) + j) * 0.6;
        p.y += p.vy;
        p.rot += p.vrot;
        if (p.y > canvas.height + 40) {
          p.y = -30;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.emoji) {
          ctx.font = p.size + 'px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji, 0, 0);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      if (Date.now() - start < durationMs) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
        running = false;
      }
    }
    requestAnimationFrame(frame);
  }

  window.KidSudoku = window.KidSudoku || {};
  window.KidSudoku.confetti = { launch: launch };
})();
