"use client"

import { useEffect, useRef } from "react"

export default function BorderOnlyRAFIndicator() {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const rotationsRef = useRef<number[]>([0, 0, 0, 0])

  // Different shades of blue for the layers
  const blueShades = [
    "#93c5fd", // blue-300
    "#60a5fa", // blue-400
    "#3b82f6", // blue-500
    "#2563eb", // blue-600
  ]

  // Different radii for each layer
  const radii = [46, 42, 38, 34]

  // Different stroke widths for each layer
  const strokeWidths = [8, 9, 10, 11]

  // Different dash arrays for each layer
  const dashArrays = [
    "120 240", // First layer
    "100 260", // Second layer
    "80 280", // Third layer
    "60 300", // Fourth layer
  ]

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current

      // Different speeds for each layer
      const speeds = [0.05, 0.04, 0.03, 0.02]

      // Update rotations with different speeds for each layer
      rotationsRef.current = rotationsRef.current.map((rotation, index) => (rotation + deltaTime * speeds[index]) % 360)
    }

    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* SVG container */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id="glass-outline-raf" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="white" floodOpacity="0.5" />
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="#f3f4f6" strokeWidth="6" strokeLinecap="round" />

        {/* Multiple blue layers with different radii and rotation speeds */}
        {blueShades.map((color, index) => (
          <g
            key={index}
            style={{
              transform: `rotate(${rotationsRef.current[index]}deg)`,
              transformOrigin: "center",
            }}
          >            {/* Rotating glassy stroke rings */}
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
              filter="url(#glass-outline-raf)"
            />
          </g>
        ))}        {/* Center fully transparent circle (glass hole effect) */}
        <circle cx="50" cy="50" r="28" fill="white" />
      </svg>
    </div>
  )
}
