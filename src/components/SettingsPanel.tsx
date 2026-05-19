import { useState, useEffect } from 'react';
import { useGameStore, useSettings } from '../store/gameStore';
import { useNotificationStore } from '../hooks/useAchievementNotification';
import { ACHIEVEMENT_DEFINITIONS } from '../data/achievements';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const settings = useSettings();
  const updateSettings = useGameStore((state) => state.updateSettings);
  const unlockAchievement = useGameStore((state) => state.unlockAchievement);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'accessibility'>('general');

  useEffect(() => {
    if (isOpen) {
      const state = useGameStore.getState();
      if (!state.progress.achievements.includes('special_open_settings')) {
        unlockAchievement('special_open_settings');
        const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'special_open_settings');
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

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: '通用', icon: '⚙️' },
    { id: 'audio', label: '音频', icon: '🔊' },
    { id: 'accessibility', label: '无障碍', icon: '♿' },
  ] as const;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="relative w-full max-w-lg mx-4 border border-white/20 bg-black/95"
        style={{ maxHeight: '80vh' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 id="settings-title" className="font-display text-lg tracking-wider text-white/90">
            ⚙️ 设置
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white/80 transition-colors"
            aria-label="关闭设置"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-mono text-xs tracking-wider transition-all
                ${activeTab === tab.id 
                  ? 'text-white/90 border-b-2 border-white/60 bg-white/5' 
                  : 'text-white/40 hover:text-white/60'}`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          {activeTab === 'general' && (
            <div className="space-y-6">
              <SettingRow label="文字速度" description="调整对话文字显示速度">
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.25"
                  value={settings.textSpeed}
                  onChange={(e) => updateSettings({ textSpeed: parseFloat(e.target.value) })}
                  className="w-32 accent-white/60"
                  aria-label="文字速度"
                />
                <span className="ml-3 font-mono text-xs text-white/50 w-12">
                  {settings.textSpeed}x
                </span>
              </SettingRow>

              <SettingRow label="自动推进延迟" description="自动推进对话前的等待时间">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={settings.autoAdvanceDelay}
                  onChange={(e) => updateSettings({ autoAdvanceDelay: parseFloat(e.target.value) })}
                  className="w-32 accent-white/60"
                  aria-label="自动推进延迟"
                />
                <span className="ml-3 font-mono text-xs text-white/50 w-12">
                  {settings.autoAdvanceDelay}s
                </span>
              </SettingRow>

              <SettingRow label="摄像头灵敏度" description="表情识别的灵敏度">
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={settings.cameraSensitivity}
                  onChange={(e) => updateSettings({ cameraSensitivity: parseFloat(e.target.value) })}
                  className="w-32 accent-white/60"
                  aria-label="摄像头灵敏度"
                />
                <span className="ml-3 font-mono text-xs text-white/50 w-12">
                  {Math.round(settings.cameraSensitivity * 100)}%
                </span>
              </SettingRow>

              <SettingRow label="语言" description="选择游戏语言">
                <select
                  value={settings.language}
                  onChange={(e) => updateSettings({ language: e.target.value as 'en' | 'cn' })}
                  className="px-3 py-1.5 bg-white/5 border border-white/20 text-white/80 text-sm font-mono focus:outline-none focus:border-white/40"
                  aria-label="语言选择"
                >
                  <option value="cn">中文</option>
                  <option value="en">English</option>
                </select>
              </SettingRow>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              <SettingRow label="背景音乐" description="调整背景音乐音量">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volumeBGM}
                  onChange={(e) => updateSettings({ volumeBGM: parseFloat(e.target.value) })}
                  className="w-32 accent-white/60"
                  aria-label="背景音乐音量"
                />
                <span className="ml-3 font-mono text-xs text-white/50 w-12">
                  {Math.round(settings.volumeBGM * 100)}%
                </span>
              </SettingRow>

              <SettingRow label="音效" description="调整音效音量">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volumeSFX}
                  onChange={(e) => updateSettings({ volumeSFX: parseFloat(e.target.value) })}
                  className="w-32 accent-white/60"
                  aria-label="音效音量"
                />
                <span className="ml-3 font-mono text-xs text-white/50 w-12">
                  {Math.round(settings.volumeSFX * 100)}%
                </span>
              </SettingRow>
            </div>
          )}

          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <SettingRow label="减少动画" description="减少界面动画效果">
                <button
                  onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.reducedMotion ? 'bg-white/60' : 'bg-white/20'
                  }`}
                  role="switch"
                  aria-checked={settings.reducedMotion}
                  aria-label="减少动画开关"
                >
                  <div 
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      settings.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                    }`} 
                  />
                </button>
              </SettingRow>

              <div className="p-4 border border-white/10 bg-white/5">
                <h3 className="font-display text-sm tracking-wider text-white/70 mb-2">
                  键盘快捷键
                </h3>
                <ul className="space-y-2 font-mono text-xs text-white/50">
                  <li><span className="text-white/70">Space / Enter</span> - 推进对话</li>
                  <li><span className="text-white/70">Esc</span> - 返回/打开菜单</li>
                  <li><span className="text-white/70">S</span> - 打开设置</li>
                  <li><span className="text-white/70">A</span> - 打开成就</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-white/20 font-display text-sm tracking-wider text-white/70
              transition-colors duration-300 hover:bg-white/5"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ 
  label, 
  description, 
  children 
}: { 
  label: string; 
  description: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="font-display text-sm tracking-wider text-white/80">{label}</div>
        <div className="font-mono text-xs text-white/40 mt-0.5">{description}</div>
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  );
}
