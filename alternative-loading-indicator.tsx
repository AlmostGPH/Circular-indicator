"use client"

import { useEffect, useRef } from "react"

export default function AlternativeLoadingIndicator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // For high-resolution displays
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)

    let animationId: number
    let rotation = 0

    const drawDoughnut = (
      centerX: number,
      centerY: number,
      outerRadius: number,
      innerRadius: number,
      startAngle: number,
      endAngle: number,
      color: string,
    ) => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle)
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

      const centerX = canvas.width / (2 * dpr)
      const centerY = canvas.height / (2 * dpr)
      const outerRadius = Math.min(centerX, centerY) * 0.8
      const innerRadius = outerRadius * 0.6

      // Draw background doughnut (gray)
      drawDoughnut(centerX, centerY, outerRadius, innerRadius, 0, Math.PI * 2, "#e5e7eb")

      // Draw active doughnut segment (blue)
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)
      ctx.translate(-centerX, -centerY)

      drawDoughnut(centerX, centerY, outerRadius, innerRadius, 0, Math.PI * 0.6, "#3b82f6")

      ctx.restore()

      rotation += 0.03
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="w-24 h-24 flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
    </div>
  )
}
