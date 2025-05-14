"use client"

import { useEffect, useState } from "react"

export default function OutlineLoadingIndicator() {
  // Create separate rotation states for each layer
  const [rotations, setRotations] = useState([0, 0, 0, 0])

  useEffect(() => {
    // Different speeds for each layer
    const speeds = [1, 0.8, 0.6, 0.4]

    const interval = setInterval(() => {
      setRotations((prev) => prev.map((rotation, index) => (rotation + speeds[index]) % 360))
    }, 10)

    return () => clearInterval(interval)
  }, [])

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
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* SVG container */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Glassy filter definition */}
        <defs>
          <filter id="glass-filter-outline" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      0 0 0 13 -7"
              result="glass"
            />
            <feBlend in="SourceGraphic" in2="glass" mode="normal" />
          </filter>
        </defs>
        
        {/* Background circle (lightest shade) */}
        <circle cx="50" cy="50" r="48" fill="transparent" stroke="#f3f4f6" strokeWidth="6" strokeLinecap="round" />

        {/* Multiple blue layers with different radii and rotation speeds */}
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
              filter="url(#glass-filter-outline)"
            />
          </g>
        ))}

        {/* Center transparent circle */}
        <circle cx="50" cy="50" r="28" fill="white" />
      </svg>
    </div>
  )
}
