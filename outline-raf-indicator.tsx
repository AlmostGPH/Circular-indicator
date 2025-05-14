"use client"

import { useEffect, useRef } from "react"

export default function OutlineRAFIndicator() {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const rotationsRef = useRef<number[]>([0, 0, 0, 0])

  const blueShades = ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb"]
  const radii = [46, 42, 38, 34]
  const strokeWidths = [8, 9, 10, 11]
  const dashArrays = ["120 240", "100 260", "80 280", "60 300"]

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current
      const speeds = [0.05, 0.04, 0.03, 0.02]
      rotationsRef.current = rotationsRef.current.map(
        (rotation, index) => (rotation + deltaTime * speeds[index]) % 360
      )
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
      <svg viewBox="0 0 100 100" className="w-full h-full">        {/* Glassy filter definition */}
        <defs>
          <filter id="glass-filter-raf" x="-50%" y="-50%" width="200%" height="200%">
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

        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="transparent"
          stroke="#f3f4f6"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Rotating glass layers */}
        {blueShades.map((color, index) => (
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
              strokeOpacity="0.7"
              filter="url(#glass-filter-raf)"
            />
          </g>
        ))}

        {/* Center transparent circle */}
        <circle cx="50" cy="50" r="28" fill="white" />
      </svg>
    </div>
  )
}
