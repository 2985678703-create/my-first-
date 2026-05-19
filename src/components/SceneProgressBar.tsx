import { useState, useEffect } from 'react';

interface ProgressNode {
  id: string;
  label: string;
  labelEn: string;
}

interface SceneProgressBarProps {
  sceneId: 'scene1' | 'scene2' | 'scene3';
  currentNodeId: string;
  completedNodes: string[];
  isLocked?: boolean;
  unlockAnimation?: boolean;
  onUnlockComplete?: () => void;
}

const progressConfigs: Record<string, {
  title: string;
  titleEn: string;
  theme: string;
  accentColor: string;
  bgColor: string;
  nodes: ProgressNode[];
}> = {
  scene1: {
    title: '牛马的一天',
    titleEn: "A Cattle's Day",
    theme: 'corporate',
    accentColor: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.15)',
    nodes: [
      { id: 'challenge_1', label: '惊喜时刻', labelEn: 'Surprise' },
      { id: 'challenge_2', label: '面无表情', labelEn: 'Poker Face' },
      { id: 'challenge_3', label: '微笑面对', labelEn: 'Smile' },
    ],
  },
  scene2: {
    title: '梦境探索',
    titleEn: 'Dream Dive',
    theme: 'dream',
    accentColor: '#60a5fa',
    bgColor: 'rgba(96, 165, 250, 0.15)',
    nodes: [
      { id: 'layer_1', label: '童年记忆', labelEn: 'Childhood' },
      { id: 'layer_2', label: '悲伤往事', labelEn: 'Grief' },
      { id: 'layer_3', label: '焦虑深渊', labelEn: 'Anxiety' },
      { id: 'layer_4', label: '恐惧之源', labelEn: 'Fear' },
    ],
  },
  scene3: {
    title: '治愈之旅',
    titleEn: 'Healing Journey',
    theme: 'therapy',
    accentColor: '#a78bfa',
    bgColor: 'rgba(167, 139, 250, 0.15)',
    nodes: [
      { id: 'session_1', label: '初次接触', labelEn: 'First Contact' },
      { id: 'session_2', label: '情感释放', labelEn: 'Release' },
      { id: 'session_3', label: '心灵重建', labelEn: 'Rebuild' },
    ],
  },
};

