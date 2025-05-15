"use client"

import { useEffect, useState } from "react"

// 缓动函数 - 立方缓入缓出
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// 扇形配置接口
interface ArcSegment {
  angle: number;       // 扇形角度
  color: string;       // 扇形颜色
  gap?: number;        // 与下一个扇形的间隔角度
}

// 组件属性接口
interface ArcLoadingIndicatorProps {
  segments?: ArcSegment[];  // 扇形配置数组
  cornerRadius?: number;    // 圆角半径
  speed?: number;           // 旋转速度
  changeInterval?: number;  // 角度变化间隔，单位：毫秒
  maxAngleChange?: number;  // 最大角度变化量
}

export default function ArcLoadingIndicator({
  segments = [
    { angle: 110, color: "#3b82f6", gap: 10 }, // 蓝色
    { angle: 110, color: "#10b981", gap: 10 }, // 绿色
    { angle: 110, color: "#f97316", gap: 10 }, // 橙色
  ],  cornerRadius = 5,
  speed = 1,
  changeInterval = 1500, // 默认2秒变化一次
  maxAngleChange = 40    // 最大角度变化量，避免变化过于剧烈
}: ArcLoadingIndicatorProps) {
  // 添加一个空的服务端组件
  if (typeof window === 'undefined') {
    return <div className="relative w-64 h-64 flex items-center justify-center"></div>
  }
  // 创建旋转状态
  const [rotation, setRotation] = useState(0)
  // 创建扇形状态，用于管理动画
  const [currentSegments, setCurrentSegments] = useState<ArcSegment[]>(segments)
  // 创建目标扇形状态，用于平滑过渡
  const [targetSegments, setTargetSegments] = useState<ArcSegment[]>(segments)
  // 创建过渡进度状态
  const [transition, setTransition] = useState(1)

  // 扇形旋转动画
  useEffect(() => {
    // 设置旋转动画
    const interval = setInterval(() => {
      setRotation((prev) => (prev + speed) % 360)
    }, 10)

    return () => clearInterval(interval)
  }, [speed])    // 角度变化动画
  useEffect(() => {
    // 每隔指定时间改变角度
    const changeAngles = () => {
      // 随机选择一个保持不变的扇形索引
      const fixedIndex = Math.floor(Math.random() * segments.length);
      
      // 获取其他两个扇形的索引
      const otherIndices = Array.from({ length: segments.length }, (_, i) => i)
        .filter(i => i !== fixedIndex);
      
      // 确定哪个扇形角度小（将增加），哪个扇形角度大（将减少）
      const smallerAngleIndex = currentSegments[otherIndices[0]].angle <= currentSegments[otherIndices[1]].angle 
        ? otherIndices[0] 
        : otherIndices[1];
      
      const largerAngleIndex = currentSegments[otherIndices[0]].angle > currentSegments[otherIndices[1]].angle 
        ? otherIndices[0] 
        : otherIndices[1];
      
      // 小角度的扇形增加，大角度的扇形减少
      const increaseIndex = smallerAngleIndex;
      const decreaseIndex = largerAngleIndex;
        // 计算当前总角度（不包括间隔）
      const totalAngleWithoutGaps = currentSegments.reduce((sum, segment) => sum + segment.angle, 0)
      
      // 获取要改变的两个扇形的角度
      const decreaseSegment = currentSegments[decreaseIndex]
      const increaseSegment = currentSegments[increaseIndex]
      
      // 计算减少角度扇形的最大可减少量（保证不小于最小角度30度）
      const maxDecrease = Math.max(0, decreaseSegment.angle - 30)
      
      // 计算增加角度扇形的最大可增加量（保证总角度不会超过360减去间隔总和）
      const gapsSum = currentSegments.reduce((sum, segment) => sum + (segment.gap || 0), 0)
      const maxAvailableAngle = 360 - gapsSum
      const maxIncrease = maxAvailableAngle - totalAngleWithoutGaps + maxDecrease - 20
        // 计算安全的变化范围
      // 保证增加角度的扇形不会过小，减少角度的扇形不会过大
      const safeChangeLimit = Math.min(
        maxDecrease, // 保证减少的扇形不会小于30度
        increaseSegment.angle * 0.7, // 限制在较小扇形角度的50%以内，避免变化过大
        maxAngleChange // 用户设置的最大变化量
      )
      
      // 最终的变化量（保证至少有5度的变化）
      const angleChange = Math.max(10, Math.floor(Math.random() * safeChangeLimit))
      
      // 确保不超过最大减少量
      const actualDecrease = Math.min(angleChange, maxDecrease)
      const actualIncrease = angleChange
      
      // 创建新的目标扇形数组
      const newTargets = [...currentSegments].map((segment, idx) => {
        if (idx === increaseIndex) {
          // 增加角度的扇形
          return { ...segment, angle: segment.angle + actualIncrease }
        } else if (idx === decreaseIndex) {
          // 减少角度的扇形
          return { ...segment, angle: Math.max(30, segment.angle - actualDecrease) }
        } else {
          // 不变的扇形
          return { ...segment }
        }
      })
      
      // 更新目标状态
      setTargetSegments(newTargets)
      // 重置过渡进度
      setTransition(0)
    }

    const intervalId = setInterval(changeAngles, changeInterval)
    return () => clearInterval(intervalId)
  }, [segments.length, currentSegments, maxAngleChange, changeInterval])
    // 平滑过渡动画
  useEffect(() => {
    // 如果已经完成过渡，不需要再继续
    if (transition >= 1) return

    // 设置动画时间为1秒
    const animationDuration = 2000 // 1秒 = 1000毫秒
    const frameRate = 60 // 假设60帧每秒
    const incrementPerFrame = 1 / (animationDuration / (1000 / frameRate))

    // 创建平滑动画
    const animationFrame = requestAnimationFrame(() => {
      // 根据帧率增加过渡进度，确保整体过渡时长约为1秒
      const newTransition = Math.min(1, transition + incrementPerFrame)
      setTransition(newTransition)
      
      // 计算当前扇形角度
      const interpolatedSegments = currentSegments.map((segment, idx) => {
        const targetAngle = targetSegments[idx].angle
        const currentAngle = segment.angle
        // 使用缓动函数使动画更自然
        const easeTransition = easeInOutCubic(newTransition)
        const newAngle = currentAngle + (targetAngle - currentAngle) * easeTransition
        
        return {
          ...segment,
          angle: newAngle
        }
      })
      
      // 如果过渡完成，更新当前扇形为目标扇形
      if (newTransition >= 1) {
        setCurrentSegments(targetSegments)
      } else {
        setCurrentSegments(interpolatedSegments)
      }
    })
    
    return () => cancelAnimationFrame(animationFrame)
  }, [transition, currentSegments, targetSegments])

  // 中心点坐标
  const centerX = 50
  const centerY = 50

  // 半径和线宽
  const radius = 42
  const arcWidth = 14

  // 计算内径和外径
  const outerRadius = radius + arcWidth / 2
  const innerRadius = radius - arcWidth / 2

  // 验证扇形角度总和是否接近360度(考虑间隔)
  const totalAngle = currentSegments.reduce((sum, segment) => sum + segment.angle + (segment.gap || 0), 0);
  if (Math.abs(totalAngle - 360) > 1) {
    console.warn(`扇形角度总和应为360度，当前为${totalAngle}度`);
  }

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

        {/* 旋转的扇形圆弧组 */}
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center",
          }}
        >
          {/* 渲染多个扇形 */}
          {renderArcs(currentSegments, centerX, centerY, innerRadius, outerRadius, cornerRadius)}
        </g>

        {/* 中心透明圆 */}
        <circle cx="50" cy="50" r="28" fill="white" />
      </svg>
    </div>
  )
}

// 渲染多个扇形
function renderArcs(
  segments: ArcSegment[],
  cx: number,
  cy: number, 
  innerRadius: number,
  outerRadius: number,
  cornerRadius: number
) {
  const arcs = [];
  let startAngle = 0;
  
  for (let i = 0; i < segments.length; i++) {
    const { angle, color, gap = 0 } = segments[i];
    
    arcs.push(
      <path
        key={i}
        d={createRoundedArc(
          cx,
          cy,
          innerRadius,
          outerRadius,
          startAngle,
          angle,
          cornerRadius
        )}
        fill={color}
        fillOpacity="0.7"
        filter="url(#glass-outline-arc)"
      />
    );
    
    // 更新下一个扇形的起始角度
    startAngle += angle + gap;
  }
  
  return arcs;
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

