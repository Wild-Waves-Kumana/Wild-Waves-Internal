import React from 'react';

const LoadingOverlay = ({ 
  isVisible = true, 
  variant = 'orbit', 
  message = '', 
  className = '',
  backdropBlur = true,
  size = 'md',
  theme = 'blue'
}) => {
  if (!isVisible) return null;

  const themes = {
    blue: 'text-blue-600 border-blue-600 bg-blue-600',
    purple: 'text-purple-600 border-purple-600 bg-purple-600',
    green: 'text-green-600 border-green-600 bg-green-600',
    orange: 'text-orange-500 border-orange-500 bg-orange-500',
    pink: 'text-pink-500 border-pink-500 bg-pink-500',
    indigo: 'text-indigo-600 border-indigo-600 bg-indigo-600'
  };

  const sizeMap = {
    sm: { container: 'w-8 h-8', dot: 'w-2 h-2', bar: 'w-1.5 h-4' },
    md: { container: 'w-12 h-12', dot: 'w-3 h-3', bar: 'w-2 h-6' },
    lg: { container: 'w-16 h-16', dot: 'w-4 h-4', bar: 'w-2.5 h-8' },
    xl: { container: 'w-20 h-20', dot: 'w-5 h-5', bar: 'w-3 h-10' }
  };

  const currentTheme = themes[theme] || themes.blue;
  const currentSize = sizeMap[size];

  const renderOrbit = () => (
    <div className={`relative ${currentSize.container}`}>
      <div className={`absolute inset-0 rounded-full border-2 border-t-transparent ${currentTheme.replace('bg-', 'border-')} animate-spin`} />
      <div className={`absolute inset-2 rounded-full border border-t-transparent ${currentTheme.replace('bg-', 'border-')} opacity-60 animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      <div className={`absolute top-1/2 left-1/2 w-1.5 h-1.5 ${currentTheme} rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse`} />
    </div>
  );

  const renderWave = () => (
    <div className="flex items-end space-x-1">
      {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
        <div
          key={i}
          className={`${currentSize.bar} ${currentTheme} rounded-full animate-pulse opacity-75`}
          style={{ 
            animationDelay: `${delay}s`,
            animationDuration: '1.2s',
            transform: `scaleY(${0.4 + Math.sin(i * 0.5) * 0.3})`
          }}
        />
      ))}
    </div>
  );

  const renderMatrix = () => (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: 9 }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 ${currentTheme} rounded-sm animate-pulse opacity-20`}
          style={{ 
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1.5s'
          }}
        />
      ))}
    </div>
  );

  const renderPulseRings = () => (
    <div className="relative w-16 h-16">
      {[0, 0.5, 1].map((delay, i) => (
        <div
          key={i}
          className={`absolute inset-0 rounded-full border-2 ${currentTheme.replace('bg-', 'border-')} animate-ping opacity-20`}
          style={{ 
            animationDelay: `${delay}s`,
            animationDuration: '2s'
          }}
        />
      ))}
      <div className={`absolute top-1/2 left-1/2 w-3 h-3 ${currentTheme} rounded-full transform -translate-x-1/2 -translate-y-1/2`} />
    </div>
  );

  const renderFluidDots = () => (
    <div className="flex space-x-2">
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          className={`${currentSize.dot} ${currentTheme} rounded-full animate-bounce`}
          style={{ 
            animationDelay: `${delay}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );

  const renderSpiral = () => (
    <div className={`relative ${currentSize.container}`}>
      <div className={`absolute inset-0 rounded-full border-4 border-gray-200`} />
      <div 
        className={`absolute inset-0 rounded-full border-4 border-t-transparent ${currentTheme.replace('bg-', 'border-')} animate-spin`}
        style={{ 
          background: `conic-gradient(from 0deg, transparent, ${currentTheme.includes('blue') ? '#3b82f6' : currentTheme.includes('purple') ? '#8b5cf6' : '#10b981'})`
        }}
      />
    </div>
  );

  const renderMorph = () => (
    <div className="relative">
      <div 
        className={`w-8 h-8 ${currentTheme} rounded-full animate-pulse`}
        style={{
          animationDuration: '2s',
          transformOrigin: 'center'
        }}
      />
      <div 
        className={`absolute inset-0 w-8 h-8 ${currentTheme} opacity-40 rounded-full animate-ping`}
        style={{ animationDuration: '2s' }}
      />
    </div>
  );

  const getAnimationComponent = () => {
    switch (variant) {
      case 'wave': return renderWave();
      case 'matrix': return renderMatrix();
      case 'rings': return renderPulseRings();
      case 'dots': return renderFluidDots();
      case 'spiral': return renderSpiral();
      case 'morph': return renderMorph();
      default: return renderOrbit();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${backdropBlur ? 'backdrop-blur-sm backdrop-saturate-150' : ''} bg-black/20 ${className}`}>
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 flex flex-col items-center space-y-6 max-w-sm mx-4 animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex items-center justify-center">
          {getAnimationComponent()}
        </div>
        {message && (
          <div className="text-center space-y-2">
            <p className="text-gray-700 font-medium text-lg leading-relaxed">
              {message}
            </p>
            <div className="flex justify-center space-x-1">
              {[0, 0.3, 0.6].map((delay, i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;