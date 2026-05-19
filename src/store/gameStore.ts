import { create } from 'zustand';
import { EmotionType } from '../types/game';
import { ACHIEVEMENT_DEFINITIONS, AchievementDefinition, AchievementCategory, AchievementRarity } from '../data/achievements';

interface GameSettings {
  textSpeed: number;
  autoAdvanceDelay: number;
  cameraSensitivity: number;
  volumeBGM: number;
  volumeSFX: number;
  language: 'en' | 'cn';
  reducedMotion: boolean;
}

interface AchievementProgress {
  [key: string]: {
    current: number;
    target: number;
    unlockedAt?: number;
  };
}

interface GameProgress {
  unlockedChapters: string[];
  completedEndings: Record<string, string[]>;
  completedChallenges: string[];
  scene2Completed: boolean;
  achievements: string[];
  totalPlayTime: number;
  lastPlayedAt: number | null;
  chapterStartTime: number | null;
  emotionStreak: number;
  emotionTotalSuccess: number;
  retryCount: number;
  usedManualMode: boolean;
  challengeReplays: string[];
  goodEndings: number;
  badEndings: number;
  perfectChapters: number;
}

interface UnlockedTitle {
  id: string;
  name: string;
  unlockedAt: number;
}

interface GameState {
  currentScene: string | null;
  currentDialogueId: string | null;
  isTransitioning: boolean;
  emotionDetected: boolean;
  settings: GameSettings;
  progress: GameProgress;
  achievementProgress: AchievementProgress;
  unlockedTitles: UnlockedTitle[];
  hasSaveData: boolean;
}

interface GameActions {
  setCurrentScene: (scene: string | null) => void;
  setCurrentDialogueId: (id: string | null) => void;
  setTransitioning: (value: boolean) => void;
  setEmotionDetected: (value: boolean) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  unlockChapter: (chapterId: string) => void;
  completeEnding: (chapterId: string, endingType: string) => void;
  completeChallenge: (challengeId: string) => void;
  completeScene2: () => void;
  unlockAchievement: (achievementId: string) => void;
  updatePlayTime: (seconds: number) => void;
  resetProgress: () => void;
  incrementCounter: (counter: string, value?: number) => void;
  resetStreak: (streakType: string) => void;
  startChapterTimer: () => void;
  checkAchievements: () => string[];
  getAchievementProgress: (achievementId: string) => { current: number; target: number; percentage: number };
  getAllAchievements: () => (AchievementDefinition & { unlockedAt?: number; progress: { current: number; target: number; percentage: number } })[];
  getCategoryProgress: (category: AchievementCategory) => { unlocked: number; total: number };
  getTotalProgress: () => { unlocked: number; total: number; percentage: number };
  saveGame: () => void;
  loadGame: () => boolean;
  checkSaveData: () => boolean;
  deleteSaveData: () => void;
}

const defaultSettings: GameSettings = {
  textSpeed: 1,
  autoAdvanceDelay: 3,
  cameraSensitivity: 0.3,
  volumeBGM: 0.7,
  volumeSFX: 0.8,
  language: 'cn',
  reducedMotion: false,
};

const defaultProgress: GameProgress = {
  unlockedChapters: ['scene1', 'scene2', 'scene3'],
  completedEndings: {},
  completedChallenges: [],
  scene2Completed: false,
  achievements: [],
  totalPlayTime: 0,
  lastPlayedAt: null,
  chapterStartTime: null,
  emotionStreak: 0,
  emotionTotalSuccess: 0,
  retryCount: 0,
  usedManualMode: false,
  challengeReplays: [],
  goodEndings: 0,
  badEndings: 0,
  perfectChapters: 0,
};

const defaultAchievementProgress: AchievementProgress = {};

const SAVE_KEY = 'emotion-agent-save-data';

