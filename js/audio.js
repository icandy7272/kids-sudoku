/* 音效：用 Web Audio API 合成，无外部资源。静音状态存 localStorage。 */
(function () {
  'use strict';

  var STORAGE_KEY = 'kidSudoku.muted';
  var ctx = null;
  var muted = false;

  try {
    muted = localStorage.getItem(STORAGE_KEY) === '1';
  } catch (e) { /* 隐私模式下读不到，保持默认 */ }

  function ensureContext() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* 在 when 时刻播放一个音符。type: 波形, freq: 频率, dur: 时长, vol: 音量 */
  function tone(when, type, freq, dur, vol) {
    var c = ensureContext();
    if (!c || muted) return;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    var t = c.currentTime + when;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function playTap() {
    tone(0, 'sine', 600, 0.08, 0.15);
  }

  function playPlace() {
    tone(0, 'sine', 520, 0.1, 0.2);
    tone(0.07, 'sine', 780, 0.12, 0.2);
  }

  function playWrong() {
    tone(0, 'triangle', 220, 0.18, 0.18);
    tone(0.1, 'triangle', 180, 0.22, 0.15);
  }

  function playHint() {
    tone(0, 'sine', 880, 0.08, 0.15);
    tone(0.08, 'sine', 1175, 0.1, 0.15);
    tone(0.16, 'sine', 1568, 0.15, 0.15);
  }

  function playWin() {
    var notes = [523, 659, 784, 1047, 784, 1047];
    for (var i = 0; i < notes.length; i++) {
      tone(i * 0.12, 'sine', notes[i], 0.25, 0.22);
      tone(i * 0.12, 'triangle', notes[i] / 2, 0.25, 0.1);
    }
  }

  function isMuted() {
    return muted;
  }

  function toggleMute() {
    muted = !muted;
    try {
      localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    } catch (e) { /* 存不了就只在本次会话生效 */ }
    return muted;
  }

  window.KidSudoku = window.KidSudoku || {};
  window.KidSudoku.audio = {
    playTap: playTap,
    playPlace: playPlace,
    playWrong: playWrong,
    playHint: playHint,
    playWin: playWin,
    isMuted: isMuted,
    toggleMute: toggleMute,
  };
})();
