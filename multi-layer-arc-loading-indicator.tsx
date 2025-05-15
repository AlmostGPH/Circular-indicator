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

// 层配置接口
interface ArcLayer {
  segments: ArcSegment[];  // 扇形配置数组
  innerRadius: number;     // 内半径
  outerRadius: number;     // 外半径
  speed: number;           // 旋转速度
}

// 组件属性接口
interface MultiLayerArcLoadingIndicatorProps {
  cornerRadius?: number;    // 圆角半径
  changeInterval?: number;  // 角度变化间隔，单位：毫秒
  maxAngleChange?: number;  // 最大角度变化量
  layers?: number;          // 层数
  darkMode?: boolean;       // 暗色模式
  reverseColors?: boolean;  // 颜色顺序反转
}

// 创建蓝色渐变
function generateBlueShades(layers: number, reverseColors: boolean = false, darkMode: boolean = false): string[] {
  // 浅色模式的蓝色
  const baseBlue = [59, 130, 246]; // #3b82f6 RGB值
  const lightBlue = [147, 197, 253]; // #93c5fd RGB值
  
  // 暗色模式的蓝色（更亮、更饱和）
  const darkModeBaseBlue = [37, 99, 235]; // #2563eb RGB值
  const darkModeLightBlue = [96, 165, 250]; // #60a5fa RGB值
  
  // 根据模式选择颜色范围
  const darkBlue = darkMode ? darkModeBaseBlue : baseBlue;
  const brightBlue = darkMode ? darkModeLightBlue : lightBlue;
  
  // 确定起始和结束颜色（正常或反转）
  const startColor = reverseColors ? brightBlue : darkBlue;
  const endColor = reverseColors ? darkBlue : brightBlue;
  
  return Array.from({ length: layers }).map((_, index) => {
    const factor = index / (layers - 1);
    const r = Math.round(startColor[0] + factor * (endColor[0] - startColor[0]));
    const g = Math.round(startColor[1] + factor * (endColor[1] - startColor[1]));
    const b = Math.round(startColor[2] + factor * (endColor[2] - startColor[2]));
    return `rgb(${r}, ${g}, ${b})`;
  });
}

