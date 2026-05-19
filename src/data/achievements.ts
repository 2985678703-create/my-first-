export type AchievementCategory = 'story' | 'challenge' | 'collection' | 'hidden' | 'special';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementDefinition {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  isHidden: boolean;
  requirement: {
    type: 'single' | 'progress' | 'counter';
    target: string;
    value: number;
    currentValue?: number;
  };
  reward?: {
    type: 'title' | 'badge' | 'unlock';
    value: string;
  };
  lore?: string;
  relatedChapter?: string;
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  unlockedAt?: number;
  notifiedAt?: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // ===== 剧情类成就 =====
  {
    id: 'story_first_launch',
    name: '初入梦境',
    nameEn: 'First Dream',
    description: '首次启动游戏，踏入情绪特工的世界',
    descriptionEn: 'Launch the game for the first time',
    icon: '🌙',
    category: 'story',
    rarity: 'common',
    isHidden: false,
    requirement: { type: 'single', target: 'game_launch', value: 1 },
    lore: '每一个伟大的旅程都始于第一步。欢迎来到情绪特工的世界。',
  },
  {
    id: 'story_complete_chapter1',
    name: '社畜觉醒',
    nameEn: 'Corporate Awakening',
    description: '完成第一章「社畜的一天」，体验职场人的梦境',
    descriptionEn: 'Complete Chapter 1: A Cattle\'s Day',
    icon: '💼',
    category: 'story',
    rarity: 'common',
    isHidden: false,
    requirement: { type: 'single', target: 'complete_scene1', value: 1 },
    relatedChapter: 'scene1',
    lore: '在无尽的加班与会议中，一个灵魂开始觉醒...',
  },
  {
    id: 'story_complete_chapter2',
    name: '梦境探索者',
    nameEn: 'Dream Explorer',
    description: '完成第二章「梦境潜入」，探索叶成武的内心世界',
    descriptionEn: 'Complete Chapter 2: Dream Dive',
    icon: '🔮',
    category: 'story',
    rarity: 'rare',
    isHidden: false,
    requirement: { type: 'single', target: 'complete_scene2', value: 1 },
    relatedChapter: 'scene2',
    lore: '四层梦境，四种情绪，一个破碎的灵魂等待被治愈。',
  },
  {
    id: 'story_complete_chapter3',
    name: '心灵治愈师',
    nameEn: 'Soul Healer',
    description: '完成第三章「治疗」，帮助叶成武重获新生',
    descriptionEn: 'Complete Chapter 3: Therapy',
    icon: '🩺',
    category: 'story',
    rarity: 'rare',
    isHidden: false,
    requirement: { type: 'single', target: 'complete_scene3', value: 1 },
    relatedChapter: 'scene3',
    lore: '从梦境回到现实，真正的治愈才刚刚开始。',
  },
  {
    id: 'story_complete_all',
    name: '命运编织者',
    nameEn: 'Fate Weaver',
    description: '完成全部三章，见证完整的故事',
    descriptionEn: 'Complete all three chapters',
    icon: '🎭',
    category: 'story',
    rarity: 'epic',
    isHidden: false,
    requirement: { type: 'counter', target: 'complete_all_chapters', value: 3 },
    reward: { type: 'title', value: '命运编织者' },
    lore: '你已经走完了整个旅程，但故事永远不会真正结束。',
  },

  // ===== 挑战类成就 =====
  {
    id: 'challenge_first_success',
    name: '初次尝试',
    nameEn: 'First Attempt',
    description: '首次成功完成表情挑战',
    descriptionEn: 'Complete your first emotion challenge',
    icon: '🎯',
    category: 'challenge',
    rarity: 'common',
    isHidden: false,
    requirement: { type: 'single', target: 'emotion_success', value: 1 },
  },
  {
    id: 'challenge_streak_3',
    name: '渐入佳境',
    nameEn: 'Getting Better',
    description: '连续成功完成3次表情挑战',
    descriptionEn: 'Complete 3 emotion challenges in a row',
    icon: '🔥',
    category: 'challenge',
    rarity: 'rare',
    isHidden: false,
    requirement: { type: 'counter', target: 'emotion_streak', value: 3 },
  },
  {
    id: 'challenge_streak_5',
    name: '表情大师',
    nameEn: 'Expression Master',
    description: '连续成功完成5次表情挑战',
    descriptionEn: 'Complete 5 emotion challenges in a row',
    icon: '😎',
    category: 'challenge',
    rarity: 'epic',
    isHidden: false,
    requirement: { type: 'counter', target: 'emotion_streak', value: 5 },
    reward: { type: 'badge', value: 'master' },
  },
  {
    id: 'challenge_streak_10',
    name: '情绪之神',
    nameEn: 'Emotion God',
    description: '连续成功完成10次表情挑战',
    descriptionEn: 'Complete 10 emotion challenges in a row',
    icon: '👑',
    category: 'challenge',
    rarity: 'legendary',
    isHidden: false,
    requirement: { type: 'counter', target: 'emotion_streak', value: 10 },
    reward: { type: 'title', value: '情绪之神' },
  },
  {
    id: 'challenge_total_20',
    name: '千面之人',
    nameEn: 'Thousand Faces',
    description: '累计成功完成20次表情挑战',
    descriptionEn: 'Complete 20 emotion challenges in total',
    icon: '🎭',
    category: 'challenge',
    rarity: 'epic',
    isHidden: false,
    requirement: { type: 'counter', target: 'emotion_total_success', value: 20 },
  },
  {
    id: 'challenge_perfect_chapter',
    name: '完美演绎',
    nameEn: 'Perfect Performance',
    description: '在一个章节中所有表情挑战全部成功',
    descriptionEn: 'Complete all emotion challenges in one chapter perfectly',
    icon: '⭐',
    category: 'challenge',
    rarity: 'epic',
    isHidden: false,
    requirement: { type: 'single', target: 'perfect_chapter', value: 1 },
  },

  // ===== 收集类成就 =====
  {
    id: 'collection_good_ending',
    name: '希望之光',
    nameEn: 'Light of Hope',
    description: '达成任意好结局',
    descriptionEn: 'Achieve any good ending',
    icon: '✨',
    category: 'collection',
    rarity: 'rare',
    isHidden: false,
    requirement: { type: 'single', target: 'good_ending', value: 1 },
  },
  {
    id: 'collection_all_good_endings',
    name: '圆满结局',
    nameEn: 'Perfect Endings',
    description: '达成所有好结局',
    descriptionEn: 'Achieve all good endings',
    icon: '🌈',
    category: 'collection',
    rarity: 'legendary',
    isHidden: false,
    requirement: { type: 'counter', target: 'good_endings', value: 3 },
    reward: { type: 'title', value: '圆满使者' },
  },
  {
    id: 'collection_bad_ending',
    name: '遗憾之影',
    nameEn: 'Shadow of Regret',
    description: '达成任意坏结局',
    descriptionEn: 'Achieve any bad ending',
    icon: '💔',
    category: 'collection',
    rarity: 'common',
    isHidden: false,
    requirement: { type: 'single', target: 'bad_ending', value: 1 },
    lore: '有时候，失败也是一种成长。',
  },
  {
    id: 'collection_all_endings',
    name: '命运全知者',
    nameEn: 'All-Knowing',
    description: '解锁所有结局（好结局+坏结局）',
    descriptionEn: 'Unlock all endings',
    icon: '🔮',
    category: 'collection',
    rarity: 'legendary',
    isHidden: false,
    requirement: { type: 'counter', target: 'all_endings', value: 6 },
    reward: { type: 'badge', value: 'oracle' },
    lore: '你已经见证了所有可能性的尽头。',
  },
  {
    id: 'collection_retry_5',
    name: '永不放弃',
    nameEn: 'Never Give Up',
    description: '在失败后重新挑战5次',
    descriptionEn: 'Retry 5 times after failure',
    icon: '🔄',
    category: 'collection',
    rarity: 'common',
    isHidden: false,
    requirement: { type: 'counter', target: 'retry_count', value: 5 },
  },

  // ===== 隐藏类成就 =====
  {
    id: 'hidden_speedrun',
    name: '梦境速通',
    nameEn: 'Speed Dreamer',
    description: '在30分钟内完成任意章节',
    descriptionEn: 'Complete any chapter in under 30 minutes',
    icon: '⚡',
    category: 'hidden',
    rarity: 'epic',
    isHidden: true,
    requirement: { type: 'single', target: 'speedrun', value: 1 },
  },
  {
    id: 'hidden_explore_all',
    name: '探索者',
    nameEn: 'Explorer',
    description: '尝试所有章节的挑战回溯模式',
    descriptionEn: 'Try all challenge replay modes',
    icon: '🗺️',
    category: 'hidden',
    rarity: 'rare',
    isHidden: true,
    requirement: { type: 'counter', target: 'replay_all_challenges', value: 6 },
  },
  {
    id: 'hidden_night_owl',
    name: '夜猫子',
    nameEn: 'Night Owl',
    description: '在深夜（0:00-5:00）游玩游戏',
    descriptionEn: 'Play the game during midnight hours',
    icon: '🦉',
    category: 'hidden',
    rarity: 'rare',
    isHidden: true,
    requirement: { type: 'single', target: 'night_play', value: 1 },
    lore: '深夜是情绪最敏感的时刻...',
  },
  {
    id: 'hidden_dedication',
    name: '执着之心',
    nameEn: 'Dedication',
    description: '累计游戏时间超过5小时',
    descriptionEn: 'Play for over 5 hours in total',
    icon: '❤️',
    category: 'hidden',
    rarity: 'epic',
    isHidden: true,
    requirement: { type: 'counter', target: 'play_time_hours', value: 5 },
  },
  {
    id: 'hidden_perfect_streak',
    name: '完美主义',
    nameEn: 'Perfectionist',
    description: '不使用手动模式完成所有表情挑战',
    descriptionEn: 'Complete all challenges without manual mode',
    icon: '🏆',
    category: 'hidden',
    rarity: 'legendary',
    isHidden: true,
    requirement: { type: 'single', target: 'no_manual_mode', value: 1 },
  },

  // ===== 特殊成就 =====
  {
    id: 'special_open_settings',
    name: '好奇心',
    nameEn: 'Curiosity',
    description: '打开设置面板查看游戏选项',
    descriptionEn: 'Open the settings panel',
    icon: '⚙️',
    category: 'special',
    rarity: 'common',
    isHidden: false,
    requirement: { type: 'single', target: 'open_settings', value: 1 },
  },
  {
    id: 'special_check_achievements',
    name: '成就猎人',
    nameEn: 'Achievement Hunter',
    description: '查看成就面板',
    descriptionEn: 'View the achievements panel',
    icon: '🏅',
    category: 'special',
    rarity: 'common',
    isHidden: false,
    requirement: { type: 'single', target: 'view_achievements', value: 1 },
  },
  {
    id: 'special_return_player',
    name: '归来的旅人',
    nameEn: 'Returning Traveler',
    description: '在隔天后再次启动游戏',
    descriptionEn: 'Launch the game again after a day',
    icon: '🌅',
    category: 'special',
    rarity: 'rare',
    isHidden: false,
    requirement: { type: 'single', target: 'return_player', value: 1 },
    lore: '欢迎回来，情绪特工。梦境在等待你的归来。',
  },
];