export default function SceneProgressBar({
  sceneId,
  currentNodeId,
  completedNodes,
  isLocked = false,
  unlockAnimation = false,
  onUnlockComplete,
}: SceneProgressBarProps) {
  const [showUnlockEffect, setShowUnlockEffect] = useState(false);
  const [unlockPhase, setUnlockPhase] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [prevCompletedCount, setPrevCompletedCount] = useState(0);
  const [showCompletionFlash, setShowCompletionFlash] = useState(false);
  const [lastCompletedNode, setLastCompletedNode] = useState<string | null>(null);

  const config = progressConfigs[sceneId];
  if (!config) return null;

  const completedCount = config.nodes.filter(n => 
    completedNodes.some(c => c.startsWith(n.id) || c.includes(n.id))
  ).length;

  const progress = (completedCount / config.nodes.length) * 100;

  useEffect(() => {
    if (completedCount > prevCompletedCount) {
      setShowCompletionFlash(true);
      const newlyCompleted = config.nodes.find(n => 
        completedNodes.some(c => c.startsWith(n.id) || c.includes(n.id)) &&
        !prevCompletedCount.toString().includes(n.id)
      );
      if (newlyCompleted) {
        setLastCompletedNode(newlyCompleted.id);
      }
      setTimeout(() => {
        setShowCompletionFlash(false);
        setLastCompletedNode(null);
      }, 1500);
    }
    setPrevCompletedCount(completedCount);
  }, [completedCount, prevCompletedCount, completedNodes, config.nodes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 50);
    return () => clearTimeout(timer);
  }, [progress]);

  useEffect(() => {
    if (unlockAnimation && isLocked) {
      setShowUnlockEffect(true);
      
      const timers = [
        setTimeout(() => setUnlockPhase(1), 300),
        setTimeout(() => setUnlockPhase(2), 800),
        setTimeout(() => setUnlockPhase(3), 1500),
        setTimeout(() => {
          setShowUnlockEffect(false);
          onUnlockComplete?.();
        }, 2500),
      ];
      
      return () => timers.forEach(clearTimeout);
    }
  }, [unlockAnimation, isLocked, onUnlockComplete]);

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50">
      <div 
        className="relative border-t backdrop-blur-md transition-all duration-500"
        style={{
          borderColor: showCompletionFlash ? `${config.accentColor}60` : `${config.accentColor}30`,
          background: `linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.85))`,
          boxShadow: showCompletionFlash 
            ? `0 -10px 40px ${config.accentColor}30`
            : `0 -5px 20px rgba(0,0,0,0.5)`,
        }}
      >
        {showCompletionFlash && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${config.accentColor}15, transparent)`,
              animation: 'flashPulse 0.5s ease-out',
            }}
          />
        )}

        <div className="flex items-center justify-between px-4 md:px-8 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {sceneId === 'scene1' ? '💼' : sceneId === 'scene2' ? '🌙' : '🩺'}
              </span>
              <div>
                <div 
                  className="font-display text-xs tracking-wider"
                  style={{ color: config.accentColor }}
                >
                  {config.title}
                </div>
                <div className="font-mono text-[10px] text-white/30">
                  {config.titleEn}
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 border border-white/10">
              <span 
                className="font-mono text-sm font-bold"
                style={{ color: config.accentColor }}
              >
                {completedCount}/{config.nodes.length}
              </span>
              <span className="font-mono text-[10px] text-white/40">完成</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {config.nodes.map((node, index) => {
              const isCompleted = completedNodes.some(c => c.startsWith(node.id) || c.includes(node.id));
              const isCurrent = currentNodeId.startsWith(node.id) || currentNodeId.includes(node.id);
              const justCompleted = lastCompletedNode === node.id;
              
              return (
                <div 
                  key={node.id}
                  className="flex flex-col items-center gap-1 transition-all duration-300"
                  style={{
                    transform: isCurrent ? 'scale(1.1)' : justCompleted ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  <div 
                    className={`relative w-8 h-8 flex items-center justify-center text-xs border transition-all duration-500
                      ${isCompleted 
                        ? 'border-current bg-current/10' 
                        : isCurrent 
                          ? 'border-current bg-current/5' 
                          : 'border-white/20'}`}
                    style={{ 
                      color: isCompleted || isCurrent ? config.accentColor : 'rgba(255,255,255,0.3)',
                      boxShadow: isCompleted 
                        ? `0 0 10px ${config.accentColor}40` 
                        : justCompleted 
                          ? `0 0 15px ${config.accentColor}60` 
                          : 'none',
                    }}
                  >
                    {isCompleted ? (
                      <span style={{ animation: justCompleted ? 'bounceIn 0.5s ease-out' : 'none' }}>✓</span>
                    ) : (
                      index + 1
                    )}
                    {isCurrent && !isCompleted && (
                      <div 
                        className="absolute inset-0 border-current"
                        style={{ 
                          animation: 'pulseRing 1.5s ease-in-out infinite',
                          borderColor: config.accentColor,
                        }}
                      />
                    )}
                  </div>
                  <span 
                    className={`font-mono text-[9px] transition-all duration-300 text-center
                      ${isCompleted ? 'text-white/70' : isCurrent ? 'text-white/50' : 'text-white/30'}`}
                    style={{
                      color: justCompleted ? config.accentColor : undefined,
                    }}
                  >
                    {node.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div 
                className="font-mono text-lg font-bold transition-all duration-300"
                style={{ 
                  color: config.accentColor,
                  transform: showCompletionFlash ? 'scale(1.2)' : 'scale(1)',
                }}
              >
                {Math.round(animatedProgress)}%
              </div>
              <div className="font-mono text-[10px] text-white/30">进度</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
          <div 
            className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
            style={{ 
              width: `${animatedProgress}%`,
              background: `linear-gradient(90deg, ${config.accentColor}80, ${config.accentColor})`,
              boxShadow: `0 0 10px ${config.accentColor}60`,
            }}
          />
          {showCompletionFlash && (
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, transparent, ${config.accentColor}80, transparent)`,
                animation: 'progressFlash 0.5s ease-out',
              }}
            />
          )}
        </div>

        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            {showUnlockEffect ? (
              <div className="flex items-center gap-3">
                {unlockPhase >= 1 && (
                  <span className="text-2xl" style={{ animation: 'pulse 0.5s ease-in-out infinite' }}>🔗</span>
                )}
                {unlockPhase >= 2 && (
                  <span 
                    className="text-3xl"
                    style={{ 
                      animation: 'unlockBurst 0.8s ease-out forwards',
                      filter: `drop-shadow(0 0 20px ${config.accentColor})`,
                    }}
                  >✨</span>
                )}
                {unlockPhase >= 3 && (
                  <span 
                    className="text-2xl"
                    style={{ 
                      animation: 'bounceIn 0.5s ease-out',
                      filter: `drop-shadow(0 0 15px ${config.accentColor})`,
                    }}
                  >🔓</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xl opacity-50">🔒</span>
                <span className="font-serif text-xs text-white/40">需要了解叶成武的主要设定才能开始治疗</span>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes unlockBurst {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
          100% { transform: scale(2) rotate(360deg); opacity: 0; }
        }
        @keyframes flashPulse {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes progressFlash {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
