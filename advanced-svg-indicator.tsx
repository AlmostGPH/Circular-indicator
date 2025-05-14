"use client"

import { useEffect, useRef } from "react"

export default function AdvancedSVGIndicator() {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const rotationRef = useRef<number[]>([0, 15, 30, 45])

  // Different shades of blue for the layers
  const blueShades = [
    "#60a5fa", // blue-400
    "#3b82f6", // blue-500
    "#2563eb", // blue-600
    "#1d4ed8", // blue-700
  ]

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current

      // Update rotations with different speeds for each layer
      rotationRef.current = rotationRef.current.map((rotation, index) => {
        const speed = 0.1 - index * 0.015 // Different speeds for each layer
        return (rotation + deltaTime * speed) % 360
      })
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
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* SVG container */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle (lightest shade) */}
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />

        {/* Multiple blue layers with different rotation values */}
        {blueShades.map((color, index) => (
          <g
            key={index}
            style={{
              transform: `rotate(${rotationRef.current[index]}deg)`,
              transformOrigin: "center",
            }}
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${80 - index * 10} ${252 + index * 10}`}
            />
          </g>
        ))}

        {/* Center transparent circle */}
        <circle cx="50" cy="50" r="32" fill="white" />
      </svg>
    </div>
  )
}
