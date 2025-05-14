export default function CSSAnimatedIndicator() {
  // Different shades of blue for the layers
  const blueShades = [
    "#60a5fa", // blue-400
    "#3b82f6", // blue-500
    "#2563eb", // blue-600
    "#1d4ed8", // blue-700
  ]

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* SVG container */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle (lightest shade) */}
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />

        {/* Multiple blue layers with different animation delays */}
        {blueShades.map((color, index) => (
          <circle
            key={index}
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${80 - index * 10} ${252 + index * 10}`}
            className="animate-spin"
            style={{
              animationDuration: "1.5s",
              animationDelay: `${-index * 0.2}s`,
              transformOrigin: "center",
            }}
          />
        ))}

        {/* Center transparent circle */}
        <circle cx="50" cy="50" r="32" fill="white" />
      </svg>
    </div>
  )
}
