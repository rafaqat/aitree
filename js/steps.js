/**
 * steps.js — A-Z step sequencer with timeline and animation
 *
 * Step windows use the prototype's 15% overlap formula for smooth transitions.
 * Transport: play/pause, prev/next, jump-to-step, timeline scrub.
 */
const StepSequencer = (() => {
  let steps = [];
  let globalT = 0;
  let animating = false;
  let speed = 1;
  let onUpdate = null; // callback(globalT, activeIndex)

  function setSteps(newSteps) {
    steps = newSteps || [];
    globalT = 0;
    animating = false;
  }

  function getSteps() { return steps; }
  function getProgress() { return globalT; }

  function setProgress(t) {
    globalT = Math.max(0, Math.min(1, t));
    notify();
  }

  function setSpeed(s) { speed = s; }

  function play() {
    if (globalT >= 1) globalT = 0;
    animating = true;
    tick();
  }

  function pause() { animating = false; }
  function isPlaying() { return animating; }

  function togglePlay() {
    if (animating) pause();
    else play();
  }

  function next() {
    const idx = FoldEngine.activeStepIndex(steps, globalT);
    const target = Math.min(steps.length - 1, idx + 1);
    jumpTo(target);
  }

  function prev() {
    const idx = FoldEngine.activeStepIndex(steps, globalT);
    const target = Math.max(0, idx - 1);
    jumpTo(target);
  }

  /** Jump to end-state of step at given index */
  function jumpTo(index) {
    if (!steps.length) return;
    animating = false;
    const count = steps.length;
    const sliceW = 1 / count;
    const overlap = 0.15;
    const end = Math.min(1, (index + 1) * sliceW + overlap * 0.5);
    globalT = end;
    notify();
  }

  function reset() {
    animating = false;
    globalT = 0;
    notify();
  }

  function tick() {
    if (!animating) return;
    requestAnimationFrame(tick);
    const delta = speed / 2200;
    globalT = Math.min(1, globalT + delta);
    if (globalT >= 1) {
      globalT = 1;
      animating = false;
    }
    notify();
  }

  function notify() {
    const idx = FoldEngine.activeStepIndex(steps, globalT);
    if (onUpdate) onUpdate(globalT, idx);
  }

  /** Build step list DOM inside container using safe DOM methods */
  function renderStepList(container) {
    while (container.firstChild) container.removeChild(container.firstChild);

    steps.forEach((step, i) => {
      const div = document.createElement('div');
      div.className = 'step-item';
      div.id = 'step-' + i;

      const badge = document.createElement('span');
      badge.className = 'step-badge ' + step.type;
      badge.textContent = step.id;

      const label = document.createElement('span');
      label.className = 'step-label';
      label.textContent = step.label;

      div.appendChild(badge);
      div.appendChild(label);
      div.addEventListener('click', () => jumpTo(i));
      container.appendChild(div);
    });
  }

  /** Update step list active/done states */
  function updateStepList(globalT) {
    const count = steps.length;
    const sliceW = 1 / count;
    const overlap = 0.15;

    steps.forEach((_, i) => {
      const el = document.getElementById('step-' + i);
      if (!el) return;
      const start = Math.max(0, i * sliceW - overlap * 0.5);
      const end = Math.min(1, (i + 1) * sliceW + overlap * 0.5);

      if (globalT <= start) el.className = 'step-item';
      else if (globalT >= end) el.className = 'step-item done';
      else el.className = 'step-item active';
    });
  }

  /** Update step overlay text */
  function updateOverlay(globalT) {
    const overlay = document.getElementById('step-overlay');
    if (!overlay) return;
    const idx = FoldEngine.activeStepIndex(steps, globalT);
    if (idx >= 0 && idx < steps.length) {
      const s = steps[idx];
      const count = steps.length;
      const sliceW = 1 / count;
      const overlap = 0.15;
      const start = Math.max(0, idx * sliceW - overlap * 0.5);
      const end = Math.min(1, (idx + 1) * sliceW + overlap * 0.5);
      const progress = (globalT - start) / (end - start);
      if (progress > 0 && progress < 1) {
        overlay.textContent = 'Step ' + s.id + ': ' + s.label;
      } else {
        overlay.textContent = '';
      }
    } else {
      overlay.textContent = '';
    }
  }

  return {
    setSteps, getSteps, getProgress, setProgress, setSpeed,
    play, pause, togglePlay, isPlaying, next, prev, jumpTo, reset,
    renderStepList, updateStepList, updateOverlay,
    set onUpdate(fn) { onUpdate = fn; },
    get onUpdate() { return onUpdate; }
  };
})();
