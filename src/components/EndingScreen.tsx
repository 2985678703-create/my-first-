import { useState, useEffect } from 'react';

interface EndingScreenProps {
  endingType: 'good' | 'bad' | 'neutral';
  endingTitle?: string;
  endingDescription?: string;
  onReturnToMenu: () => void;
  onRetry?: () => void;
  canRetry?: boolean;
}

export default function EndingScreen({
  endingType,
  endingTitle,
  endingDescription,
  onReturnToMenu,
  onRetry,
  canRetry = false,
}: EndingScreenProps) {
  const [phase, setPhase] = useState(0);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setShowButtons(true), 2200),
    ];
    
    return () => timers.forEach(clearTimeout);
  }, []);

  const getEndingConfig = () => {
    switch (endingType) {
      case 'good':
        return {
          icon: '✨',
          title: endingTitle || 'GOOD END',
          subtitle: '美好的结局',
          color: '#34d399',
          glowColor: 'rgba(52, 211, 153, 0.3)',
          bgGradient: 'radial-gradient(ellipse at center, rgba(52, 211, 153, 0.1) 0%, transparent 70%)',
        };
      case 'bad':
        return {
          icon: '💔',
          title: endingTitle || 'BAD END',
          subtitle: '遗憾的结局',
          color: '#f87171',
          glowColor: 'rgba(248, 113, 113, 0.3)',
          bgGradient: 'radial-gradient(ellipse at center, rgba(248, 113, 113, 0.1) 0%, transparent 70%)',
        };
      default:
        return {
          icon: '🌙',
          title: endingTitle || 'END',
          subtitle: '故事暂告一段落',
          color: '#9ca3af',
          glowColor: 'rgba(156, 163, 175, 0.3)',
          bgGradient: 'radial-gradient(ellipse at center, rgba(156, 163, 175, 0.1) 0%, transparent 70%)',
        };
    }
  };

  const config = getEndingConfig();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ending-title"
    >
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        style={{ animation: 'fadeIn 0.8s ease-out' }}
      />
      
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: config.bgGradient,
          animation: 'pulseGlow 4s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 text-center max-w-lg mx-4 px-6">
        {phase >= 1 && (
          <div 
            className="mb-8"
            style={{ animation: 'fadeInDown 0.8s ease-out' }}
          >
            <div 
              className="text-6xl mb-4"
              style={{
                filter: `drop-shadow(0 0 30px ${config.glowColor})`,
                animation: 'floatIcon 3s ease-in-out infinite',
              }}
            >
              {config.icon}
            </div>
          </div>
        )}

        {phase >= 2 && (
          <div 
            className="mb-6"
            style={{ animation: 'fadeInUp 0.8s ease-out' }}
          >
            <div 
              className="inline-block px-8 py-3 border backdrop-blur-md rounded-lg"
              style={{
                borderColor: `${config.color}40`,
                background: `linear-gradient(135deg, ${config.color}10, transparent)`,
                boxShadow: `0 0 40px ${config.glowColor}`,
              }}
            >
              <h1 
                id="ending-title"
                className="font-display text-2xl md:text-3xl font-bold tracking-[0.4em]"
                style={{ 
                  color: config.color,
                  textShadow: `0 0 30px ${config.glowColor}`,
                }}
              >
                {config.title}
              </h1>
            </div>
          </div>
        )}

        {phase >= 3 && (
          <div 
            className="mb-8"
            style={{ animation: 'fadeIn 0.8s ease-out' }}
          >
            <p 
              className="font-serif text-sm text-white/50 italic"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
            >
              {config.subtitle}
            </p>
            
            {endingDescription && (
              <p 
                className="font-serif text-xs text-white/30 mt-4 leading-relaxed max-w-sm mx-auto"
                style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}
              >
                {endingDescription}
              </p>
            )}
          </div>
        )}

        {showButtons && (
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animation: 'fadeInUp 0.8s ease-out' }}
          >
            {canRetry && onRetry && (
              <button
                onClick={onRetry}
                className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 border backdrop-blur-md rounded-lg font-display text-sm tracking-wider transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  borderColor: `${config.color}40`,
                  background: `linear-gradient(135deg, ${config.color}15, ${config.color}5)`,
                  color: config.color,
                  boxShadow: `0 0 20px ${config.glowColor}`,
                }}
                aria-label="重新挑战"
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  className="transition-transform duration-500 group-hover:rotate-180"
                >
                  <path d="M1 4v6h6M23 20v-6h-6"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
                重新挑战
              </button>
            )}
            
            <button
              onClick={onReturnToMenu}
              className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 border border-white/20 backdrop-blur-md rounded-lg font-display text-sm tracking-wider text-white/70 transition-all duration-300 hover:bg-white/5 hover:scale-105 active:scale-95"
              aria-label="返回菜单"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
                className="transition-transform duration-300 group-hover:-translate-x-1"
              >
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              返回菜单
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
