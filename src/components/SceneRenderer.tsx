import { useState, useCallback, useEffect } from 'react';
import { DialogueNode, EmotionType } from '../types/game';
import DialogBox from './DialogBox';
import CharacterArt from './CharacterArt';
import EmotionChoice from './EmotionChoice';
import CustomCursor from './CustomCursor';
import SceneProgressBar from './SceneProgressBar';
import EndingScreen from './EndingScreen';
import { useGameStore, useSettings, useProgress } from '../store/gameStore';
import { useNotificationStore } from '../hooks/useAchievementNotification';
import { ACHIEVEMENT_DEFINITIONS } from '../data/achievements';

interface SceneRendererProps {
  dialogues: Record<string, DialogueNode>;
  startId: string;
  onExit: () => void;
  sceneTitle: string;
  sceneColor?: string;
  onOpenSettings?: () => void;
}

const emotionChallengeNodes: Record<string, string> = {
  'challenge_1_fail': 'challenge_1',
  'challenge_1_fail_2': 'challenge_1',
  'challenge_1_fail_3': 'challenge_1',
  'challenge_1_fail_4': 'challenge_1',
  'challenge_2_fail': 'challenge_2',
  'challenge_2_fail_2': 'challenge_2',
  'challenge_2_fail_3': 'challenge_2',
  'challenge_2_fail_4': 'challenge_2',
  'challenge_3_fail': 'challenge_3',
  'challenge_3_fail_2': 'challenge_3',
  'challenge_3_fail_3': 'challenge_3',
  'challenge_3_fail_4': 'challenge_3',
  'challenge_3_fail_5': 'challenge_3',
  'challenge_3_fail_6': 'challenge_3',
  'bad_end_1': 'challenge_1',
  'bad_end_2': 'challenge_2',
  'bad_end_3': 'challenge_3',
  'session_1_fail': 'session_1_challenge',
  'session_1_fail_2': 'session_1_challenge',
  'session_2_fail': 'session_2_challenge',
  'session_2_fail_2': 'session_2_challenge',
  'session_3_fail': 'session_3_challenge',
  'session_3_fail_2': 'session_3_challenge',
  'therapy_bad_end_1': 'session_1_challenge',
  'therapy_bad_end_2': 'session_2_challenge',
  'therapy_bad_end_3': 'session_3_challenge',
};

