import { useState, useEffect } from 'react';
import CustomCursor from './CustomCursor';
import { useGameStore, useProgress } from '../store/gameStore';

interface MainMenuProps {
  onStartScene: (sceneId: string, startNodeId?: string) => void;
  onOpenSettings: () => void;
  onOpenAchievements: () => void;
  onSaveGame?: () => void;
  onReturnToStart?: () => void;
}

const challengeNodes: Record<string, { id: string; name: string; targetEmotion: string; desc: string }[]> = {
  scene1: [
    { id: 'challenge_1_intro', name: 'Challenge 1: 惊喜时刻', targetEmotion: 'surprised', desc: '老板突然出现时表现出惊讶' },
    { id: 'challenge_2_intro', name: 'Challenge 2: 面无表情', targetEmotion: 'neutral', desc: '面对同事八卦时保持面无表情' },
    { id: 'challenge_3_intro', name: 'Challenge 3: 微笑面对', targetEmotion: 'happy', desc: '面对老板的狗时露出微笑' },
  ],
  scene3: [
    { id: 'session_1_intro', name: 'Session 1: 温暖开场', targetEmotion: 'happy', desc: '第一次治疗时展现友善和温暖' },
    { id: 'session_2_intro', name: 'Session 2: 悲伤共情', targetEmotion: 'sad', desc: '引导患者表达对父母的悲伤' },
    { id: 'session_3_intro', name: 'Session 3: 平静接纳', targetEmotion: 'neutral', desc: '帮助患者平静面对女儿恋爱' },
  ],
};

const chapters = [
  {
    id: 'scene1',
    title: 'A CATTLE\'S DAY',
    subtitle: 'Chapter I: DREAM TRAINING',
    description: 'Entry-level training: Dive into a corporate slave\'s dream. Complete three expression challenges.',
    bg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=2071&q=80',
    tooltip: '🎭 3 Challenges: Surprise → Neutral → Smile | One mistake = Game Over',
    color: '#fbbf24',
    previewContent: {
      tagline: 'ENTER THE DREAMSCAPE',
      features: ['Dream Training Mode', '3 Expression Challenges', 'Multiple Bad Endings'],
      mood: 'Training · Satirical · Immersive',
    },
  },
  {
    id: 'scene2',
    title: 'DREAM DIVE',
    subtitle: 'Chapter II: Ye Chengwu\'s Nightmare',
    description: 'Dive into Ye Chengwu\'s dreams. Explore four layers of his psyche.',
    bg: 'https://images.unsplash.com/photo-1501999635878-71cb5379-c2d8?w=2070&q=80',
    tooltip: '🌙 4 Memory Layers | Deep Psychology | The Empty City',
    color: '#60a5fa',
    previewContent: {
      tagline: 'INTO THE NIGHTMARE',
      features: ['4 Memory Layers', 'Psychological Analysis', 'Deep Narrative'],
      mood: 'Surreal · Psychological · Introspective',
    },
  },
  {
    id: 'scene3',
    title: 'THERAPY',
    subtitle: 'Chapter III: Return to Reality',
    description: 'Return to reality as a therapist. Three sessions to heal Ye Chengwu\'s heart.',
    bg: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=2070&q=80',
    tooltip: '🩺 3 Therapy Sessions | Heal the Patient | Final Challenge',
    color: '#c4b5fd',
    previewContent: {
      tagline: 'HEAL THE SOUL',
      features: ['3 Therapy Sessions', 'Emotional Guidance', 'Final Resolution'],
      mood: 'Professional · Healing · Meaningful',
    },
  }
];

