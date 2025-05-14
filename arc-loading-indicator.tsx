"use client"

import { useEffect, useState } from "react"

export default function ArcLoadingIndicator() {
  // 创建旋转状态
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    // 设置旋转速度
    const speed = 1

    const interval = setInterval(() => {
      setRotation((prev) => (prev + speed) % 360)
    }, 10)

    return () => clearInterval(interval)
  }, [])

  // 蓝色阴影
  const blueShade = "#3b82f6" // blue-500
  
  // 中心点坐标
  const centerX = 50
  const centerY = 50

  // 半径和线宽
  const radius = 42
  const arcWidth = 14 // 增加厚度

  // 扇形角度和圆角
  const arcAngle = 120 // 扇形占圆周的角度
  const cornerRadius = 5 // 圆角半径 - 减小圆角

  // 计算内径和外径
  const outerRadius = radius + arcWidth / 2
  const innerRadius = radius - arcWidth / 2

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id="glass-outline-arc" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="white" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* 背景圆 */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="#f3f4f6" strokeWidth="6" strokeLinecap="round" />

        {/* 旋转的扇形圆弧 */}
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center",
          }}
        >
          {/* 使用扇形路径 */}
          <path
            d={createRoundedArc(
              centerX,
              centerY,
              innerRadius,
              outerRadius,
              0,
              arcAngle,
              cornerRadius
            )}
            fill={blueShade}
            fillOpacity="0.7"
            filter="url(#glass-outline-arc)"
          />
        </g>

        {/* 中心透明圆 */}
        <circle cx="50" cy="50" r="28" fill="white" />
      </svg>
    </div>
  )
}

// 创建带圆角的扇形路径
function createRoundedArc(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  arcAngle: number,
  cornerRadius: number
): string {
  const startRad = (startAngle * Math.PI) / 180
  const endRad = ((startAngle + arcAngle) * Math.PI) / 180

  const outerStartX = cx + outerRadius * Math.cos(startRad)
  const outerStartY = cy + outerRadius * Math.sin(startRad)
  const outerEndX = cx + outerRadius * Math.cos(endRad)
  const outerEndY = cy + outerRadius * Math.sin(endRad)

  const innerStartX = cx + innerRadius * Math.cos(startRad)
  const innerStartY = cy + innerRadius * Math.sin(startRad)
  const innerEndX = cx + innerRadius * Math.cos(endRad)
  const innerEndY = cy + innerRadius * Math.sin(endRad)

  const angleOffset = 0.1

  const outerEndControlX = cx + outerRadius * Math.cos(endRad - angleOffset)
  const outerEndControlY = cy + outerRadius * Math.sin(endRad - angleOffset)
  const outerEndCornerX = cx + (outerRadius - cornerRadius) * Math.cos(endRad)
  const outerEndCornerY = cy + (outerRadius - cornerRadius) * Math.sin(endRad)

  const outerStartControlX = cx + outerRadius * Math.cos(startRad + angleOffset)
  const outerStartControlY = cy + outerRadius * Math.sin(startRad + angleOffset)
  const outerStartCornerX = cx + (outerRadius - cornerRadius) * Math.cos(startRad)
  const outerStartCornerY = cy + (outerRadius - cornerRadius) * Math.sin(startRad)

  
  const innerEndControlX = cx + innerRadius * Math.cos(endRad - angleOffset)
  const innerEndControlY = cy + innerRadius * Math.sin(endRad - angleOffset)
  const innerEndCornerX = cx + (innerRadius + cornerRadius) * Math.cos(endRad)
  const innerEndCornerY = cy + (innerRadius + cornerRadius) * Math.sin(endRad)

  const innerStartControlX = cx + innerRadius * Math.cos(startRad + angleOffset)
  const innerStartControlY = cy + innerRadius * Math.sin(startRad + angleOffset)
  const innerStartCornerX = cx + (innerRadius + cornerRadius) * Math.cos(startRad)
  const innerStartCornerY = cy + (innerRadius + cornerRadius) * Math.sin(startRad)

  const largeArcFlag = arcAngle > 180 ? 1 : 0

  return `
    M ${outerStartCornerX} ${outerStartCornerY}
    Q ${outerStartX} ${outerStartY} ${outerStartControlX} ${outerStartControlY}
    A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndControlX} ${outerEndControlY}
    Q ${outerEndX} ${outerEndY} ${outerEndCornerX} ${outerEndCornerY}
    L ${innerEndCornerX} ${innerEndCornerY}
    Q ${innerEndX} ${innerEndY} ${innerEndControlX} ${innerEndControlY}
    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartControlX} ${innerStartControlY}
    Q ${innerStartX} ${innerStartY} ${innerStartCornerX} ${innerStartCornerY}
    Z
  `
}

