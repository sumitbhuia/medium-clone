export const ThemeSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen bg-gray-50/50 backdrop-blur-sm">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 border-2 border-gray-200 rounded-full"></div>
        
        {/* Spinning ring with green accent */}
        <div className="absolute top-0 left-0 w-12 h-12 border-2 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
        
        {/* Inner dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

// Alternative modern spinner options
export const PulseSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen bg-gray-50/50">
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export const WaveSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen bg-gray-50/50">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-emerald-500 rounded-full animate-pulse"
            style={{
              height: '24px',
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export const RingsSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen bg-gray-50/50">
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 border-2 border-gray-200 rounded-full opacity-30"></div>
        
        {/* Middle ring */}
        <div className="absolute inset-2 border-2 border-emerald-300 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
        
        {/* Inner ring */}
        <div className="absolute inset-4 border-2 border-emerald-500 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-emerald-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      </div>
    </div>
  );
};