export const CATEGORY_INFO: Record<AchievementCategory, { name: string; nameEn: string; icon: string; color: string }> = {
  story: { name: '剧情', nameEn: 'Story', icon: '📖', color: '#60a5fa' },
  challenge: { name: '挑战', nameEn: 'Challenge', icon: '🎯', color: '#f87171' },
  collection: { name: '收集', nameEn: 'Collection', icon: '💎', color: '#a78bfa' },
  hidden: { name: '隐藏', nameEn: 'Hidden', icon: '🔮', color: '#4ade80' },
  special: { name: '特殊', nameEn: 'Special', icon: '⭐', color: '#fbbf24' },
};

export const RARITY_INFO: Record<AchievementRarity, { name: string; nameEn: string; color: string; glowColor: string }> = {
  common: { name: '普通', nameEn: 'Common', color: '#9ca3af', glowColor: 'rgba(156, 163, 175, 0.15)' },
  rare: { name: '稀有', nameEn: 'Rare', color: '#60a5fa', glowColor: 'rgba(96, 165, 250, 0.2)' },
  epic: { name: '史诗', nameEn: 'Epic', color: '#a78bfa', glowColor: 'rgba(167, 139, 250, 0.25)' },
  legendary: { name: '传说', nameEn: 'Legendary', color: '#fbbf24', glowColor: 'rgba(251, 191, 36, 0.3)' },
};