export default function MainMenu({ onStartScene, onOpenSettings, onOpenAchievements, onSaveGame, onReturnToStart }: MainMenuProps) {
  const [activeChapter, setActiveChapter] = useState<typeof chapters[0] | null>(null);
  const [phase, setPhase] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showChallengeMenu, setShowChallengeMenu] = useState(false);
  
  const progress = useProgress();
  const getTotalProgress = useGameStore((state) => state.getTotalProgress);
  const totalProgress = getTotalProgress();

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleStart = (chapter: typeof chapters[0]) => {
    setActiveChapter(chapter);
    setIsTransitioning(true);
    setTimeout(() => onStartScene(chapter.id), 800);
  };

  const handleStartChallenge = (sceneId: string, nodeId: string) => {
    setIsTransitioning(true);
    setTimeout(() => onStartScene(sceneId, nodeId), 800);
  };

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getChapterCompletionStatus = (chapterId: string) => {
    const endings = progress.completedEndings[chapterId] || [];
    if (endings.includes('good')) return '✓ 已完成 (好结局)';
    if (endings.includes('bad')) return '✓ 已完成 (坏结局)';
    if (endings.length > 0) return '✓ 已完成';
    return '';
  };

  return (
    <>
      <CustomCursor hoverText={activeChapter?.tooltip} hoverColor={activeChapter?.color} />

      <div 
        className={`relative w-full h-screen overflow-hidden bg-black text-white transition-opacity duration-700 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        role="main"
        aria-label="游戏主菜单"
      >
        <div className="absolute inset-0 transition-all duration-1000">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
                activeChapter?.id === chapter.id ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${chapter.bg})`,
                filter: activeChapter?.id === chapter.id ? 'blur(15px) brightness(0.2) saturate(0.4)' : 'blur(0) brightness(0.4)',
                transform: activeChapter?.id === chapter.id ? 'scale(1.1)' : 'scale(1)',
              }}
              aria-hidden="true"
            />
          ))}

          <div className="absolute inset-0 bg-black/70" aria-hidden="true" />

          {activeChapter && (
            <div
              className="absolute inset-0 transition-opacity duration-700 opacity-50"
              style={{
                background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${activeChapter.color}30 0%, transparent 60%)`,
              }}
              aria-hidden="true"
            />
          )}
        </div>

        {activeChapter && !isTransitioning && (
          <div
            className="absolute top-[20%] left-0 right-0 z-10 flex items-start justify-center pointer-events-none"
            aria-live="polite"
          >
            <div className="text-center max-w-xl px-8">
              <div
                className="font-display text-lg md:text-xl tracking-[0.4em] mb-6"
                style={{ color: activeChapter.color, opacity: 0.9 }}
              >
                {activeChapter.previewContent.tagline}
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {activeChapter.previewContent.features.map((feature, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 border backdrop-blur-md"
                    style={{
                      borderColor: `${activeChapter.color}30`,
                      background: `${activeChapter.color}10`,
                    }}
                  >
                    <span className="font-mono text-[11px] tracking-wider text-white/70">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="font-serif text-sm italic text-white/50">
                {activeChapter.previewContent.mood}
              </div>
            </div>
          </div>
        )}

        <div className={`absolute bottom-[25%] left-0 right-0 z-20 transition-opacity duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 items-center" role="navigation" aria-label="章节选择">
            {chapters.map((chapter, index) => {
              const completionStatus = getChapterCompletionStatus(chapter.id);
              const isActive = activeChapter?.id === chapter.id;
              
              return (
                <div
                  key={chapter.id}
                  className={`relative transition-all duration-500 cursor-pointer ${
                    isActive
                      ? 'scale-110 opacity-100 z-10'
                      : activeChapter
                        ? 'scale-90 opacity-0 pointer-events-none'
                        : 'scale-100 opacity-100'
                  }`}
                  onMouseEnter={() => !isTransitioning && setActiveChapter(chapter)}
                  onMouseLeave={() => !isTransitioning && setActiveChapter(null)}
                  onClick={() => handleStart(chapter)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${chapter.title}: ${chapter.description}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleStart(chapter);
                    }
                  }}
                >
                  <div
                    className="relative px-8 py-6 transition-colors duration-300"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${chapter.color}15 0%, transparent 60%)`
                        : 'transparent',
                    }}
                  >
                    {isActive && (
                      <>
                        <div className="absolute top-0 left-0 w-5 h-5 border-t border-l" style={{ borderColor: chapter.color, opacity: 0.6 }} aria-hidden="true" />
                        <div className="absolute top-0 right-0 w-5 h-5 border-t border-r" style={{ borderColor: chapter.color, opacity: 0.6 }} aria-hidden="true" />
                        <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l" style={{ borderColor: chapter.color, opacity: 0.6 }} aria-hidden="true" />
                        <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r" style={{ borderColor: chapter.color, opacity: 0.6 }} aria-hidden="true" />
                      </>
                    )}

                    <div className="font-mono text-[10px] text-white/40 mb-2 tracking-[0.2em] text-center">
                      0{index + 1} // {chapter.subtitle}
                    </div>

                    <h2
                      className="font-display text-xl md:text-2xl lg:text-3xl tracking-wider text-center transition-colors duration-300"
                      style={{
                        color: isActive ? chapter.color : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {chapter.title}
                    </h2>

                    {completionStatus && (
                      <div className="mt-2 text-center font-mono text-[10px] text-green-400/70">
                        {completionStatus}
                      </div>
                    )}

                    {isActive && (
                      <div className="mt-3 font-serif text-xs italic text-white/50 text-center max-w-[220px] mx-auto">
                        {chapter.description}
                      </div>
                    )}

                    {isActive && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="w-8 h-px" style={{ background: `${chapter.color}40` }} aria-hidden="true" />
                        <span className="font-mono text-[9px] tracking-wider text-white/40 uppercase">
                          Click to Enter
                        </span>
                        <span className="w-8 h-px" style={{ background: `${chapter.color}40` }} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`absolute top-8 left-0 w-full flex justify-center z-30 transition-opacity duration-1000 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center">
            <h1 className="font-display text-2xl md:text-3xl tracking-[0.3em] text-white/90">EMOTION AGENT</h1>
            <p className="font-serif text-xs text-white/40 mt-2 italic">情绪特工 · 探索心灵深处的秘密</p>
          </div>
        </div>

        <div className="absolute top-8 right-8 z-30 flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-2 border border-white/20 font-mono text-xs tracking-wider text-white/50 transition-colors duration-300 hover:bg-white/5 hover:border-white/40 hover:text-white/70"
            aria-label="打开设置"
          >
            <span>⚙️</span>
            <span className="hidden md:inline">设置</span>
          </button>
          
          {onSaveGame && (
            <button
              onClick={onSaveGame}
              className="flex items-center gap-2 px-3 py-2 border border-amber-400/30 font-mono text-xs tracking-wider text-amber-400/70 transition-colors duration-300 hover:bg-amber-400/5 hover:border-amber-400/50 hover:text-amber-400"
              aria-label="保存游戏"
            >
              <span>💾</span>
              <span className="hidden md:inline">存档</span>
            </button>
          )}
        </div>

        <button
          onClick={onOpenAchievements}
          className="absolute bottom-8 right-8 z-30 flex items-center gap-3 px-4 py-2 border border-white/20 font-mono text-xs tracking-wider text-white/50 transition-colors duration-300 hover:bg-white/5 hover:border-white/40 hover:text-white/70"
          aria-label={`成就: ${totalProgress.unlocked}/${totalProgress.total} 已解锁`}
        >
          <span className="text-lg">🏆</span>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline">{totalProgress.unlocked}/{totalProgress.total}</span>
            <div className="w-16 h-1 bg-white/10 overflow-hidden hidden md:block">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300"
                style={{ width: `${totalProgress.percentage}%` }}
              />
            </div>
          </div>
        </button>

        <div className="absolute bottom-8 left-8 z-30 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[10px] text-white/30">
              游戏时间: {formatPlayTime(progress.totalPlayTime)}
            </div>
            <div className="font-mono text-[10px] text-white/30">
              表情挑战: {progress.emotionTotalSuccess}次成功
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowChallengeMenu(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-white/10 font-mono text-[10px] tracking-wider text-white/30 transition-colors duration-300 hover:bg-white/5 hover:border-white/30 hover:text-white/50"
              aria-label="挑战回溯"
            >
              <span>🔄</span>
              <span>PLAY BACK</span>
            </button>
            
            {onReturnToStart && (
              <button
                onClick={onReturnToStart}
                className="flex items-center gap-2 px-3 py-1.5 border border-white/10 font-mono text-[10px] tracking-wider text-white/30 transition-colors duration-300 hover:bg-white/5 hover:border-white/30 hover:text-white/50"
                aria-label="返回开始界面"
              >
                <span>←</span>
                <span>返回标题</span>
              </button>
            )}
          </div>
        </div>

        {showChallengeMenu && (
          <div 
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm" 
            role="dialog"
            aria-modal="true"
            aria-labelledby="challenge-title"
          >
            <div className="relative w-full max-w-2xl mx-4 p-8 border border-white/20 bg-black/90 max-h-[80vh] overflow-y-auto">
              <button
                onClick={() => setShowChallengeMenu(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
                aria-label="关闭挑战菜单"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              
              <h2 id="challenge-title" className="font-display text-xl tracking-wider text-white/90 mb-6 text-center">
                🔄 PLAY BACK · 挑战回溯
              </h2>
              
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg" aria-hidden="true">🎭</span>
                  <span className="font-display text-sm tracking-wider text-amber-400/80">Chapter 1: A CATTLE'S DAY</span>
                </div>
                <div className="space-y-2" role="list">
                  {challengeNodes.scene1.map((challenge, index) => (
                    <button
                      key={challenge.id}
                      onClick={() => handleStartChallenge('scene1', challenge.id)}
                      className="w-full flex items-center gap-4 p-3 border border-white/10 bg-white/5 transition-colors duration-300 hover:bg-white/10 hover:border-amber-400/30 group"
                      role="listitem"
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-white/20 font-mono text-xs text-white/50">
                        {index + 1}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-display text-sm tracking-wider text-white/80 group-hover:text-white">
                          {challenge.name}
                        </div>
                        <div className="font-mono text-[10px] text-white/40 mt-0.5">
                          目标: {challenge.targetEmotion.toUpperCase()} · {challenge.desc}
                        </div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 group-hover:text-amber-400/60 transition-colors" aria-hidden="true">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg" aria-hidden="true">🩺</span>
                  <span className="font-display text-sm tracking-wider text-purple-400/80">Chapter 3: THERAPY</span>
                </div>
                <div className="space-y-2" role="list">
                  {challengeNodes.scene3.map((challenge, index) => (
                    <button
                      key={challenge.id}
                      onClick={() => handleStartChallenge('scene3', challenge.id)}
                      className="w-full flex items-center gap-4 p-3 border border-white/10 bg-white/5 transition-colors duration-300 hover:bg-white/10 hover:border-purple-400/30 group"
                      role="listitem"
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-white/20 font-mono text-xs text-white/50">
                        {index + 1}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-display text-sm tracking-wider text-white/80 group-hover:text-white">
                          {challenge.name}
                        </div>
                        <div className="font-mono text-[10px] text-white/40 mt-0.5">
                          目标: {challenge.targetEmotion.toUpperCase()} · {challenge.desc}
                        </div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 group-hover:text-purple-400/60 transition-colors" aria-hidden="true">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="font-mono text-[10px] text-white/30">
                  选择任意挑战直接开始 · 失败后可重新挑战
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-6 left-0 w-full flex justify-between px-8 text-[10px] font-mono text-white/30 tracking-widest uppercase z-30">
          <span>Face Expression Interactive</span>
          <span>Emotion Engine v2.0</span>
          <span>2024 Exhibition</span>
        </div>
      </div>
    </>
  );
}
