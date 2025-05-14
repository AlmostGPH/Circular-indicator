export default function CSSLoadingIndicator() {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Background doughnut (gray) */}
      <div className="absolute w-full h-full rounded-full">
        <div className="w-full h-full border-8 border-gray-200 rounded-full" />
      </div>

      {/* Inner white circle */}
      <div className="absolute w-14 h-14 bg-white rounded-full z-10" />

      {/* Active doughnut (blue) - rotating */}
      <div className="absolute w-full h-full rounded-full">
        <div
          className="w-full h-full border-8 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin"
          style={{ animationDuration: "1.5s" }}
        />
      </div>
    </div>
  )
}