export default function MultiLayerArcLoadingIndicator({
  cornerRadius = 10,
  changeInterval = 1500, // 默认1.5秒变化一次
  maxAngleChange = 40,   // 最大角度变化量，避免变化过于剧烈
  layers = 3,            // 默认三层
  darkMode = false,      // 默认浅色模式
  reverseColors = false  // 默认不反转颜色
}: MultiLayerArcLoadingIndicatorProps) {
  // 添加一个空的服务端组件
  if (typeof window === 'undefined') {
    return <div className="relative w-64 h-64 flex items-center justify-center"></div>
  }
  
  // 生成蓝色渐变色
  const blueShades = generateBlueShades(layers, reverseColors, darkMode);
  
  // 创建层配置
  const createInitialLayers = (): ArcLayer[] => {
    return Array.from({ length: layers }).map((_, index) => {
      // 计算半径 (从外到内)
      const baseRadius = 42;
      const radius = baseRadius - index * 4;
      const arcWidth = 12 + index * 1;
      
      return {
        segments: [
          { angle: 110, color: blueShades[index], gap: 10 },
          { angle: 110, color: blueShades[index], gap: 10 },
          { angle: 110, color: blueShades[index], gap: 10 },
        ],
        innerRadius: radius - arcWidth / 2,
        outerRadius: radius + arcWidth / 2,
        speed: 1 - (index * 0.2), // 外层快，内层慢
      };
    });
  };
  
  // 创建旋转状态
  const [rotations, setRotations] = useState<number[]>(Array(layers).fill(0));
  // 创建层状态
  const [arcLayers, setArcLayers] = useState<ArcLayer[]>(createInitialLayers);
  // 创建目标扇形状态，用于平滑过渡
  const [targetSegmentsArray, setTargetSegmentsArray] = useState(arcLayers.map(layer => layer.segments));
  // 创建过渡进度状态
  const [transitions, setTransitions] = useState(Array(layers).fill(1));

  // 扇形旋转动画
  useEffect(() => {
    const interval = setInterval(() => {
      setRotations(prev => 
        prev.map((rotation, index) => (rotation + arcLayers[index].speed) % 360)
      );
    }, 10);

    return () => clearInterval(interval);
  }, [arcLayers]);
  
  // 角度变化动画 - 为每个层单独设置
  useEffect(() => {
    const changeLayerAngles = (layerIndex: number) => {
      const layer = arcLayers[layerIndex];
      const segments = layer.segments;
      
      // 随机选择一个保持不变的扇形索引
      const fixedIndex = Math.floor(Math.random() * segments.length);
      
      // 获取其他两个扇形的索引
      const otherIndices = Array.from({ length: segments.length }, (_, i) => i)
        .filter(i => i !== fixedIndex);
      
      // 确定哪个扇形角度小（将增加），哪个扇形角度大（将减少）
      const smallerAngleIndex = segments[otherIndices[0]].angle <= segments[otherIndices[1]].angle 
        ? otherIndices[0] 
        : otherIndices[1];
      
      const largerAngleIndex = segments[otherIndices[0]].angle > segments[otherIndices[1]].angle 
        ? otherIndices[0] 
        : otherIndices[1];
      
      // 计算当前总角度（不包括间隔）
      const totalAngleWithoutGaps = segments.reduce((sum, segment) => sum + segment.angle, 0)
      
      // 获取要改变的两个扇形的角度
      const decreaseSegment = segments[largerAngleIndex]
      const increaseSegment = segments[smallerAngleIndex]
      
      // 计算减少角度扇形的最大可减少量（保证不小于最小角度30度）
      const maxDecrease = Math.max(0, decreaseSegment.angle - 30)
      
      // 计算安全的变化范围
      const safeChangeLimit = Math.min(
        maxDecrease, // 保证减少的扇形不会小于30度
        increaseSegment.angle * 0.7, // 限制在较小扇形角度的70%以内，避免变化过大
        maxAngleChange // 用户设置的最大变化量
      )
      
      // 最终的变化量（保证至少有10度的变化）
      const angleChange = Math.max(10, Math.floor(Math.random() * safeChangeLimit))
      
      // 确保不超过最大减少量
      const actualDecrease = Math.min(angleChange, maxDecrease)
      const actualIncrease = angleChange
      
      // 创建新的目标扇形数组
      const newTargets = [...segments].map((segment, idx) => {
        if (idx === smallerAngleIndex) {
          // 增加角度的扇形
          return { ...segment, angle: segment.angle + actualIncrease }
        } else if (idx === largerAngleIndex) {
          // 减少角度的扇形
          return { ...segment, angle: Math.max(30, segment.angle - actualDecrease) }
        } else {
          // 不变的扇形
          return { ...segment }
        }
      })
      
      // 更新目标状态
      const newTargetSegmentsArray = [...targetSegmentsArray];
      newTargetSegmentsArray[layerIndex] = newTargets;
      setTargetSegmentsArray(newTargetSegmentsArray);
      
      // 重置当前层的过渡进度
      const newTransitions = [...transitions];
      newTransitions[layerIndex] = 0;
      setTransitions(newTransitions);
    }
    
    // 为每个层设置不同的间隔时间，形成错落变化效果
    const intervals = arcLayers.map((_, index) => {
      const staggeredInterval = changeInterval + index * 400;
      return setInterval(() => changeLayerAngles(index), staggeredInterval);
    });
    
    return () => intervals.forEach(interval => clearInterval(interval));
  }, [arcLayers, targetSegmentsArray, transitions, maxAngleChange, changeInterval]);

  // 平滑过渡动画
  useEffect(() => {
    // 检查是否所有层都已完成过渡
    if (transitions.every(t => t >= 1)) return;

    // 设置动画时间为2秒
    const animationDuration = 2000;
    const frameRate = 60;
    const incrementPerFrame = 1 / (animationDuration / (1000 / frameRate));
    
    // 创建平滑动画
    const animationFrame = requestAnimationFrame(() => {
      // 处理每一层的过渡
      const newTransitions = [...transitions];
      const newLayers = [...arcLayers];
      
      arcLayers.forEach((layer, layerIndex) => {
        // 如果当前层已经完成过渡，不需要处理
        if (transitions[layerIndex] >= 1) return;
        
        // 更新过渡进度
        const newTransition = Math.min(1, transitions[layerIndex] + incrementPerFrame);
        newTransitions[layerIndex] = newTransition;
        
        // 使用缓动函数使动画更自然
        const easeTransition = easeInOutCubic(newTransition);
        
        // 计算当前扇形角度
        const currentSegments = layer.segments;
        const targetSegments = targetSegmentsArray[layerIndex];
        
        const interpolatedSegments = currentSegments.map((segment, idx) => {
          const targetAngle = targetSegments[idx].angle;
          const currentAngle = segment.angle;
          const newAngle = currentAngle + (targetAngle - currentAngle) * easeTransition;
          
          return {
            ...segment,
            angle: newAngle
          };
        });
        
        newLayers[layerIndex] = {
          ...layer,
          segments: newTransition >= 1 ? targetSegments : interpolatedSegments
        };
      });
      
      setTransitions(newTransitions);
      setArcLayers(newLayers);
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [transitions, arcLayers, targetSegmentsArray]);

  // 中心点坐标
  const centerX = 50;
  const centerY = 50;
  // 根据暗色模式调整背景和阴影颜色
  const bgStrokeColor = darkMode ? "#374151" : "#f3f4f6";
  const shadowColor = darkMode ? "rgba(0,0,0,0.5)" : "white";
  
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id={`glass-outline-multi-arc${darkMode ? '-dark' : ''}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={shadowColor} floodOpacity="0.5" />
          </filter>
        </defs>

        {/* 背景圆 */}
        <circle cx="50" cy="50" r="48" fill="none" stroke={bgStrokeColor} strokeWidth="6" strokeLinecap="round" />

        {/* 渲染多层旋转的扇形 */}
        {arcLayers.map((layer, layerIndex) => (
          <g
            key={layerIndex}
            style={{
              transform: `rotate(${rotations[layerIndex]}deg)`,
              transformOrigin: "center",
            }}
          >
            {/* 渲染当前层的多个扇形 */}            {renderArcs(
              layer.segments,
              centerX,
              centerY,
              layer.innerRadius,
              layer.outerRadius,
              cornerRadius,
              darkMode
            )}
          </g>
        ))}        {/* 中心透明圆 */}
        <circle cx="50" cy="50" r="28" fill={darkMode ? "#111827" : "white"} />
      </svg>
    </div>
  );
}

// 渲染多个扇形
function renderArcs(
  segments: ArcSegment[],
  cx: number,
  cy: number, 
  innerRadius: number,
  outerRadius: number,
  cornerRadius: number,
  darkMode: boolean = false
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
        )}        fill={color}
        fillOpacity="0.7"
        filter={`url(#glass-outline-multi-arc${darkMode ? '-dark' : ''})`}
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
