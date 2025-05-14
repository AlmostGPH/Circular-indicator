"use client"

import { useEffect, useState } from "react"

export default function LoadingIndicator() {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360)
    }, 10)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Background doughnut (gray) */}
      <div className="absolute w-full h-full rounded-full flex items-center justify-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full" />
        <div className="absolute w-12 h-12 bg-white rounded-full" />
      </div>

      {/* Active doughnut (blue) - rotating */}
      <div
        className="absolute w-full h-full rounded-full flex items-center justify-center"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="relative w-full h-full">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <clipPath id="cut-off-bottom">
                <path d="M 50 0 a 50 50 0 0 1 0 100 a 50 50 0 0 1 0 -100 z" />
              </clipPath>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray="75 251"
              clipPath="url(#cut-off-bottom)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
