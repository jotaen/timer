import React, { useMemo } from "react"
// @ts-ignore
import css from "./style.module.css"

interface BlobDef {
  color1: string
  color2: string
  sizeVmin: number
}

interface BlobConfig extends BlobDef {
  top: number
  left: number
  duration: number
  delay: number
  keyframeName: string
  keyframeCSS: string
}

const BLOBS: BlobDef[] = [
  // Large slow anchors
  { color1: "#5b21b6", color2: "#7c3aed44", sizeVmin: 110 },
  { color1: "#0c4a6e", color2: "#0ea5e944", sizeVmin: 100 },
  { color1: "#831843", color2: "#ec489944", sizeVmin: 95 },
  { color1: "#134e4a", color2: "#0d948844", sizeVmin: 105 },
  // Mid-size roamers
  { color1: "#064e3b", color2: "#10b98144", sizeVmin: 70 },
  { color1: "#7c2d12", color2: "#f9731644", sizeVmin: 65 },
  { color1: "#1e1b4b", color2: "#818cf844", sizeVmin: 60 },
  { color1: "#4a1942", color2: "#d946ef44", sizeVmin: 68 },
  { color1: "#1e3a5f", color2: "#3b82f644", sizeVmin: 62 },
  // Small fast accents
  { color1: "#fcd34d88", color2: "transparent", sizeVmin: 42 },
  { color1: "#f0abfc88", color2: "transparent", sizeVmin: 38 },
  { color1: "#67e8f988", color2: "transparent", sizeVmin: 45 },
  { color1: "#a7f3d088", color2: "transparent", sizeVmin: 35 },
  { color1: "#fb923c88", color2: "transparent", sizeVmin: 38 },
  { color1: "#a78bfa88", color2: "transparent", sizeVmin: 40 },
  { color1: "#34d39988", color2: "transparent", sizeVmin: 32 },
]

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max))
}

function spreadPositions(count: number): Array<{ top: number; left: number }> {
  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  const jitter = 0.35

  const topMin = 5,
    topMax = 85
  const leftMin = 5,
    leftMax = 85

  const cellW = (leftMax - leftMin) / cols
  const cellH = (topMax - topMin) / rows

  const cells = Array.from({ length: cols * rows }, (_, i) => i)
    .sort(() => Math.random() - 0.5)
    .slice(0, count)

  return cells.map((cell) => {
    const col = cell % cols
    const row = Math.floor(cell / cols)
    const centerLeft = leftMin + cellW * (col + 0.5)
    const centerTop = topMin + cellH * (row + 0.5)
    return {
      left: centerLeft + rand(-cellW * jitter, cellW * jitter),
      top: centerTop + rand(-cellH * jitter, cellH * jitter),
    }
  })
}

function makeKeyframes(id: number): string {
  const steps = randInt(3, 5)
  const frames: string[] = ["0% { transform: translate(0vw, 0vh) scale(1); }"]

  for (let i = 1; i < steps; i++) {
    const pct = Math.round((i / steps) * 100)
    const tx = rand(-20, 20).toFixed(1)
    const ty = rand(-15, 15).toFixed(1)
    const sc = rand(0.88, 1.2).toFixed(2)
    frames.push(
      `${pct}% { transform: translate(${tx}vw, ${ty}vh) scale(${sc}); }`,
    )
  }

  const tx = rand(-20, 20).toFixed(1)
  const ty = rand(-15, 15).toFixed(1)
  const sc = rand(0.88, 1.2).toFixed(2)
  frames.push(`100% { transform: translate(${tx}vw, ${ty}vh) scale(${sc}); }`)

  return `@keyframes blob-${id} { ${frames.join(" ")} }`
}

function generateBlobs(): BlobConfig[] {
  const positions = spreadPositions(BLOBS.length)

  return BLOBS.map((def, i) => ({
    ...def,
    top: positions[i].top,
    left: positions[i].left,
    duration: parseFloat(rand(8, 28).toFixed(1)),
    delay: parseFloat(rand(-20, 0).toFixed(1)),
    keyframeName: `blob-${i}`,
    keyframeCSS: makeKeyframes(i),
  }))
}

export function Background() {
  const blobs = useMemo<BlobConfig[]>(generateBlobs, [])
  return (
    <>
      <style>{blobs.map((b) => b.keyframeCSS).join("\n")}</style>
      <div className={css.stage}>
        {blobs.map((b, i) => (
          <div
            key={i}
            className={css.blob}
            style={{
              width: `${b.sizeVmin}vmin`,
              height: `${b.sizeVmin}vmin`,
              top: `${b.top}%`,
              left: `${b.left}%`,
              background: `radial-gradient(circle, ${b.color1}, ${b.color2} 60%, transparent 80%)`,
              animation: `${b.keyframeName} ${b.duration}s ease-in-out infinite alternate`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  )
}
