import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import CustomCursor from './CustomCursor';

interface StartScreenProps {
  onNewGame: () => void;
  onLoadGame: () => void;
}

export default function StartScreen({ onNewGame, onLoadGame }: StartScreenProps) {
  const [phase, setPhase] = useState(0);
  const [showSaveInfo, setShowSaveInfo] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<'new' | 'load' | null>(null);
  
  const hasSaveData = useGameStore((state) => state.hasSaveData);
  const checkSaveData = useGameStore((state) => state.checkSaveData);
  const progress = useGameStore((state) => state.progress);
  
  useEffect(() => {
    checkSaveData();
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [checkSaveData]);

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}小时 ${mins}分钟`;
    return `${mins}分钟`;
  };

  const formatSaveTime = (timestamp: number | null) => {
    if (!timestamp) return '未知';
    const date = new Date(timestamp);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getChapterProgress = () => {
    const chapters = ['scene1', 'scene2', 'scene3'];
    const completed = chapters.filter(c => progress.completedEndings[c]?.length > 0).length;
    return `${completed}/${chapters.length}`;
  };

  const getSavedProgress = () => {
    try {
      const savedData = localStorage.getItem('emotion-agent-save-data');
      if (!savedData) return null;
      const data = JSON.parse(savedData);
      return data;
    } catch {
      return null;
    }
  };

  const savedData = getSavedProgress();

  const getCursorText = () => {
    if (hoveredButton === 'new') return '🎮 开始新旅程';
    if (hoveredButton === 'load') return hasSaveData ? '📂 继续上次的进度' : '⚠️ 暂无存档';
    return undefined;
  };

  const getCursorColor = () => {
    if (hoveredButton === 'new') return '#f5f5f5';
    if (hoveredButton === 'load') return hasSaveData ? '#fbbf24' : '#9ca3af';
    return undefined;
  };

  return (
    <>
      <CustomCursor hoverText={getCursorText()} hoverColor={getCursorColor()} />
      
      <div className="fixed inset-0 bg-black overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=2071&q=80)',
            filter: 'blur(10px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          <div 
            className={`text-center mb-16 transition-all duration-1000 ${
              phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
            }`}
          >
            <h1 className="font-display text-5xl md:text-7xl tracking-[0.3em] text-white/90 mb-4">
              EMOTION AGENT
            </h1>
            <p className="font-serif text-lg text-white/40 italic">
              情绪特工 · 探索心灵深处的秘密
            </p>
          </div>

          <div 
            className={`flex flex-col gap-4 transition-all duration-700 ${
              phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <button
              onClick={onNewGame}
              onMouseEnter={() => setHoveredButton('new')}
              onMouseLeave={() => setHoveredButton(null)}
              className="group relative px-12 py-4 border border-white/20 font-display text-lg tracking-widest text-white/70 transition-colors duration-300 hover:bg-white/5 hover:border-white/40 hover:text-white"
            >
              <span className="relative z-10">新游戏</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>

            <button
              onClick={() => {
                if (hasSaveData) {
                  onLoadGame();
                } else {
                  setShowSaveInfo(true);
                  setTimeout(() => setShowSaveInfo(false), 2000);
                }
              }}
              onMouseEnter={() => setHoveredButton('load')}
              onMouseLeave={() => setHoveredButton(null)}
              className={`group relative px-12 py-4 border font-display text-lg tracking-widest transition-colors duration-300 ${
                hasSaveData 
                  ? 'border-amber-400/40 text-amber-400/80 hover:bg-amber-400/5 hover:border-amber-400/60 hover:text-amber-400' 
                  : 'border-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span>继续游戏</span>
                {hasSaveData && (
                  <span className="text-xs font-mono bg-amber-400/20 px-2 py-0.5 rounded">
                    存档可用
                  </span>
                )}
              </span>
              {hasSaveData && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              )}
            </button>
          </div>

          {hasSaveData && savedData && (
            <div 
              className={`mt-8 p-4 border border-white/10 bg-black/40 backdrop-blur-sm max-w-md transition-all duration-700 ${
                phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-400">💾</span>
                <span className="font-display text-sm tracking-wider text-white/70">存档信息</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono">
                <div className="text-white/40">章节进度</div>
                <div className="text-white/70">{getChapterProgress()} 完成</div>
                <div className="text-white/40">游戏时长</div>
                <div className="text-white/70">{formatPlayTime(savedData.progress?.totalPlayTime || 0)}</div>
                <div className="text-white/40">成就解锁</div>
                <div className="text-white/70">{savedData.progress?.achievements?.length || 0} 个</div>
                <div className="text-white/40">保存时间</div>
                <div className="text-white/70">{formatSaveTime(savedData.savedAt)}</div>
              </div>
            </div>
          )}

          {showSaveInfo && (
            <div 
              className="mt-8 px-6 py-3 border border-white/10 bg-black/60 backdrop-blur-sm"
              style={{ animation: 'fadeIn 0.3s ease-out' }}
            >
              <span className="font-mono text-sm text-white/50">暂无存档，请先开始新游戏</span>
            </div>
          )}

          <div 
            className={`absolute bottom-8 left-0 w-full text-center transition-all duration-1000 ${
              phase >= 3 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <p className="font-mono text-[10px] text-white/30 tracking-widest">
              Face Expression Interactive · Emotion Engine v2.0 · 2024 Exhibition
            </p>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </>
  );
}
