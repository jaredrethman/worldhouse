import React, { useEffect, useRef } from "react";

type Options = {
  tileSize?: number;
  gap?: number;
  radius?: number;

  // Timing (ms)
  riseMs?: number;
  holdMs?: number;
  fadeMs?: number;

  bgColor?: string;

  tileColor?: string;
  tileAlpha?: number;

  illuminateColor?: string;
  illuminateMaxAlpha?: number;

  gridLineAlpha?: number;
  gridLineWidth?: number;

  variation?: number; // 0..1

  // ✅ Ripple
  rippleCore?: number; // 0..1 (100% region)
  rippleShoulder?: number; // 0..1 (outside ring region)
  rippleFadeDistance?: number; // px (e.g. 200)
  rippleSpeed?: number; // px/sec
  rippleCoreWidth?: number; // px (full width of 100% band)
  rippleShoulderWidth?: number; // px (full width of 50% band)
  rippleDurationMs?: number; // ms

  rippleStepTiles?: number;

  rippleVariation?: number; // 0..1
  rippleHotChance?: number; // 0..1
  rippleHotBoost?: number; // e.g. 1.35
  rippleWobbleSpeed?: number; // e.g. 1.6

  rippleFadeSteps?: number;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function hash01(n: number) {
  let x = n | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return ((x >>> 0) % 1_000_000) / 1_000_000;
}

type Ripple = { x: number; y: number; startMs: number };

export function BackgroundAnimation(props: Options) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const settings = {
      tileSize: props.tileSize ?? 34,
      gap: props.gap ?? 10,
      radius: props.radius ?? 60,

      riseMs: props.riseMs ?? 90,
      holdMs: props.holdMs ?? 70,
      fadeMs: props.fadeMs ?? 260,

      bgColor: props.bgColor ?? "#050608",

      tileColor: props.tileColor ?? "#0c1016",
      tileAlpha: props.tileAlpha ?? 0.9,

      illuminateColor: props.illuminateColor ?? "#49f2b2",
      illuminateMaxAlpha: props.illuminateMaxAlpha ?? 0.9,

      gridLineAlpha: props.gridLineAlpha ?? 0.08,
      gridLineWidth: props.gridLineWidth ?? 1,

      variation: props.variation ?? 0.35,

      // ✅ Ripple defaults (tweak these)
      rippleSpeed: props.rippleSpeed ?? 650,
      rippleDurationMs: props.rippleDurationMs ?? 1600, // ✅ further
      rippleFadeDistance: props.rippleFadeDistance ?? 520, // ✅ further visibility
      rippleCore: props.rippleCore ?? 1,
      rippleShoulder: props.rippleShoulder ?? 0.5,
      rippleFadeSteps: props.rippleFadeSteps ?? 6, // 0 = smooth fade, 4–8 = tasty pixel fade
      rippleCoreWidth: props.rippleCoreWidth ?? 12, // px (1 tile for you)
      rippleShoulderWidth: props.rippleShoulderWidth ?? 36,
      rippleStepTiles: props.rippleStepTiles ?? 2, // ✅ more gap between ring positions
      rippleVariation: props.rippleVariation ?? 0.55, // ✅ similar feel to trail
      rippleHotChance: props.rippleHotChance ?? 0.22, // ✅ some tiles go "full bright"
      rippleHotBoost: props.rippleHotBoost ?? 1.35, // ✅ punch
      rippleWobbleSpeed: props.rippleWobbleSpeed ?? 1.6, // ✅ subtle animation
    };

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cols = 0;
    let rows = 0;

    let heat = new Float32Array(0);
    let target = new Float32Array(0);
    let hold = new Float32Array(0);

    const step = () => settings.tileSize + settings.gap;

    let mx = -9999;
    let my = -9999;
    let movedThisFrame = false;

    // ✅ Active ripples
    const ripples: Ripple[] = [];

    const ensureGrid = () => {
      const s = step();
      const nextCols = Math.ceil(window.innerWidth / s) + 1;
      const nextRows = Math.ceil(window.innerHeight / s) + 1;

      if (nextCols !== cols || nextRows !== rows) {
        cols = nextCols;
        rows = nextRows;
        heat = new Float32Array(cols * rows);
        target = new Float32Array(cols * rows);
        hold = new Float32Array(cols * rows);
      }
    };

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ensureGrid();
    };

    const onPointerMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      movedThisFrame = true;
    };

    const onPointerDown = (e: PointerEvent) => {
      // click/tap creates a ripple
      ripples.push({ x: e.clientX, y: e.clientY, startMs: performance.now() });
      // optional: cap number of ripples (avoid spam)
      if (ripples.length > 6) ripples.shift();
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    resize();

    const depositImpulse = (timeMs: number) => {
      if (!movedThisFrame) return;
      movedThisFrame = false;

      const s = step();
      const r = settings.radius;
      const r2 = r * r;

      const minX = Math.max(0, Math.floor((mx - r) / s));
      const maxX = Math.min(cols - 1, Math.ceil((mx + r) / s));
      const minY = Math.max(0, Math.floor((my - r) / s));
      const maxY = Math.min(rows - 1, Math.ceil((my + r) / s));

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const tx = x * s;
          const ty = y * s;
          const cx = tx + settings.tileSize / 2;
          const cy = ty + settings.tileSize / 2;

          const dx = mx - cx;
          const dy = my - cy;
          const d2 = dx * dx + dy * dy;
          if (d2 > r2) continue;

          const d = Math.sqrt(d2);
          const t = 1 - d / r;
          const eased = t * t;

          const idx = y * cols + x;

          const base = hash01(idx * 73856093) * 2 - 1;
          const wobble = Math.sin(
            (timeMs / 1000) * 2 + hash01(idx * 19349663) * Math.PI * 2
          );
          const v = 1 + settings.variation * (0.6 * base + 0.4 * wobble);

          const amount = clamp01(eased * v);

          target[idx] = Math.max(target[idx], amount);
          hold[idx] = settings.holdMs * (0.85 + 0.3 * hash01(idx * 83492791));
        }
      }
    };

    const quantize = (v: number, q: number) => Math.round(v / q) * q;

    const applyRipples = (timeMs: number) => {
      if (ripples.length === 0) return;

      const s = step();

      const coreAmp = settings.rippleCore ?? 1;
      const shoulderAmp = settings.rippleShoulder ?? 0.5;

      const coreHalf = Math.max(1, (settings.rippleCoreWidth ?? settings.tileSize) / 2);
      const shoulderHalf = Math.max(
        coreHalf + 1,
        (settings.rippleShoulderWidth ?? s * 3) / 2
      );

      const fadeDist = Math.max(1, settings.rippleFadeDistance ?? 520);
      const fadeSteps = Math.max(1, settings.rippleFadeSteps ?? 6);

      // ✅ ring spacing: jump by N tiles
      const stepPx = s * Math.max(1, settings.rippleStepTiles ?? 1);

      // ✅ variation knobs
      const rv = clamp01(settings.rippleVariation ?? settings.variation ?? 0.35);
      const hotChance = clamp01(settings.rippleHotChance ?? 0.22);
      const hotBoost = Math.max(1, settings.rippleHotBoost ?? 1.35);
      const wobbleSpeed = settings.rippleWobbleSpeed ?? 1.6;

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        const ageMs = timeMs - rp.startMs;

        if (ageMs > settings.rippleDurationMs) {
          ripples.splice(i, 1);
          continue;
        }

        const ringR = quantize((ageMs / 1000) * settings.rippleSpeed, stepPx);

        const outer = ringR + shoulderHalf + stepPx;
        const minX = Math.max(0, Math.floor((rp.x - outer) / s));
        const maxX = Math.min(cols - 1, Math.ceil((rp.x + outer) / s));
        const minY = Math.max(0, Math.floor((rp.y - outer) / s));
        const maxY = Math.min(rows - 1, Math.ceil((rp.y + outer) / s));

        // Keep lifetime fade subtle so it stays graphic
        const life = 1 - ageMs / settings.rippleDurationMs;

        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            const cx = x * s + settings.tileSize / 2;
            const cy = y * s + settings.tileSize / 2;

            const dx = cx - rp.x;
            const dy = cy - rp.y;

            const dist = Math.hypot(dx, dy);
            const distQ = quantize(dist, s);

            const dr = Math.abs(distQ - ringR);
            if (dr > shoulderHalf) continue;

            let amp = dr <= coreHalf ? coreAmp : shoulderAmp;

            let fade = clamp01(1 - distQ / fadeDist);
            fade = Math.ceil(fade * fadeSteps) / fadeSteps;

            const idx = y * cols + x;

            const base = hash01(idx * 73856093) * 2 - 1; // -1..1
            const wobble = Math.sin(
              (timeMs / 1000) * wobbleSpeed +
                hash01(idx * 19349663) * Math.PI * 2
            );

            const v = 1 + rv * (0.6 * base + 0.4 * wobble); // around 1 +/- rv

            // ✅ "some tiles go full bright" (like trail peaks)
            const hot = hash01(idx * 97531) < hotChance;
            const hotMul = hot ? hotBoost : 1;

            const amount = clamp01(amp * fade * life * v * hotMul);

            // ✅ crisp: write only to heat/hold
            heat[idx] = Math.max(heat[idx], amount);
            hold[idx] = Math.max(hold[idx], settings.holdMs * 0.25);
          }
        }
      }
    };

    const drawGridLines = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = settings.gridLineAlpha;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = settings.gridLineWidth;

      const s = step();

      for (let x = 0; x <= cols; x++) {
        const px = x * s + 0.5;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, window.innerHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= rows; y++) {
        const py = y * s + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(window.innerWidth, py);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let last = 0;

    const draw = (t: number) => {
      const dt = last ? t - last : 16.67;
      last = t;

      ensureGrid();

      // Clear
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = settings.bgColor;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Grid always visible
      drawGridLines();

      // Mouse movement impulse
      depositImpulse(t);

      // ✅ Click ripples
      applyRipples(t);

      const rise = dt / Math.max(1, settings.riseMs);
      const fade = dt / Math.max(1, settings.fadeMs);
      const eps = 0.001;

      const s = step();

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = y * cols + x;
          const tx = x * s;
          const ty = y * s;

          // Base tile always visible
          ctx.globalAlpha = settings.tileAlpha;
          ctx.fillStyle = settings.tileColor;
          ctx.fillRect(tx, ty, settings.tileSize, settings.tileSize);

          // Update heat
          const tgt = target[idx];

          if (tgt > heat[idx]) {
            heat[idx] = heat[idx] + (tgt - heat[idx]) * clamp01(rise);
          } else {
            if (hold[idx] > 0) {
              hold[idx] = Math.max(0, hold[idx] - dt);
            } else {
              heat[idx] = Math.max(0, heat[idx] - heat[idx] * clamp01(fade));
              if (heat[idx] < eps) heat[idx] = 0;
            }
          }

          // Once reached, drop target so it can hold/fade
          if (heat[idx] >= tgt - 0.01) target[idx] = 0;

          const h = heat[idx];
          if (h > 0) {
            // Illuminate overlay
            ctx.globalAlpha = clamp01(h) * settings.illuminateMaxAlpha;
            ctx.fillStyle = settings.illuminateColor;
            ctx.fillRect(tx, ty, settings.tileSize, settings.tileSize);
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [
    props.tileSize,
    props.gap,
    props.radius,
    props.riseMs,
    props.holdMs,
    props.fadeMs,
    props.bgColor,
    props.tileColor,
    props.tileAlpha,
    props.illuminateColor,
    props.illuminateMaxAlpha,
    props.gridLineAlpha,
    props.gridLineWidth,
    props.variation,
    props.rippleSpeed,
    props.rippleCore,
    props.rippleShoulder,
    props.rippleFadeDistance,
    props.rippleCoreWidth,
    props.rippleShoulderWidth,
    props.rippleDurationMs,
  ]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