export default function SceneRenderer({ dialogues, startId, onExit, sceneTitle, sceneColor = '#f5f5f5', onOpenSettings }: SceneRendererProps) {
  const [currentId, setCurrentId] = useState(startId);
  const [showEmotionChoice, setShowEmotionChoice] = useState(false);
  const [screenEffect, setScreenEffect] = useState<string>('fade');
  const [showScene, setShowScene] = useState(false);
  const [bgTransition, setBgTransition] = useState(false);
  const [exitAnim, setExitAnim] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(true);
  const [textComplete, setTextComplete] = useState(false);
  const [showClickPrompt, setShowClickPrompt] = useState(false);
  const [showEndingScreen, setShowEndingScreen] = useState(false);

  const settings = useSettings();
  const progress = useProgress();
  const completeEnding = useGameStore((state) => state.completeEnding);
  const completeChallenge = useGameStore((state) => state.completeChallenge);
  const unlockAchievement = useGameStore((state) => state.unlockAchievement);
  const incrementCounter = useGameStore((state) => state.incrementCounter);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const currentDialogue = dialogues[currentId];

  const sceneId = sceneTitle.includes('CH.01') ? 'scene1' : 
                  sceneTitle.includes('CH.02') ? 'scene2' : 'scene3';

  const completedChallenges = progress.completedChallenges || [];
  const scene2Completed = progress.scene2Completed || false;

  useEffect(() => {
    const t = setTimeout(() => setShowScene(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setShowClickPrompt(false);
    setShowEndingScreen(false);
    setTextComplete(false);
    if (currentDialogue?.waitForEmotion) {
      setShowEmotionChoice(false);
    }
  }, [currentId, currentDialogue]);

  useEffect(() => {
    setBgTransition(true);
    const t = setTimeout(() => setBgTransition(false), 100);
    return () => clearTimeout(t);
  }, [currentDialogue?.characterArt]);

  useEffect(() => {
    if (currentDialogue?.screenEffect && currentDialogue.screenEffect !== 'none') {
      setScreenEffect(currentDialogue.screenEffect);
      const t = setTimeout(() => setScreenEffect('none'), 700);
      return () => clearTimeout(t);
    }
  }, [currentId, currentDialogue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showEmotionChoice || showEndingScreen) return;
        if (currentDialogue?.isEnding && textComplete) {
          setShowEndingScreen(true);
          return;
        }
        onExit();
      }
      if ((e.key === ' ' || e.key === 'Enter') && currentDialogue?.isEnding && textComplete && !showEndingScreen) {
        setShowEndingScreen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEmotionChoice, currentDialogue, onExit, textComplete, showEndingScreen]);

  const handleTypingComplete = useCallback(() => {
    setTextComplete(true);
    
    if (currentDialogue?.isEnding) {
      setTimeout(() => {
        setShowClickPrompt(true);
      }, 500);
    }
  }, [currentDialogue]);

  const handleDialogClick = useCallback(() => {
    if (currentDialogue?.isEnding && textComplete && !showEndingScreen) {
      setShowEndingScreen(true);
      return;
    }
  }, [currentDialogue, textComplete, showEndingScreen]);

  useEffect(() => {
    if (showEndingScreen && currentDialogue?.isEnding && currentDialogue.endingType) {
      completeEnding(sceneId, currentDialogue.endingType);
      
      if (currentDialogue.endingType === 'good') {
        const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'collection_good_ending');
        if (achievement && !useGameStore.getState().progress.achievements.includes('collection_good_ending')) {
          unlockAchievement('collection_good_ending');
          addNotification({
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            rarity: achievement.rarity,
          });
        }
      } else if (currentDialogue.endingType === 'bad') {
        const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'collection_bad_ending');
        if (achievement && !useGameStore.getState().progress.achievements.includes('collection_bad_ending')) {
          unlockAchievement('collection_bad_ending');
          addNotification({
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            rarity: achievement.rarity,
          });
        }
      }
      
      const chapterAchievements: Record<string, string> = {
        'scene1': 'story_complete_chapter1',
        'scene2': 'story_complete_chapter2',
        'scene3': 'story_complete_chapter3',
      };
      
      const achId = chapterAchievements[sceneId];
      if (achId) {
        const ach = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achId);
        if (ach && !useGameStore.getState().progress.achievements.includes(achId)) {
          unlockAchievement(achId);
          addNotification({
            name: ach.name,
            description: ach.description,
            icon: ach.icon,
            rarity: ach.rarity,
          });
        }
      }
    }
  }, [showEndingScreen, currentDialogue?.isEnding, currentDialogue?.endingType, sceneId, completeEnding, unlockAchievement, addNotification]);

  const handleNext = useCallback(() => {
    if (!currentDialogue || currentDialogue.isEnding) return;

    if (currentDialogue.waitForEmotion) {
      setDialogVisible(false);
      setTimeout(() => setShowEmotionChoice(true), 400);
      return;
    }

    if (currentDialogue.nextId && dialogues[currentDialogue.nextId]) {
      setCurrentId(currentDialogue.nextId);
      setDialogVisible(true);
    }
  }, [currentDialogue, dialogues]);

  const handleEmotionSelected = useCallback((emotion: EmotionType) => {
    const d = dialogues[currentId];
    if (!d?.emotionBranches) return;
    const nextId = d.emotionBranches[emotion];
    if (nextId && dialogues[nextId]) {
      setShowEmotionChoice(false);
      setDialogVisible(true);
      setCurrentId(nextId);
      
      const isSuccess = !nextId.includes('fail') && !nextId.includes('bad_end');
      
      if (isSuccess) {
        incrementCounter('emotion_streak', 1);
        incrementCounter('emotion_total_success', 1);
        
        let challengeId = '';
        if (sceneId === 'scene1') {
          if (currentId.includes('challenge_1') || currentId === 'challenge_1_intro') challengeId = 'challenge_1';
          else if (currentId.includes('challenge_2') || currentId === 'challenge_2_intro') challengeId = 'challenge_2';
          else if (currentId.includes('challenge_3') || currentId === 'challenge_3_intro') challengeId = 'challenge_3';
        } else if (sceneId === 'scene3') {
          if (currentId.includes('session_1') || currentId === 'session_1_intro') challengeId = 'session_1';
          else if (currentId.includes('session_2') || currentId === 'session_2_intro') challengeId = 'session_2';
          else if (currentId.includes('session_3') || currentId === 'session_3_intro') challengeId = 'session_3';
        }
        
        if (challengeId) {
          completeChallenge(challengeId);
        }
        
        setTimeout(() => {
          const state = useGameStore.getState();
          
          if (state.progress.emotionTotalSuccess === 1) {
            const ach = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'challenge_first_success');
            if (ach && !state.progress.achievements.includes('challenge_first_success')) {
              unlockAchievement('challenge_first_success');
              addNotification({
                name: ach.name,
                description: ach.description,
                icon: ach.icon,
                rarity: ach.rarity,
              });
            }
          }
          
          if (state.progress.emotionStreak >= 3) {
            const ach = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'challenge_streak_3');
            if (ach && !state.progress.achievements.includes('challenge_streak_3')) {
              unlockAchievement('challenge_streak_3');
              addNotification({
                name: ach.name,
                description: ach.description,
                icon: ach.icon,
                rarity: ach.rarity,
              });
            }
          }
          
          if (state.progress.emotionStreak >= 5) {
            const ach = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'challenge_streak_5');
            if (ach && !state.progress.achievements.includes('challenge_streak_5')) {
              unlockAchievement('challenge_streak_5');
              addNotification({
                name: ach.name,
                description: ach.description,
                icon: ach.icon,
                rarity: ach.rarity,
              });
            }
          }
          
          if (state.progress.emotionStreak >= 10) {
            const ach = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'challenge_streak_10');
            if (ach && !state.progress.achievements.includes('challenge_streak_10')) {
              unlockAchievement('challenge_streak_10');
              addNotification({
                name: ach.name,
                description: ach.description,
                icon: ach.icon,
                rarity: ach.rarity,
              });
            }
          }
          
          if (state.progress.emotionTotalSuccess >= 20) {
            const ach = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'challenge_total_20');
            if (ach && !state.progress.achievements.includes('challenge_total_20')) {
              unlockAchievement('challenge_total_20');
              addNotification({
                name: ach.name,
                description: ach.description,
                icon: ach.icon,
                rarity: ach.rarity,
              });
            }
          }
        }, 50);
      }
    }
  }, [currentId, dialogues, sceneId, incrementCounter, completeChallenge, unlockAchievement, addNotification]);

  const handleExit = () => {
    setExitAnim(true);
    setTimeout(onExit, 600);
  };

  const handleRetry = () => {
    const retryNodeId = emotionChallengeNodes[currentId];
    if (retryNodeId && dialogues[retryNodeId]) {
      setShowEndingScreen(false);
      setShowClickPrompt(false);
      setCurrentId(retryNodeId);
      setDialogVisible(true);
      setShowEmotionChoice(false);
      setTextComplete(false);
      
      incrementCounter('retry_count', 1);
      const state = useGameStore.getState();
      if (state.progress.retryCount + 1 >= 5) {
        const ach = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'collection_retry_5');
        if (ach && !state.progress.achievements.includes('collection_retry_5')) {
          unlockAchievement('collection_retry_5');
          addNotification({
            name: ach.name,
            description: ach.description,
            icon: ach.icon,
            rarity: ach.rarity,
          });
        }
      }
    }
  };

  const canRetry = currentDialogue?.isEnding && currentDialogue?.endingType === 'bad' && emotionChallengeNodes[currentId];

  if (!currentDialogue) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black" role="alert">
        <div className="text-center">
          <p className="text-lg mb-4 font-serif text-white/50">Dialogue data failed to load</p>
          <button 
            onClick={onExit} 
            className="px-6 py-2.5 border border-white/20 text-white/60 text-sm font-display tracking-wider hover:bg-white/5 transition-colors"
            aria-label="返回菜单"
          >
            RETURN
          </button>
        </div>
      </div>
    );
  }

  const cgLabels: Record<string, { text: string; sub: string; color: string }> = {
    warm:  { text: 'WARM MEMORY', sub: 'Warmth', color: '#fbbf24' },
    tense: { text: 'TENSE MOMENT', sub: 'Tension', color: '#60a5fa' },
    angry: { text: 'BITTER MEMORY', sub: 'Bitterness', color: '#f87171' },
  };
  const cgInfo = currentDialogue.cgType ? cgLabels[currentDialogue.cgType] : null;

  return (
    <>
      <CustomCursor />
      
      <SceneProgressBar 
        sceneId={sceneId as 'scene1' | 'scene2' | 'scene3'}
        currentNodeId={currentId}
        completedNodes={completedChallenges}
        isLocked={sceneId === 'scene2' && !scene2Completed}
      />
      
      <div 
        className={`fixed inset-0 transition-all duration-700
        ${showScene ? 'opacity-100' : 'opacity-0'}
        ${exitAnim ? 'opacity-0 scale-[1.02] blur-sm' : ''}`}
        role="main"
        aria-label={`场景: ${sceneTitle}`}
        onClick={handleDialogClick}
      >

      <div className="absolute inset-0 transition-all duration-[2000ms]"
        style={{ background: currentDialogue.background || '#0a0a0a', opacity: bgTransition ? 0.7 : 1 }} />

      <div className={`transition-opacity duration-1000 ${bgTransition ? 'opacity-0' : 'opacity-100'}`}>
        <CharacterArt artId={currentDialogue.characterArt} />
      </div>

      <div 
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 md:px-8 py-4"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
      >
        
        {!currentDialogue.isEnding && !showEmotionChoice && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleExit(); }}
            className="flex items-center gap-2 px-3 py-2 border border-white/10 transition-all duration-300 hover:bg-white/5 active:scale-95 group"
            aria-label="返回主菜单"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round"
              className="transition-transform group-hover:-translate-x-0.5 text-white/40"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="font-mono text-[10px] tracking-wider text-white/40 hidden md:inline">EXIT</span>
          </button>
        )}
        {(currentDialogue.isEnding || showEmotionChoice) && <div />}

        <div className="flex items-center gap-2">
          {onOpenSettings && (
            <button 
              onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}
              className="flex items-center gap-2 px-3 py-2 border border-white/10 transition-all duration-300 hover:bg-white/5 active:scale-95"
              aria-label="打开设置"
            >
              <span className="text-white/40">⚙️</span>
            </button>
          )}
          {cgInfo && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cgInfo.color, opacity: 0.6 }} aria-hidden="true" />
              <span className="font-mono text-[10px] tracking-wider text-white/50">
                {cgInfo.text}
              </span>
            </div>
          )}
          <div className="px-3 py-1.5 border border-white/10">
            <span className="font-mono text-[10px] tracking-wider text-white/30">
              {sceneTitle}
            </span>
          </div>
        </div>
      </div>

      {screenEffect === 'shake' && <div className="absolute inset-0 z-30 pointer-events-none animate-shake" aria-hidden="true" />}
      {screenEffect === 'flash' && <div className="absolute inset-0 z-30 pointer-events-none bg-white/70 animate-flash" aria-hidden="true" />}
      {screenEffect === 'blur' && <div className="absolute inset-0 z-30 pointer-events-none backdrop-blur-lg animate-blur-fade" aria-hidden="true" />}
      {screenEffect === 'fade' && <div className="absolute inset-0 z-30 pointer-events-none bg-black animate-flash" aria-hidden="true" />}

      {dialogVisible && !showEmotionChoice && (
        <DialogBox 
          dialogue={currentDialogue} 
          onNext={handleNext} 
          isWaitingForEmotion={false} 
          textSpeed={settings.textSpeed}
          onTypingComplete={handleTypingComplete}
        />
      )}

      {showEmotionChoice && currentDialogue.emotionBranches && (
        <EmotionChoice
          prompt={currentDialogue.text.replace(/🎭.*$/s, '').replace(/🪞.*$/s, '').trim()}
          availableBranches={currentDialogue.emotionBranches}
          onEmotionSelected={handleEmotionSelected}
          sceneColor={sceneColor}
        />
      )}

      {currentDialogue.isEnding && showClickPrompt && !showEndingScreen && (
        <div 
          className="absolute inset-0 z-35 flex items-center justify-center pointer-events-none"
        >
          <div 
            className="text-center"
            style={{ animation: 'fadeIn 0.5s ease-out' }}
          >
            <div 
              className="px-6 py-3 border border-white/20 backdrop-blur-md rounded-lg"
              style={{
                background: 'rgba(0,0,0,0.6)',
              }}
            >
              <span className="font-mono text-xs text-white/50 tracking-wider animate-pulse">
                点击以继续
              </span>
            </div>
          </div>
        </div>
      )}

      {showEndingScreen && currentDialogue.isEnding && (
        <EndingScreen
          endingType={currentDialogue.endingType as 'good' | 'bad' | 'neutral'}
          endingTitle={currentDialogue.endingType === 'good' ? 'GOOD END' : 
                       currentDialogue.endingType === 'bad' ? 'BAD END' : 'END'}
          onReturnToMenu={handleExit}
          onRetry={canRetry ? handleRetry : undefined}
          canRetry={!!canRetry}
        />
      )}

      <div className="fixed top-0 left-0 right-0 h-[10px] md:h-[14px] bg-black z-[60] pointer-events-none" aria-hidden="true" />
      <div className="fixed bottom-0 left-0 right-0 h-[10px] md:h-[14px] bg-black z-[60] pointer-events-none" aria-hidden="true" />
    </div>
    </>
  );
}
