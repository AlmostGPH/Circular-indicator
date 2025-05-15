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

// 图层配置接口
interface ArcLayer {
  segments: ArcSegment[];  // 扇形配置数组
  radius: number;          // 图层半径
  arcWidth: number;        // 图层线宽
  rotation: number;        // 图层旋转角度
  rotationSpeed: number;   // 图层旋转速度
}

// 组件属性接口
interface MultiArcIndicatorProps {
  layers?: ArcLayer[];    // 图层配置数组
  cornerRadius?: number;  // 圆角半径
  changeInterval?: number;  // 角度变化间隔，单位：毫秒
  maxAngleChange?: number;  // 最大角度变化量
  darkMode?: boolean;     // 是否为黑暗模式
}

export default function MultiArcIndicator({
  layers = [
    {
      segments: [
        { angle: 110, color: "#0c4a6e", gap: 10 }, // 深蓝色
        { angle: 110, color: "#075985", gap: 10 }, // 较深蓝色
        { angle: 110, color: "#0369a1", gap: 10 }, // 蓝色
      ],
      radius: 30,
      arcWidth: 8,
      rotation: 0,
      rotationSpeed: 1,
    },
    {
      segments: [
        { angle: 110, color: "#0284c7", gap: 10 }, // 天蓝色
        { angle: 110, color: "#0ea5e9", gap: 10 }, // 较浅蓝色
        { angle: 110, color: "#38bdf8", gap: 10 }, // 浅蓝色
      ],
      radius: 42,
      arcWidth: 8,
      rotation: 30,
      rotationSpeed: 0.8,
    },
    {
      segments: [
        { angle: 110, color: "#7dd3fc", gap: 10 }, // 非常浅的蓝色
        { angle: 110, color: "#bae6fd", gap: 10 }, // 几乎白的蓝色
        { angle: 110, color: "#e0f2fe", gap: 10 }, // 接近白色的蓝
      ],
      radius: 54,
      arcWidth: 8,
      rotation: 60,
      rotationSpeed: 0.6,
    }
  ],
  cornerRadius = 5,
  changeInterval = 2000,
  maxAngleChange = 40,
  darkMode = false,
}: MultiArcIndicatorProps) {
  // 为服务端渲染返回占位符
  if (typeof window === 'undefined') {
    return <div className="relative w-64 h-64 flex items-center justify-center"></div>
  }

  // 创建每个图层的状态
  const [layersState, setLayersState] = useState(layers.map(layer => ({
    currentSegments: [...layer.segments],
    targetSegments: [...layer.segments],
    rotation: layer.rotation,
    transition: 1
  })));

  // 管理图层旋转动画
  useEffect(() => {
    const intervals = layers.map((layer, index) => {
      return setInterval(() => {
        setLayersState(prevState => {
          const newState = [...prevState];
          newState[index] = {
            ...newState[index],
            rotation: (newState[index].rotation + layer.rotationSpeed) % 360
          };
          return newState;
        });
      }, 10);
    });
    
    return () => intervals.forEach(interval => clearInterval(interval));
  }, [layers]);

  // 管理角度变化动画
  useEffect(() => {
    const intervals = layers.map((_, layerIndex) => {
      return setInterval(() => {
        setLayersState(prevState => {
          const newState = [...prevState];
          const currentLayer = newState[layerIndex];
          
          // 随机选择一个保持不变的扇形索引
          const fixedIndex = Math.floor(Math.random() * currentLayer.currentSegments.length);
          
          // 获取其他扇形的索引
          const otherIndices = Array.from(
            { length: currentLayer.currentSegments.length }, 
            (_, i) => i
          ).filter(i => i !== fixedIndex);
          
          // 确定哪个扇形角度小（将增加），哪个扇形角度大（将减少）
          const smallerAngleIndex = 
            currentLayer.currentSegments[otherIndices[0]].angle <= 
            currentLayer.currentSegments[otherIndices[1]].angle 
              ? otherIndices[0] 
              : otherIndices[1];
          
          const largerAngleIndex = 
            currentLayer.currentSegments[otherIndices[0]].angle > 
            currentLayer.currentSegments[otherIndices[1]].angle 
              ? otherIndices[0] 
              : otherIndices[1];
          
          // 小角度的扇形增加，大角度的扇形减少
          const increaseIndex = smallerAngleIndex;
          const decreaseIndex = largerAngleIndex;
          
          // 计算当前总角度（不包括间隔）
          const totalAngleWithoutGaps = currentLayer.currentSegments.reduce(
            (sum, segment) => sum + segment.angle, 0
          );
          
          // 获取要改变的两个扇形的角度
          const decreaseSegment = currentLayer.currentSegments[decreaseIndex];
          const increaseSegment = currentLayer.currentSegments[increaseIndex];
          
          // 计算减少角度扇形的最大可减少量（保证不小于最小角度30度）
          const maxDecrease = Math.max(0, decreaseSegment.angle - 30);
          
          // 计算增加角度扇形的最大可增加量（保证总角度不会超过360减去间隔总和）
          const gapsSum = currentLayer.currentSegments.reduce(
            (sum, segment) => sum + (segment.gap || 0), 0
          );
          const maxAvailableAngle = 360 - gapsSum;
          const maxIncrease = maxAvailableAngle - totalAngleWithoutGaps + maxDecrease - 20;
          
          // 计算安全的变化范围
          const safeChangeLimit = Math.min(
            maxDecrease,
            increaseSegment.angle * 0.7,
            maxAngleChange
          );
          
          // 最终的变化量（保证至少有5度的变化）
          const angleChange = Math.max(10, Math.floor(Math.random() * safeChangeLimit));
          
          // 确保不超过最大减少量
          const actualDecrease = Math.min(angleChange, maxDecrease);
          const actualIncrease = angleChange;
          
          // 创建新的目标扇形数组
          const newTargets = [...currentLayer.currentSegments].map((segment, idx) => {
            if (idx === increaseIndex) {
              return { ...segment, angle: segment.angle + actualIncrease };
            } else if (idx === decreaseIndex) {
              return { ...segment, angle: Math.max(30, segment.angle - actualDecrease) };
            } else {
              return { ...segment };
            }
          });
          
          // 更新目标状态
          newState[layerIndex] = {
            ...currentLayer,
            targetSegments: newTargets,
            transition: 0
          };
          
          return newState;
        });
      }, changeInterval + layerIndex * 500); // 每层错峰变化
    });
    
    return () => intervals.forEach(interval => clearInterval(interval));
  }, [changeInterval, maxAngleChange]);

  // 管理平滑过渡动画
  useEffect(() => {
    // 所有图层都已完成过渡，不需要继续
    if (layersState.every(layer => layer.transition >= 1)) return;

    // 设置动画时间为1秒
    const animationDuration = 2000;
    const frameRate = 60;
    const incrementPerFrame = 1 / (animationDuration / (1000 / frameRate));

    const animationFrame = requestAnimationFrame(() => {
      setLayersState(prevState => {
        return prevState.map(layer => {
          // 如果该层已经完成过渡，直接返回
          if (layer.transition >= 1) return layer;

          // 根据帧率增加过渡进度
          const newTransition = Math.min(1, layer.transition + incrementPerFrame);
          
          // 计算当前扇形角度
          const interpolatedSegments = layer.currentSegments.map((segment, idx) => {
            const targetAngle = layer.targetSegments[idx].angle;
            const currentAngle = segment.angle;
            // 使用缓动函数使动画更自然
            const easeTransition = easeInOutCubic(newTransition);
            const newAngle = currentAngle + (targetAngle - currentAngle) * easeTransition;
            
            return {
              ...segment,
              angle: newAngle
            };
          });
          
          // 如果过渡完成，更新当前扇形为目标扇形
          if (newTransition >= 1) {
            return {
              ...layer,
              currentSegments: layer.targetSegments,
              transition: 1
            };
          } else {
            return {
              ...layer,
              currentSegments: interpolatedSegments,
              transition: newTransition
            };
          }
        });
      });
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [layersState]);

  // 中心点坐标
  const centerX = 50;
  const centerY = 50;

  // 验证各层扇形角度总和是否接近360度
  layersState.forEach((layer, index) => {
    const totalAngle = layer.currentSegments.reduce(
      (sum, segment) => sum + segment.angle + (segment.gap || 0), 0
    );
    if (Math.abs(totalAngle - 360) > 1) {
      console.warn(`图层 ${index} 扇形角度总和应为360度，当前为${totalAngle}度`);
    }
  });

  // 背景颜色
  const bgColor = darkMode ? "#111827" : "white";
  
  // 中心圆颜色
  const centerCircleColor = darkMode ? "#1f2937" : "white";
  
  // 背景圆颜色
  const bgCircleColor = darkMode ? "#374151" : "#f3f4f6";
  
  // 投影颜色
  const shadowColor = darkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";

  return (
    <div className={`relative w-64 h-64 flex items-center justify-center ${darkMode ? 'bg-gray-900' : ''}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <filter id="glass-outline-multi-arc" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={shadowColor} floodOpacity="0.5" />
          </filter>
        </defs>

        {/* 背景圆 */}
        <circle cx="50" cy="50" r="48" fill="none" stroke={bgCircleColor} strokeWidth="6" strokeLinecap="round" />

        {/* 渲染所有图层 */}
        {layersState.map((layerState, layerIndex) => {
          const layer = layers[layerIndex];
          const { arcWidth, radius } = layer;
          const outerRadius = radius + arcWidth / 2;
          const innerRadius = radius - arcWidth / 2;
          
          return (
            <g
              key={layerIndex}
              style={{
                transform: `rotate(${layerState.rotation}deg)`,
                transformOrigin: "center",
                opacity: darkMode ? 0.85 : 1,
              }}
            >
              {renderArcs(
                layerState.currentSegments,
                centerX,
                centerY,
                innerRadius,
                outerRadius,
                cornerRadius,
                darkMode
              )}
            </g>
          );
        })}

        {/* 中心透明圆 */}
        <circle cx="50" cy="50" r="22" fill={centerCircleColor} />
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
  darkMode: boolean
) {
  const arcs = [];
  let startAngle = 0;
  const filterId = "glass-outline-multi-arc";
  
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
        fillOpacity={darkMode ? "0.5" : "0.7"}
        filter={`url(#${filterId})`}
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
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = ((startAngle + arcAngle) * Math.PI) / 180;

  const outerStartX = cx + outerRadius * Math.cos(startRad);
  const outerStartY = cy + outerRadius * Math.sin(startRad);
  const outerEndX = cx + outerRadius * Math.cos(endRad);
  const outerEndY = cy + outerRadius * Math.sin(endRad);

  const innerStartX = cx + innerRadius * Math.cos(startRad);
  const innerStartY = cy + innerRadius * Math.sin(startRad);
  const innerEndX = cx + innerRadius * Math.cos(endRad);
  const innerEndY = cy + innerRadius * Math.sin(endRad);

  const angleOffset = 0.1;

  const outerEndControlX = cx + outerRadius * Math.cos(endRad - angleOffset);
  const outerEndControlY = cy + outerRadius * Math.sin(endRad - angleOffset);
  const outerEndCornerX = cx + (outerRadius - cornerRadius) * Math.cos(endRad);
  const outerEndCornerY = cy + (outerRadius - cornerRadius) * Math.sin(endRad);

  const outerStartControlX = cx + outerRadius * Math.cos(startRad + angleOffset);
  const outerStartControlY = cy + outerRadius * Math.sin(startRad + angleOffset);
  const outerStartCornerX = cx + (outerRadius - cornerRadius) * Math.cos(startRad);
  const outerStartCornerY = cy + (outerRadius - cornerRadius) * Math.sin(startRad);

  
  const innerEndControlX = cx + innerRadius * Math.cos(endRad - angleOffset);
  const innerEndControlY = cy + innerRadius * Math.sin(endRad - angleOffset);
  const innerEndCornerX = cx + (innerRadius + cornerRadius) * Math.cos(endRad);
  const innerEndCornerY = cy + (innerRadius + cornerRadius) * Math.sin(endRad);

  const innerStartControlX = cx + innerRadius * Math.cos(startRad + angleOffset);
  const innerStartControlY = cy + innerRadius * Math.sin(startRad + angleOffset);
  const innerStartCornerX = cx + (innerRadius + cornerRadius) * Math.cos(startRad);
  const innerStartCornerY = cy + (innerRadius + cornerRadius) * Math.sin(startRad);

  const largeArcFlag = arcAngle > 180 ? 1 : 0;

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
  `;
}
