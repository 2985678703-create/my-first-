import { useState, useMemo, useEffect } from 'react';
import { useGameStore, useProgress, useAchievementProgress } from '../store/gameStore';
import { useNotificationStore } from '../hooks/useAchievementNotification';
import { ACHIEVEMENT_DEFINITIONS, CATEGORY_INFO, RARITY_INFO, AchievementCategory, AchievementDefinition } from '../data/achievements';

interface AchievementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AchievementWithProgress extends AchievementDefinition {
  isUnlocked: boolean;
  unlockedAt?: number;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
}

export default function AchievementPanel({ isOpen, onClose }: AchievementPanelProps) {
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const [showHidden, setShowHidden] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'progress' | 'rarity'>('default');
  
  const progress = useProgress();
  const achievementProgress = useAchievementProgress();
  const getTotalProgress = useGameStore((state) => state.getTotalProgress);
  const getCategoryProgress = useGameStore((state) => state.getCategoryProgress);
  const unlockAchievement = useGameStore((state) => state.unlockAchievement);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    if (isOpen) {
      const state = useGameStore.getState();
      if (!state.progress.achievements.includes('special_check_achievements')) {
        unlockAchievement('special_check_achievements');
        const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'special_check_achievements');
        if (achievement) {
          addNotification({
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            rarity: achievement.rarity,
          });
        }
      }
    }
  }, [isOpen, unlockAchievement, addNotification]);

  const totalProgress = getTotalProgress();

  const achievements = useMemo(() => {
    let filtered: AchievementWithProgress[] = ACHIEVEMENT_DEFINITIONS.map((achievement) => {
      const isUnlocked = progress.achievements.includes(achievement.id);
      const progressData = achievementProgress[achievement.id];
      
      let current = progressData?.current || 0;
      if (isUnlocked) {
        current = achievement.requirement.value;
      }

      return {
        ...achievement,
        isUnlocked,
        unlockedAt: progressData?.unlockedAt,
        progress: {
          current,
          target: achievement.requirement.value,
          percentage: Math.min(100, Math.round((current / achievement.requirement.value) * 100)),
        },
      };
    });

    if (!showHidden) {
      filtered = filtered.filter(a => !a.isHidden || a.isUnlocked);
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter(a => a.category === activeCategory);
    }

    if (sortBy === 'progress') {
      filtered.sort((a, b) => b.progress.percentage - a.progress.percentage);
    } else if (sortBy === 'rarity') {
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      filtered.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    }

    return filtered;
  }, [progress.achievements, achievementProgress, showHidden, activeCategory, sortBy]);

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievements-title"
    >
      <div 
        className="relative w-full max-w-4xl mx-4 border border-white/20 bg-black/95"
        style={{ maxHeight: '85vh' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <h2 id="achievements-title" className="font-display text-xl tracking-wider text-white/90">
              🏆 成就
            </h2>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-white/20 bg-white/5">
              <span className="font-mono text-sm text-white/70">
                {totalProgress.unlocked}/{totalProgress.total}
              </span>
              <div className="w-24 h-1.5 bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-300"
                  style={{ width: `${totalProgress.percentage}%` }}
                />
              </div>
              <span className="font-mono text-xs text-amber-400">
                {totalProgress.percentage}%
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white/80 transition-colors"
            aria-label="关闭成就面板"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-xs tracking-wider transition-all whitespace-nowrap
              ${activeCategory === 'all' 
                ? 'text-white/90 border-b-2 border-white/60 bg-white/5' 
                : 'text-white/40 hover:text-white/60'}`}
          >
            <span>全部</span>
            <span className="px-1.5 py-0.5 bg-white/10 text-[10px]">{ACHIEVEMENT_DEFINITIONS.length}</span>
          </button>
          {(Object.entries(CATEGORY_INFO) as [AchievementCategory, typeof CATEGORY_INFO.story][]).map(([key, info]) => {
            const catProgress = getCategoryProgress(key);
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-2 px-4 py-3 font-mono text-xs tracking-wider transition-all whitespace-nowrap
                  ${activeCategory === key 
                    ? 'text-white/90 border-b-2 bg-white/5' 
                    : 'text-white/40 hover:text-white/60'}`}
                style={{ 
                  borderColor: activeCategory === key ? info.color : 'transparent',
                  color: activeCategory === key ? info.color : undefined,
                }}
              >
                <span>{info.icon}</span>
                <span className="hidden md:inline">{info.name}</span>
                <span className="px-1.5 py-0.5 bg-white/10 text-[10px]">{catProgress.unlocked}/{catProgress.total}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHidden(!showHidden)}
              className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-xs transition-all
                ${showHidden ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400' : 'border-white/10 text-white/40 hover:text-white/60'}`}
            >
              <span>🔮</span>
              <span>显示隐藏</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-white/30">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'default' | 'progress' | 'rarity')}
              className="px-2 py-1 bg-white/5 border border-white/10 text-white/70 text-xs font-mono focus:outline-none focus:border-white/30"
            >
              <option value="default">默认</option>
              <option value="progress">进度</option>
              <option value="rarity">稀有度</option>
            </select>
          </div>
        </div>

        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 200px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between text-[10px] font-mono text-white/30">
            <div className="flex items-center gap-4">
              <span>游戏时间: {formatPlayTime(progress.totalPlayTime)}</span>
              <span>表情挑战: {progress.emotionTotalSuccess}次成功</span>
            </div>
            <div className="flex items-center gap-2">
              {Object.entries(RARITY_INFO).map(([key, info]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: info.color }} />
                  <span>{info.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: AchievementWithProgress }) {
  const [expanded, setExpanded] = useState(false);
  const categoryInfo = CATEGORY_INFO[achievement.category];
  const rarityInfo = RARITY_INFO[achievement.rarity];
  const isHiddenAndLocked = achievement.isHidden && !achievement.isUnlocked;

  return (
    <div
      className={`relative border transition-all duration-300 cursor-pointer
        ${achievement.isUnlocked 
          ? 'border-white/20 bg-white/5' 
          : 'border-white/10 bg-white/[0.02]'}`}
      style={{
        boxShadow: achievement.isUnlocked ? `0 0 20px ${rarityInfo.glowColor}` : 'none',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {achievement.isUnlocked && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${rarityInfo.color}10 0%, transparent 50%)`,
          }}
        />
      )}

      <div className="relative p-4">
        <div className="flex items-start gap-3">
          <div 
            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center text-2xl border transition-all
              ${achievement.isUnlocked ? 'border-white/30' : 'border-white/10 grayscale opacity-40'}`}
            style={{
              background: achievement.isUnlocked 
                ? `radial-gradient(circle, ${rarityInfo.glowColor}, transparent)` 
                : 'transparent',
            }}
          >
            {isHiddenAndLocked ? '❓' : achievement.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="font-display text-sm tracking-wider truncate"
                style={{ color: achievement.isUnlocked ? rarityInfo.color : 'rgba(255,255,255,0.3)' }}
              >
                {isHiddenAndLocked ? '???' : achievement.name}
              </span>
              <span 
                className="px-1.5 py-0.5 font-mono text-[9px] tracking-wider border"
                style={{ 
                  color: rarityInfo.color, 
                  borderColor: `${rarityInfo.color}40`,
                  background: `${rarityInfo.color}15`,
                }}
              >
                {rarityInfo.name}
              </span>
              {achievement.reward && (
                <span className="px-1.5 py-0.5 font-mono text-[9px] tracking-wider border border-amber-400/30 bg-amber-400/10 text-amber-400">
                  🎁
                </span>
              )}
            </div>

            <p className="font-serif text-xs text-white/40 line-clamp-2 mb-2">
              {isHiddenAndLocked ? '隐藏成就 - 继续探索来解锁' : achievement.description}
            </p>

            {!achievement.isUnlocked && !isHiddenAndLocked && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/10 overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${achievement.progress.percentage}%`,
                      background: `linear-gradient(90deg, ${categoryInfo.color}80, ${categoryInfo.color})`,
                    }}
                  />
                </div>
                <span className="font-mono text-[10px] text-white/30">
                  {achievement.progress.current}/{achievement.progress.target}
                </span>
              </div>
            )}

            {achievement.isUnlocked && achievement.unlockedAt && (
              <div className="font-mono text-[10px] text-white/30">
                解锁于 {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
              </div>
            )}
          </div>

          <div 
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
            style={{ color: categoryInfo.color }}
          >
            {categoryInfo.icon}
          </div>
        </div>

        {expanded && !isHiddenAndLocked && achievement.lore && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="font-serif text-xs text-white/50 italic leading-relaxed">
              "{achievement.lore}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
