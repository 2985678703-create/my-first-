// 表情类型 - 参考 face-api.js 的表情识别输出
export type EmotionType = 
  | 'neutral'    // 平淡
  | 'happy'      // 开心/笑脸
  | 'sad'        // 悲伤
  | 'angry'      // 愤怒
  | 'fearful'    // 恐惧
  | 'disgusted'  // 厌恶
  | 'surprised'; // 惊讶

// 表情识别结果
export interface EmotionResult {
  dominant: EmotionType;
  confidence: number;
  all: Record<EmotionType, number>;
}

// 对话节点
export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  speakerPosition?: 'left' | 'right' | 'center';
  emotion?: string; // 说话者的表情描述
  background?: string; // 背景CSS
  autoNext?: boolean; // 是否自动跳转
  autoNextDelay?: number; // 自动跳转延迟(ms)
  nextId?: string; // 下一个对话ID
  waitForEmotion?: boolean; // 是否等待玩家表情
  requiredEmotion?: EmotionType; // 需要的表情
  emotionBranches?: Record<EmotionType, string>; // 表情分支
  isEnding?: boolean; // 是否是结局
  endingType?: 'good' | 'bad' | 'neutral'; // 结局类型
  cgType?: 'warm' | 'tense' | 'angry'; // CG类型
  screenEffect?: 'shake' | 'flash' | 'fade' | 'blur' | 'none'; // 屏幕效果
  characterArt?: string; // 角色立绘标识
}

// 场景定义
export interface SceneDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  dialogues: Record<string, DialogueNode>;
  startId: string;
}

// 游戏状态
export interface GameState {
  currentScene: string | null;
  currentDialogueId: string | null;
  emotionDetected: boolean;
  isTransitioning: boolean;
}
