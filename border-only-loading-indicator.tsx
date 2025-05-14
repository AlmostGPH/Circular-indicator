"use client"

import { useEffect, useState } from "react"

export default function BorderOnlyLoadingIndicator() {
  const [rotations, setRotations] = useState([0, 0, 0, 0])

  useEffect(() => {
    const speeds = [1, 0.8, 0.6, 0.4]
    const interval = setInterval(() => {
      setRotations((prev) =>
        prev.map((rotation, index) => (rotation + speeds[index]) % 360)
      )
    }, 10)
    return () => clearInterval(interval)
  }, [])

  const blueShades = ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb"]
  const radii = [46, 42, 38, 34]
  const strokeWidths = [8, 9, 10, 11]
  const dashArrays = ["120 240", "100 260", "80 280", "60 300"]

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id="glass-outline" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="white" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Rotating glassy stroke rings */}
        {blueShades.map((color, index) => (
          <g
            key={index}
            style={{
              transform: `rotate(${rotations[index]}deg)`,
              transformOrigin: "center",
            }}
          >
            <circle
              cx="50"
              cy="50"
              r={radii[index]}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidths[index]}
              strokeLinecap="round"
              strokeDasharray={dashArrays[index]}
              strokeOpacity="0.7"
              filter="url(#glass-outline)"
            />
          </g>
        ))}

        {/* Center fully transparent circle (glass hole effect) */}
        <circle cx="50" cy="50" r="28" fill="white" />
      </svg>
    </div>
  )
}
