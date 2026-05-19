import { useEffect, useState } from 'react';
import { useAchievementNotifications } from '../hooks/useAchievementNotification';
import { RARITY_INFO, AchievementRarity } from '../data/achievements';

export default function AchievementToast() {
  const { notifications, removeNotification } = useAchievementNotifications();
  const [visibleId, setVisibleId] = useState<string | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      setVisibleId(latest.id);
      
      const timer = setTimeout(() => {
        setVisibleId(null);
        setTimeout(() => {
          removeNotification(latest.id);
        }, 600);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  const latestNotification = notifications.find(n => n.id === visibleId);
  if (!latestNotification) return null;

  const rarityInfo = RARITY_INFO[latestNotification.rarity];
  const isVisible = visibleId === latestNotification.id;

  return (
    <div 
      className="fixed top-20 right-4 z-[200] pointer-events-none"
      role="alert"
      aria-live="polite"
    >
      <div 
        className={`relative overflow-hidden transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-8 scale-95'
        }`}
        style={{
          minWidth: '340px',
          maxWidth: '420px',
        }}
      >
        <div 
          className="relative p-5 rounded-xl border backdrop-blur-xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, 
              rgba(0,0,0,0.85) 0%, 
              rgba(20,20,35,0.9) 50%,
              rgba(10,10,25,0.85) 100%)`,
            borderColor: `${rarityInfo.color}50`,
            boxShadow: `
              0 0 40px ${rarityInfo.glowColor},
              0 8px 32px rgba(0,0,0,0.4),
              inset 0 1px 0 rgba(255,255,255,0.1),
              inset 0 -1px 0 rgba(0,0,0,0.3)
            `,
          }}
        >
          <div 
            className="absolute inset-0 opacity-60"
            style={{
              background: `linear-gradient(135deg, 
                ${rarityInfo.color}08 0%, 
                transparent 40%,
                ${rarityInfo.color}05 60%,
                transparent 100%)`,
            }}
          />
          
          <div 
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${rarityInfo.color}60, transparent)`,
            }}
          />

          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(45deg, transparent 40%, ${rarityInfo.color}15 50%, transparent 60%)`,
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />

          <div className="relative flex items-start gap-4">
            <div 
              className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center text-4xl rounded-xl border overflow-hidden"
              style={{
                borderColor: `${rarityInfo.color}40`,
                background: `linear-gradient(135deg, 
                  ${rarityInfo.color}20 0%, 
                  transparent 50%,
                  ${rarityInfo.color}10 100%)`,
                boxShadow: `
                  0 0 20px ${rarityInfo.glowColor},
                  inset 0 0 15px ${rarityInfo.color}15
                `,
              }}
            >
              <div 
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${rarityInfo.color}30, transparent 60%)`,
                }}
              />
              <span className="relative drop-shadow-lg" style={{ filter: `drop-shadow(0 0 8px ${rarityInfo.color}80)` }}>
                {latestNotification.icon}
              </span>
            </div>

            <div className="flex-1 min-w-0 py-1">
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="font-mono text-[10px] tracking-[0.2em] uppercase font-semibold"
                  style={{ color: rarityInfo.color }}
                >
                  成就解锁
                </span>
                <span 
                  className="px-2 py-0.5 rounded-full font-mono text-[9px] tracking-wider border"
                  style={{ 
                    color: rarityInfo.color, 
                    borderColor: `${rarityInfo.color}50`,
                    background: `linear-gradient(135deg, ${rarityInfo.color}20, ${rarityInfo.color}10)`,
                    boxShadow: `0 0 8px ${rarityInfo.glowColor}`,
                  }}
                >
                  {rarityInfo.name}
                </span>
              </div>
              
              <h3 
                className="font-display text-lg tracking-wider mb-1 truncate font-semibold"
                style={{ 
                  color: rarityInfo.color,
                  textShadow: `0 0 20px ${rarityInfo.glowColor}`,
                }}
              >
                {latestNotification.name}
              </h3>
              
              <p className="font-serif text-xs text-white/60 leading-relaxed line-clamp-2">
                {latestNotification.description}
              </p>
            </div>

            <button
              onClick={() => {
                setVisibleId(null);
                setTimeout(() => removeNotification(latestNotification.id), 600);
              }}
              className="flex-shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-all pointer-events-auto"
              aria-label="关闭通知"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
            <div 
              className="h-full transition-all duration-100 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${rarityInfo.color}, ${rarityInfo.color}CC, ${rarityInfo.color}80)`,
                boxShadow: `0 0 10px ${rarityInfo.color}80`,
                animation: 'progressBar 5s linear forwards',
              }}
            />
          </div>
        </div>

        <style>{`
          @keyframes progressBar {
            from { width: 100%; }
            to { width: 0%; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  );
}
