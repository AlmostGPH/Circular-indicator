"use client"

import { useEffect, useRef } from "react"

interface LoadingIndicatorProps {
  size?: number
  thickness?: number
  colors?: string[]
  speeds?: number[]
  backgroundColor?: string
  darkMode?: boolean
}

export default function CustomizableLoadingIndicator({
  size = 64,
  thickness = 8,
  colors = ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb"],
  speeds = [0.05, 0.04, 0.03, 0.02],
  backgroundColor = "#f3f4f6",
  darkMode = false,
}: LoadingIndicatorProps) {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const rotationsRef = useRef<number[]>(colors.map(() => 0))

  // Calculate different radii for each layer
  const maxRadius = 48
  const minRadius = 34
  const radiusStep = (maxRadius - minRadius) / (colors.length - 1)
  const radii = colors.map((_, index) => maxRadius - radiusStep * index)

  // Calculate different stroke widths for each layer
  const minStrokeWidth = thickness
  const maxStrokeWidth = thickness + 3
  const strokeStep = (maxStrokeWidth - minStrokeWidth) / (colors.length - 1)
  const strokeWidths = colors.map((_, index) => minStrokeWidth + strokeStep * index)

  // Calculate different dash arrays for each layer
  const dashArrays = colors.map((_, index) => {
    const dashLength = 120 - index * 20
    const gapLength = 240 + index * 20
    return `${dashLength} ${gapLength}`
  })

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current

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
  }, [speeds])

  return (
    <div
      className={`relative flex items-center justify-center ${darkMode ? "bg-gray-900 p-4 rounded-xl" : ""}`}
      style={{ width: size, height: size }}
    >
      {/* SVG container */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="transparent"
          stroke={darkMode ? "#374151" : backgroundColor}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Multiple colored layers with different radii and rotation speeds */}
        {colors.map((color, index) => (
          <g
            key={index}
            style={{
              transform: `rotate(${rotationsRef.current[index]}deg)`,
              transformOrigin: "center",
            }}
          >
            <circle
              cx="50"
              cy="50"
              r={radii[index]}
              fill="transparent"
              stroke={color}
              strokeWidth={strokeWidths[index]}
              strokeLinecap="round"
              strokeDasharray={dashArrays[index]}
            />
          </g>
        ))}

        {/* Center transparent circle */}
        <circle cx="50" cy="50" r="28" fill={darkMode ? "#1f2937" : "white"} />
      </svg>
    </div>
  )
}
