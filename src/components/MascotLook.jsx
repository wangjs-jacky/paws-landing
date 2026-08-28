import { useEffect, useRef, useState } from 'react';
import { easeFrame, pointerRatio, ratioToFrame } from './react-bits/mascotFrameModel';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const FINE_POINTER_QUERY = '(pointer: fine)';
const ATLAS_CELL_SIZE = 768;

function readPreferences() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return { reduced: false, fine: true };
  }
  return {
    reduced: window.matchMedia(REDUCED_MOTION_QUERY).matches,
    fine: window.matchMedia(FINE_POINTER_QUERY).matches
  };
}

export default function MascotLook({
  pointerSurfaceRef,
  atlasSrc,
  fallbackSrc,
  alt,
  frameCount = 24,
  columns = 6,
  rows = 4
}) {
  const centerFrame = Math.round((frameCount - 1) / 2);
  const mascotRef = useRef(null);
  const canvasRef = useRef(null);
  const atlasRef = useRef(null);
  const contextRef = useRef(null);
  const failAtlasRef = useRef(null);
  const currentFrameRef = useRef(centerFrame);
  const targetFrameRef = useRef(centerFrame);
  const visibleRef = useRef(false);
  const rafRef = useRef(null);
  const [frame, setFrame] = useState(centerFrame);
  const [atlasReady, setAtlasReady] = useState(false);
  const [atlasFailed, setAtlasFailed] = useState(false);
  const [preferences, setPreferences] = useState(readPreferences);

  const shouldLoadAtlas = preferences.fine && !preferences.reduced;
  const usesStaticFallback = !shouldLoadAtlas || atlasFailed;
  const interactive = atlasReady && !atlasFailed && !preferences.reduced && preferences.fine;
  const mode = preferences.reduced
    ? 'reduced'
    : !preferences.fine
      ? 'coarse'
      : interactive
        ? 'interactive'
        : 'fallback';

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const reducedQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const fineQuery = window.matchMedia(FINE_POINTER_QUERY);
    const updatePreferences = () => {
      setPreferences({ reduced: reducedQuery.matches, fine: fineQuery.matches });
    };

    reducedQuery.addEventListener?.('change', updatePreferences);
    fineQuery.addEventListener?.('change', updatePreferences);
    updatePreferences();

    return () => {
      reducedQuery.removeEventListener?.('change', updatePreferences);
      fineQuery.removeEventListener?.('change', updatePreferences);
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadAtlas) {
      atlasRef.current = null;
      contextRef.current = null;
      failAtlasRef.current = null;
      setAtlasReady(false);
      setAtlasFailed(false);
      return undefined;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      setAtlasFailed(true);
      return undefined;
    }

    let active = true;
    const atlas = new Image();
    atlasRef.current = atlas;
    contextRef.current = context;

    const fail = () => {
      if (!active) return;
      atlasRef.current = null;
      contextRef.current = null;
      setAtlasReady(false);
      setAtlasFailed(true);
    };
    failAtlasRef.current = fail;

    atlas.onload = async () => {
      try {
        await atlas.decode?.();
        if (!active) return;
        const frameWidth = atlas.naturalWidth / columns;
        const frameHeight = atlas.naturalHeight / rows;
        if (frameWidth !== ATLAS_CELL_SIZE || frameHeight !== ATLAS_CELL_SIZE) {
          fail();
          return;
        }
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        const sourceX = (centerFrame % columns) * frameWidth;
        const sourceY = Math.floor(centerFrame / columns) * frameHeight;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
          atlas,
          sourceX,
          sourceY,
          frameWidth,
          frameHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
        setAtlasReady(true);
      } catch {
        fail();
      }
    };
    atlas.onerror = fail;
    atlas.src = atlasSrc;

    return () => {
      active = false;
      atlas.onload = null;
      atlas.onerror = null;
      atlasRef.current = null;
      contextRef.current = null;
      failAtlasRef.current = null;
    };
  }, [atlasSrc, centerFrame, columns, rows, shouldLoadAtlas]);

  useEffect(() => {
    const surface = pointerSurfaceRef.current;
    if (!surface) return undefined;

    const cancelFrame = () => {
      if (rafRef.current === null) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };

    const resetTranslation = () => {
      surface.style.setProperty('--mascot-y', '0px');
    };

    const drawFrame = frameValue => {
      const atlas = atlasRef.current;
      const context = contextRef.current;
      const canvas = canvasRef.current;
      if (!atlas || !context || !canvas) return;
      const frameWidth = atlas.naturalWidth / columns;
      const frameHeight = atlas.naturalHeight / rows;
      const sourceX = (frameValue % columns) * frameWidth;
      const sourceY = Math.floor(frameValue / columns) * frameHeight;
      try {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
          atlas,
          sourceX,
          sourceY,
          frameWidth,
          frameHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
        return true;
      } catch {
        cancelFrame();
        failAtlasRef.current?.();
        return false;
      }
    };

    const animate = () => {
      rafRef.current = null;
      if (!visibleRef.current || !interactive) return;
      const next = easeFrame(currentFrameRef.current, targetFrameRef.current);
      currentFrameRef.current = next;
      const nextDisplayFrame = Math.round(next);
      if (!drawFrame(nextDisplayFrame)) return;
      setFrame(nextDisplayFrame);
      if (next !== targetFrameRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const requestDraw = () => {
      if (rafRef.current !== null || !visibleRef.current || !interactive) return;
      rafRef.current = requestAnimationFrame(animate);
    };

    const handlePointerMove = event => {
      if (!visibleRef.current || !interactive) return;
      const rect = surface.getBoundingClientRect();
      targetFrameRef.current = ratioToFrame(pointerRatio(event.clientX, rect), frameCount);
      const rawTranslation = rect.height
        ? ((event.clientY - rect.top) / rect.height - 0.5) * 8
        : 0;
      const translation = Number.isFinite(rawTranslation)
        ? Math.max(-4, Math.min(4, rawTranslation))
        : 0;
      surface.style.setProperty('--mascot-y', `${Number(translation.toFixed(2))}px`);
      requestDraw();
    };

    const handlePointerLeave = () => {
      if (!visibleRef.current || !interactive) return;
      targetFrameRef.current = centerFrame;
      resetTranslation();
      requestDraw();
    };

    surface.addEventListener('pointermove', handlePointerMove);
    surface.addEventListener('pointerleave', handlePointerLeave);

    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          resetTranslation();
          cancelFrame();
        }
      });
      observer.observe(surface);
    } else {
      visibleRef.current = true;
    }

    if (!interactive) cancelFrame();

    return () => {
      surface.removeEventListener('pointermove', handlePointerMove);
      surface.removeEventListener('pointerleave', handlePointerLeave);
      observer?.disconnect();
      resetTranslation();
      cancelFrame();
    };
  }, [centerFrame, columns, frameCount, interactive, pointerSurfaceRef, rows]);

  return (
    <div
      ref={mascotRef}
      className="mascot-look"
      data-testid="mascot-look"
      data-frame={frame}
      data-ready={interactive ? 'true' : 'false'}
      data-mode={mode}
      role={usesStaticFallback ? undefined : 'img'}
      aria-label={usesStaticFallback ? undefined : alt}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      {usesStaticFallback ? <img src={fallbackSrc} alt={alt} /> : null}
    </div>
  );
}