export const useGameStore = create<GameState & GameActions>()(
  (set, get) => ({
    currentScene: null,
    currentDialogueId: null,
    isTransitioning: false,
    emotionDetected: false,
    settings: defaultSettings,
    progress: defaultProgress,
    achievementProgress: defaultAchievementProgress,
    unlockedTitles: [],
    hasSaveData: false,

    setCurrentScene: (scene) => set({ currentScene: scene }),
    setCurrentDialogueId: (id) => set({ currentDialogueId: id }),
    setTransitioning: (value) => set({ isTransitioning: value }),
    setEmotionDetected: (value) => set({ emotionDetected: value }),

    updateSettings: (newSettings) =>
      set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),

    unlockChapter: (chapterId) =>
      set((state) => ({
        progress: {
          ...state.progress,
          unlockedChapters: state.progress.unlockedChapters.includes(chapterId)
            ? state.progress.unlockedChapters
            : [...state.progress.unlockedChapters, chapterId],
        },
      })),

    completeEnding: (chapterId, endingType) =>
      set((state) => {
        const existingEndings = state.progress.completedEndings[chapterId] || [];
        const newEndingType = endingType as 'good' | 'bad' | 'neutral';
        
        return {
          progress: {
            ...state.progress,
            completedEndings: {
              ...state.progress.completedEndings,
              [chapterId]: existingEndings.includes(endingType)
                ? existingEndings
                : [...existingEndings, endingType],
            },
            goodEndings: newEndingType === 'good' ? state.progress.goodEndings + 1 : state.progress.goodEndings,
            badEndings: newEndingType === 'bad' ? state.progress.badEndings + 1 : state.progress.badEndings,
          },
        };
      }),

    unlockAchievement: (achievementId) => {
      const state = get();
      const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
      
      if (!achievement || state.progress.achievements.includes(achievementId)) {
        return;
      }

      const now = Date.now();
      
      set((state) => ({
        progress: {
          ...state.progress,
          achievements: [...state.progress.achievements, achievementId],
        },
        achievementProgress: {
          ...state.achievementProgress,
          [achievementId]: {
            current: achievement.requirement.value,
            target: achievement.requirement.value,
            unlockedAt: now,
          },
        },
        unlockedTitles: achievement.reward?.type === 'title' 
          ? [...state.unlockedTitles, { id: achievement.id, name: achievement.reward.value, unlockedAt: now }]
          : state.unlockedTitles,
      }));
    },

    updatePlayTime: (seconds) =>
      set((state) => ({
        progress: {
          ...state.progress,
          totalPlayTime: state.progress.totalPlayTime + seconds,
          lastPlayedAt: Date.now(),
        },
      })),

    resetProgress: () =>
      set({
        progress: defaultProgress,
        achievementProgress: defaultAchievementProgress,
        unlockedTitles: [],
      }),

    incrementCounter: (counter, value = 1) =>
      set((state) => {
        const currentProgress = state.achievementProgress[counter] || { current: 0, target: 0 };
        const newValue = (currentProgress.current || 0) + value;
        
        const progressUpdates: Partial<GameProgress> = {};
        
        if (counter === 'emotion_streak') {
          progressUpdates.emotionStreak = (state.progress.emotionStreak || 0) + value;
        }
        if (counter === 'emotion_total_success') {
          progressUpdates.emotionTotalSuccess = (state.progress.emotionTotalSuccess || 0) + value;
        }
        if (counter === 'retry_count') {
          progressUpdates.retryCount = (state.progress.retryCount || 0) + value;
        }
        if (counter === 'good_endings') {
          progressUpdates.goodEndings = (state.progress.goodEndings || 0) + value;
        }
        if (counter === 'bad_endings') {
          progressUpdates.badEndings = (state.progress.badEndings || 0) + value;
        }
        if (counter === 'play_time_hours') {
          progressUpdates.totalPlayTime = state.progress.totalPlayTime + (value * 3600);
        }
        
        return {
          achievementProgress: {
            ...state.achievementProgress,
            [counter]: {
              ...currentProgress,
              current: newValue,
            },
          },
          progress: {
            ...state.progress,
            ...progressUpdates,
          },
        };
      }),

    resetStreak: (streakType) =>
      set((state) => ({
        progress: {
          ...state.progress,
          [streakType]: 0,
        },
      })),

    completeChallenge: (challengeId) =>
      set((state) => ({
        progress: {
          ...state.progress,
          completedChallenges: state.progress.completedChallenges.includes(challengeId)
            ? state.progress.completedChallenges
            : [...state.progress.completedChallenges, challengeId],
        },
      })),

    completeScene2: () =>
      set((state) => ({
        progress: {
          ...state.progress,
          scene2Completed: true,
        },
      })),

    startChapterTimer: () =>
      set((state) => ({
        progress: {
          ...state.progress,
          chapterStartTime: Date.now(),
        },
      })),

    checkAchievements: () => {
      const state = get();
      const newlyUnlocked: string[] = [];

      ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
        if (state.progress.achievements.includes(achievement.id)) return;

        let shouldUnlock = false;
        const { type, target, value } = achievement.requirement;

        switch (target) {
          case 'game_launch':
            shouldUnlock = true;
            break;
          case 'complete_scene1':
            shouldUnlock = state.progress.completedEndings['scene1']?.length > 0;
            break;
          case 'complete_scene2':
            shouldUnlock = state.progress.completedEndings['scene2']?.length > 0;
            break;
          case 'complete_scene3':
            shouldUnlock = state.progress.completedEndings['scene3']?.length > 0;
            break;
          case 'complete_all_chapters': {
            const completedChapters = ['scene1', 'scene2', 'scene3'].filter(
              s => state.progress.completedEndings[s]?.length > 0
            ).length;
            shouldUnlock = completedChapters >= value;
            break;
          }
          case 'emotion_success':
            shouldUnlock = state.progress.emotionTotalSuccess >= value;
            break;
          case 'emotion_streak':
            shouldUnlock = state.progress.emotionStreak >= value;
            break;
          case 'emotion_total_success':
            shouldUnlock = state.progress.emotionTotalSuccess >= value;
            break;
          case 'good_ending':
            shouldUnlock = state.progress.goodEndings >= value;
            break;
          case 'good_endings':
            shouldUnlock = state.progress.goodEndings >= value;
            break;
          case 'bad_ending':
            shouldUnlock = state.progress.badEndings >= value;
            break;
          case 'all_endings': {
            const totalEndings = state.progress.goodEndings + state.progress.badEndings;
            shouldUnlock = totalEndings >= value;
            break;
          }
          case 'retry_count':
            shouldUnlock = state.progress.retryCount >= value;
            break;
          case 'replay_all_challenges':
            shouldUnlock = state.progress.challengeReplays?.length >= value;
            break;
          case 'play_time_hours':
            shouldUnlock = state.progress.totalPlayTime >= value * 3600;
            break;
          case 'night_play': {
            const hour = new Date().getHours();
            shouldUnlock = hour >= 0 && hour < 5;
            break;
          }
          case 'return_player':
            if (state.progress.lastPlayedAt) {
              const daysDiff = (Date.now() - state.progress.lastPlayedAt) / (1000 * 60 * 60 * 24);
              shouldUnlock = daysDiff >= 1;
            }
            break;
          case 'speedrun': {
            if (state.progress.chapterStartTime) {
              const elapsed = (Date.now() - state.progress.chapterStartTime) / 1000 / 60;
              shouldUnlock = elapsed <= 30 && Object.values(state.progress.completedEndings).some((e: string[]) => e.length > 0);
            }
            break;
          }
          case 'no_manual_mode':
            shouldUnlock = !state.progress.usedManualMode && state.progress.emotionTotalSuccess >= 6;
            break;
          case 'perfect_chapter':
            shouldUnlock = state.progress.perfectChapters && state.progress.perfectChapters >= value;
            break;
          case 'open_settings':
          case 'view_achievements':
            break;
        }

        if (shouldUnlock) {
          get().unlockAchievement(achievement.id);
          newlyUnlocked.push(achievement.id);
        }
      });

      return newlyUnlocked;
    },

    getAchievementProgress: (achievementId) => {
      const state = get();
      const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
      
      if (!achievement) {
        return { current: 0, target: 0, percentage: 0 };
      }

      const progress = state.achievementProgress[achievementId];
      const current = progress?.current || 0;
      const target = achievement.requirement.value;
      const percentage = Math.min(100, Math.round((current / target) * 100));

      return { current, target, percentage };
    },

    getAllAchievements: () => {
      const state = get();
      
      return ACHIEVEMENT_DEFINITIONS.map((achievement) => {
        const progress = state.achievementProgress[achievement.id];
        const unlockedAt = progress?.unlockedAt;
        
        let current = progress?.current || 0;
        if (state.progress.achievements.includes(achievement.id)) {
          current = achievement.requirement.value;
        }

        return {
          ...achievement,
          unlockedAt,
          progress: {
            current,
            target: achievement.requirement.value,
            percentage: Math.min(100, Math.round((current / achievement.requirement.value) * 100)),
          },
        };
      });
    },

    getCategoryProgress: (category) => {
      const state = get();
      const categoryAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => a.category === category);
      const unlocked = categoryAchievements.filter(a => 
        state.progress.achievements.includes(a.id)
      ).length;
      
      return { unlocked, total: categoryAchievements.length };
    },

    getTotalProgress: () => {
      const state = get();
      const unlocked = state.progress.achievements.length;
      const total = ACHIEVEMENT_DEFINITIONS.length;
      const percentage = Math.round((unlocked / total) * 100);
      
      return { unlocked, total, percentage };
    },

    saveGame: () => {
      const state = get();
      const saveData = {
        settings: state.settings,
        progress: state.progress,
        achievementProgress: state.achievementProgress,
        unlockedTitles: state.unlockedTitles,
        savedAt: Date.now(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      set({ hasSaveData: true });
    },

    loadGame: () => {
      try {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (!savedData) return false;
        
        const data = JSON.parse(savedData);
        set({
          settings: data.settings || defaultSettings,
          progress: data.progress || defaultProgress,
          achievementProgress: data.achievementProgress || defaultAchievementProgress,
          unlockedTitles: data.unlockedTitles || [],
          hasSaveData: true,
        });
        return true;
      } catch {
        return false;
      }
    },

    checkSaveData: () => {
      const savedData = localStorage.getItem(SAVE_KEY);
      const hasData = !!savedData;
      set({ hasSaveData: hasData });
      return hasData;
    },

    deleteSaveData: () => {
      localStorage.removeItem(SAVE_KEY);
      set({
        progress: defaultProgress,
        achievementProgress: defaultAchievementProgress,
        unlockedTitles: [],
        hasSaveData: false,
      });
    },
  })
);

export const useSettings = () => useGameStore((state) => state.settings);
export const useProgress = () => useGameStore((state) => state.progress);
export const useAchievementProgress = () => useGameStore((state) => state.achievementProgress);
