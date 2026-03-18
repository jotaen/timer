import React, { useEffect, useRef } from "react"
import css from "./style.module.css"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BlobDef {
  color: string // single CSS color, we build the radial gradient ourselves
  radius: number // as fraction of vmin (0–1), e.g. 0.55 = 55vmin
}

interface Waypoint {
  x: number // 0–1 fraction of canvas width
  y: number // 0–1 fraction of canvas height
  scale: number
}

interface BlobState {
  def: BlobDef
  waypoints: Waypoint[]
  duration: number // ms for one full alternate cycle
  offset: number // ms, initial phase offset
}

// ---------------------------------------------------------------------------
// Blob definitions — same palette as before
// ---------------------------------------------------------------------------

const BLOBS: BlobDef[] = [
  // Large slow anchors
  { color: "rgba(60,  20, 120, 0.40)", radius: 0.55 },
  { color: "rgba(10,  50,  90, 0.40)", radius: 0.5 },
  { color: "rgba(90,  15,  50, 0.40)", radius: 0.48 },
  { color: "rgba(12,  55,  52, 0.40)", radius: 0.52 },
  // Mid-size roamers
  { color: "rgba(5,   55,  40, 0.35)", radius: 0.35 },
  { color: "rgba(55,  15,  50, 0.35)", radius: 0.34 },
  { color: "rgba(20,  30,  80, 0.35)", radius: 0.38 },
  { color: "rgba(70,  10,  30, 0.35)", radius: 0.32 },
  { color: "rgba(10,  60,  70, 0.35)", radius: 0.36 },
  // Small accents
  { color: "rgba(180, 150, 50,  0.25)", radius: 0.21 },
  { color: "rgba(60,  170, 185, 0.25)", radius: 0.23 },
  { color: "rgba(160, 80,  180, 0.25)", radius: 0.19 },
  { color: "rgba(50,  140, 100, 0.25)", radius: 0.2 },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max))
}

/**
 * Grid-based spread so blobs start evenly distributed,
 * with a small jitter so it doesn't look rigid.
 */
function spreadPositions(count: number): Array<{ x: number; y: number }> {
  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  const jitter = 0.3
  const xMin = 0.05,
    xMax = 0.85
  const yMin = 0.05,
    yMax = 0.85
  const cellW = (xMax - xMin) / cols
  const cellH = (yMax - yMin) / rows

  const cells = Array.from({ length: cols * rows }, (_, i) => i)
    .sort(() => Math.random() - 0.5)
    .slice(0, count)

  return cells.map((cell) => {
    const col = cell % cols
    const row = Math.floor(cell / cols)
    return {
      x: xMin + cellW * (col + 0.5) + rand(-cellW * jitter, cellW * jitter),
      y: yMin + cellH * (row + 0.5) + rand(-cellH * jitter, cellH * jitter),
    }
  })
}

function generateWaypoints(start: { x: number; y: number }): Waypoint[] {
  const count = randInt(3, 5)
  const pts: Waypoint[] = [{ x: start.x, y: start.y, scale: 1 }]
  for (let i = 0; i < count; i++) {
    pts.push({
      x: Math.max(0, Math.min(1, start.x + rand(-0.25, 0.25))),
      y: Math.max(0, Math.min(1, start.y + rand(-0.2, 0.2))),
      scale: rand(0.88, 1.2),
    })
  }
  return pts
}

function initBlobs(): BlobState[] {
  const positions = spreadPositions(BLOBS.length)
  return BLOBS.map((def, i) => ({
    def,
    waypoints: generateWaypoints(positions[i]),
    duration: rand(20000, 50000),
    offset: rand(0, 50000),
  }))
}

// ---------------------------------------------------------------------------
// Easing
// ---------------------------------------------------------------------------

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

/**
 * Ping-pong t in [0,1] → alternates forward/backward through waypoints.
 * Returns interpolated {x, y, scale} for the current moment in time.
 */
function interpolateWaypoints(
  waypoints: Waypoint[],
  progress: number, // 0–1, ping-pong progress
): Waypoint {
  const segments = waypoints.length - 1
  const scaled = progress * segments
  const idx = Math.min(Math.floor(scaled), segments - 1)
  const t = easeInOut(scaled - idx)
  const a = waypoints[idx]
  const b = waypoints[idx + 1]
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    scale: a.scale + (b.scale - a.scale) * t,
  }
}

// ---------------------------------------------------------------------------
// Canvas rendering
// ---------------------------------------------------------------------------

/**
 * We render at half the device pixel ratio — the content is so blurry
 * that the quality difference is invisible, but it halves the texture size
 * (and therefore roughly quarters the blur pass cost on Retina displays).
 */
const RENDER_SCALE = 0.3
const TARGET_FPS = 15
const FRAME_MS = 1000 / TARGET_FPS

function drawFrame(
  ctx: CanvasRenderingContext2D,
  blobs: BlobState[],
  w: number,
  h: number,
  now: number,
): void {
  const vmin = Math.min(w, h)

  ctx.clearRect(0, 0, w, h)

  // Dark base
  ctx.fillStyle = "#060612"
  ctx.fillRect(0, 0, w, h)

  for (const blob of blobs) {
    // Ping-pong: triangle wave from offset + now
    const elapsed = (now + blob.offset) % (blob.duration * 2)
    const forward = elapsed < blob.duration
    const t = forward
      ? elapsed / blob.duration
      : 1 - (elapsed - blob.duration) / blob.duration
    const wp = interpolateWaypoints(blob.waypoints, t)

    const cx = wp.x * w
    const cy = wp.y * h
    const radius = blob.def.radius * vmin * wp.scale

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    gradient.addColorStop(0, blob.def.color)
    gradient.addColorStop(0.6, blob.def.color.replace(/[\d.]+\)$/, "0.15)"))
    gradient.addColorStop(1, "transparent")

    ctx.globalCompositeOperation = "screen"
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const blobs = initBlobs()
    let rafId = 0
    let lastFrame = 0
    let pendingW = Math.floor(window.innerWidth * RENDER_SCALE)
    let pendingH = Math.floor(window.innerHeight * RENDER_SCALE)

    // Don't touch canvas.width/height directly on resize — that clears the
    // canvas instantly and causes a flicker. Instead just store the desired
    // size and apply it at the start of the next draw, right before we paint.
    function resize() {
      pendingW = Math.floor(window.innerWidth * RENDER_SCALE)
      pendingH = Math.floor(window.innerHeight * RENDER_SCALE)
    }

    function loop(now: number) {
      rafId = requestAnimationFrame(loop)
      if (now - lastFrame < FRAME_MS) return
      lastFrame = now

      // Apply any pending resize immediately before drawing so there is
      // never a frame where the canvas is blank.
      if (canvas!.width !== pendingW || canvas!.height !== pendingH) {
        canvas!.width = pendingW
        canvas!.height = pendingH
      }

      drawFrame(ctx!, blobs, canvas!.width, canvas!.height, now)
    }

    resize()
    window.addEventListener("resize", resize)
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className={css.canvas} />
}
