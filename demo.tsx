import MultiLayerLoadingIndicator from "./multi-layer-loading-indicator"
import RequestAnimationFrameIndicator from "./request-animation-frame-indicator"
import CustomizableLoadingIndicator from "./customizable-loading-indicator"
import DarkModeIndicator from "./dark-mode-indicator"
import DarkModeRAFIndicator from "./dark-mode-raf-indicator"
import OutlineLoadingIndicator from "./outline-loading-indicator"
import DarkModeOutlineIndicator from "./dark-mode-outline-indicator"
import OutlineRAFIndicator from "./outline-raf-indicator"
import DarkModeOutlineRAFIndicator from "./dark-mode-outline-raf-indicator"

export default function Demo() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-16 p-8 bg-white">
      <div className="flex flex-col items-center gap-4 w-full">
        <h2 className="text-2xl font-medium">Standard Implementation</h2>
        <p className="text-gray-500 text-center max-w-md">
          Uses React state for animation with multiple layers of different radii
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
          <div className="flex flex-col items-center">
            <p className="mb-2 text-sm text-gray-500">Light Mode</p>
            <div className="flex flex-row gap-8">
              <div className="flex flex-col items-center">
                <p className="mb-2 text-xs text-gray-500">普通版</p>
                <MultiLayerLoadingIndicator />
              </div>
              <div className="flex flex-col items-center">
                <p className="mb-2 text-xs text-gray-500">边框版</p>
                <OutlineLoadingIndicator />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-2 text-sm text-gray-500">Dark Mode</p>
            <div className="flex flex-row gap-8">
              <div className="flex flex-col items-center">
                <p className="mb-2 text-xs text-gray-500">普通版</p>
                <DarkModeIndicator />
              </div>
              <div className="flex flex-col items-center">
                <p className="mb-2 text-xs text-gray-500">边框版</p>
                <DarkModeOutlineIndicator />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <h2 className="text-2xl font-medium">RequestAnimationFrame Implementation</h2>
        <p className="text-gray-500 text-center max-w-md">
          Uses requestAnimationFrame for smoother animation with variable speeds
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
          <div className="flex flex-col items-center">
            <p className="mb-2 text-sm text-gray-500">Light Mode</p>
            <div className="flex flex-row gap-8">
              <div className="flex flex-col items-center">
                <p className="mb-2 text-xs text-gray-500">普通版</p>
                <RequestAnimationFrameIndicator />
              </div>
              <div className="flex flex-col items-center">
                <p className="mb-2 text-xs text-gray-500">边框版</p>
                <OutlineRAFIndicator />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-2 text-sm text-gray-500">Dark Mode</p>
            <div className="flex flex-row gap-8">
              <div className="flex flex-col items-center">
                <p className="mb-2 text-xs text-gray-500">普通版</p>
                <DarkModeRAFIndicator />
              </div>
              <div className="flex flex-col items-center">
                <p className="mb-2 text-xs text-gray-500">边框版</p>
                <DarkModeOutlineRAFIndicator />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <h2 className="text-2xl font-medium">Customizable Implementation</h2>
        <p className="text-gray-500 text-center max-w-md">
          Fully customizable with props for size, colors, speeds, and thickness
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center">
              <p className="mb-2 text-sm text-gray-500">Light Mode</p>
              <CustomizableLoadingIndicator size={128} colors={["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb"]} />
            </div>
            <div className="flex flex-col items-center">
              <p className="mb-2 text-sm text-gray-500">Dark Mode</p>
              <CustomizableLoadingIndicator
                size={128}
                colors={["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb"]}
                darkMode={true}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">Blue Theme</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center">
              <p className="mb-2 text-sm text-gray-500">Light Mode</p>
              <CustomizableLoadingIndicator
                size={128}
                colors={["#a7f3d0", "#6ee7b7", "#34d399", "#10b981"]}
                speeds={[0.06, 0.05, 0.04, 0.03]}
              />
            </div>
            <div className="flex flex-col items-center">
              <p className="mb-2 text-sm text-gray-500">Dark Mode</p>
              <CustomizableLoadingIndicator
                size={128}
                colors={["#a7f3d0", "#6ee7b7", "#34d399", "#10b981"]}
                speeds={[0.06, 0.05, 0.04, 0.03]}
                darkMode={true}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">Green Theme</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center">
              <p className="mb-2 text-sm text-gray-500">Light Mode</p>
              <CustomizableLoadingIndicator
                size={128}
                colors={["#fca5a5", "#f87171", "#ef4444", "#dc2626"]}
                speeds={[0.07, 0.055, 0.04, 0.025]}
                thickness={10}
              />
            </div>
            <div className="flex flex-col items-center">
              <p className="mb-2 text-sm text-gray-500">Dark Mode</p>
              <CustomizableLoadingIndicator
                size={128}
                colors={["#fca5a5", "#f87171", "#ef4444", "#dc2626"]}
                speeds={[0.07, 0.055, 0.04, 0.025]}
                thickness={10}
                darkMode={true}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">Red Theme</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <h2 className="text-2xl font-medium">对比实现</h2>
        <p className="text-gray-500 text-center max-w-md">
          左侧为标准实现，右侧为边框不透明内部透明实现
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
          <div className="flex flex-col items-center">
            <p className="mb-2 text-sm text-gray-500">标准实现</p>
            <MultiLayerLoadingIndicator />
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-2 text-sm text-gray-500">边框实现</p>
            <OutlineLoadingIndicator />
          </div>
        </div>
      </div>
    </div>
  )
}
