// Adapted from React Bits DotField (MIT + Commons Clause License Condition v1.0):
// https://github.com/DavidHDev/react-bits/blob/main/src/components/landingnew/Hero/DotField.jsx

import { memo, useEffect, useRef } from 'react';
import { buildDotGrid, selectDotFieldMode } from './dotFieldModel';

const TWO_PI = Math.PI * 2;
const SETTLE_EPSILON = 0.05;
const EMBER = {
  spacingDesktop: 18,
  spacingMobile: 26,
  cursorRadius: 420,
  bulgeStrength: 82,
  dotRadius: 1.35,
  dark: ['rgba(255,163,26,.38)', 'rgba(255,205,128,.12)'],
  light: ['rgba(185,91,0,.28)', 'rgba(110,68,28,.10)']
};

function currentMode(width, reducedMotionQuery, coarsePointerQuery, connection) {
  return selectDotFieldMode({
    reducedMotion: reducedMotionQuery?.matches ?? false,
    coarsePointer: coarsePointerQuery?.matches ?? false,
    saveData: connection?.saveData === true,
    width
  });
}

function subscribeToChange(source, listener) {
  if (source?.addEventListener) {
    source.addEventListener('change', listener);
    return () => source.removeEventListener('change', listener);
  }
  if (source?.addListener) {
    source.addListener(listener);
    return () => source.removeListener(listener);
  }
  return () => {};
}

const DotField = memo(function DotField({ theme, className = '', onModeChange }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    let context;
    try {
      context = canvas.getContext('2d', { alpha: true });
    } catch {
      context = null;
    }
    if (!context) return undefined;

    root.dataset.canvas = 'ready';
    const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const coarsePointerQuery = window.matchMedia?.('(pointer: coarse)');
    const connection = navigator.connection;
    const pointer = { x: -9999, y: -9999, energy: 0 };
    let dots = [];
    let width = 0;
    let height = 0;
    let mode = 'static';
    let visible = true;
    let rafId = null;
    let resizeObserver;
    let intersectionObserver;
    let resizeTimer;
    let ambientTime = 0;
    let gradient;
    let trackingPointer = false;

    function enablePointerTracking() {
      if (trackingPointer) return;
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('blur', releasePointer);
      trackingPointer = true;
    }

    function disablePointerTracking() {
      if (!trackingPointer) return;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', releasePointer);
      trackingPointer = false;
    }

    function setMode(nextMode) {
      mode = nextMode;
      root.dataset.mode = nextMode;
      if (nextMode === 'interactive') enablePointerTracking();
      else disablePointerTracking();
      onModeChange?.(nextMode);
    }

    function setEngaged(engaged) {
      root.dataset.engaged = String(engaged);
    }

    function draw(now = 0) {
      context.clearRect(0, 0, width, height);
      if (!gradient) {
        const colors = EMBER[theme] ?? EMBER.dark;
        gradient = context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
      }
      context.fillStyle = gradient;
      context.beginPath();

      const radiusSquared = EMBER.cursorRadius ** 2;
      let displaced = false;
      if (mode === 'ambient') ambientTime = now * 0.00018;

      dots.forEach((dot, index) => {
        let targetX = dot.ax;
        let targetY = dot.ay;

        if (mode === 'interactive' && pointer.energy > 0.005) {
          const dx = pointer.x - dot.ax;
          const dy = pointer.y - dot.ay;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < radiusSquared) {
            const distance = Math.sqrt(distanceSquared) || 1;
            const falloff = 1 - distance / EMBER.cursorRadius;
            const push = falloff * falloff * EMBER.bulgeStrength * pointer.energy;
            targetX -= (dx / distance) * push;
            targetY -= (dy / distance) * push;
          }
        } else if (mode === 'ambient') {
          const phase = ambientTime + dot.ax * 0.006 + dot.ay * 0.003;
          targetX += Math.sin(phase) * 2.4;
          targetY += Math.cos(phase * 0.8) * 1.8;
        }

        dot.vx = (dot.vx + (targetX - dot.x) * 0.12) * 0.78;
        dot.vy = (dot.vy + (targetY - dot.y) * 0.12) * 0.78;
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (Math.abs(dot.x - dot.ax) > SETTLE_EPSILON || Math.abs(dot.y - dot.ay) > SETTLE_EPSILON) {
          displaced = true;
        }

        const shimmer = mode === 'ambient' && index % 17 === 0 ? 1.12 : 1;
        const radius = EMBER.dotRadius * shimmer;
        context.moveTo(dot.x + radius, dot.y);
        context.arc(dot.x, dot.y, radius, 0, TWO_PI);
      });

      context.fill();
      if (mode === 'interactive') {
        pointer.energy *= 0.9;
        const engaged = displaced || pointer.energy > 0.005;
        setEngaged(engaged);
        return engaged;
      }
      setEngaged(false);
      return mode === 'ambient';
    }

    function tick(now) {
      rafId = null;
      if (!visible) return;
      if (draw(now)) rafId = requestAnimationFrame(tick);
    }

    function wake() {
      if (!visible || mode === 'static' || rafId !== null) return;
      rafId = requestAnimationFrame(tick);
    }

    function stop() {
      if (rafId === null) return;
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    function rebuild() {
      const rect = root.getBoundingClientRect();
      width = Math.max(0, rect.width);
      height = Math.max(0, rect.height);
      if (!width || !height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      setMode(currentMode(width, reducedMotionQuery, coarsePointerQuery, connection));
      dots = buildDotGrid(width, height, mode === 'interactive' ? EMBER.spacingDesktop : EMBER.spacingMobile);
      gradient = null;
      pointer.energy = 0;
      setEngaged(false);
      stop();
      draw();
      if (mode === 'ambient') wake();
    }

    function queueRebuild() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rebuild, 80);
    }

    function handlePointerMove(event) {
      if (mode !== 'interactive') return;
      const rect = root.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      if (pointer.x < 0 || pointer.y < 0 || pointer.x > rect.width || pointer.y > rect.height) return;
      pointer.energy = 1;
      wake();
    }

    function releasePointer() {
      pointer.energy = 0;
      wake();
    }

    rebuild();
    const removeReducedMotionListener = subscribeToChange(reducedMotionQuery, rebuild);
    const removeCoarsePointerListener = subscribeToChange(coarsePointerQuery, rebuild);
    const removeConnectionListener = subscribeToChange(connection, rebuild);
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(queueRebuild);
      resizeObserver.observe(root);
    } else {
      window.addEventListener('resize', queueRebuild);
    }

    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          draw();
          wake();
        } else {
          stop();
        }
      });
      intersectionObserver.observe(root);
    }

    return () => {
      stop();
      clearTimeout(resizeTimer);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', queueRebuild);
      removeReducedMotionListener();
      removeCoarsePointerListener();
      removeConnectionListener();
      disablePointerTracking();
    };
  }, [onModeChange, theme]);

  return (
    <div
      ref={rootRef}
      className={`dot-field ${className}`.trim()}
      data-mode="static"
      data-engaged="false"
      aria-hidden="true"
    >
      <div className="dot-field-fallback" />
      <canvas ref={canvasRef} />
    </div>
  );
});

export default DotField;
