import { useState, useCallback, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import SceneRenderer from './components/SceneRenderer';
import ErrorBoundary from './components/ErrorBoundary';
import SettingsPanel from './components/SettingsPanel';
import AchievementPanel from './components/AchievementPanel';
import AchievementToast from './components/AchievementToast';
import StartScreen from './components/StartScreen';
import { useGameStore, useProgress } from './store/gameStore';
import { useNotificationStore } from './hooks/useAchievementNotification';
import { ACHIEVEMENT_DEFINITIONS } from './data/achievements';
import { scene1Dialogues } from './data/scene1_dialogues';
import { scene2Dialogues } from './data/scene2_dialogues';
import { scene3Dialogues } from './data/scene3_dialogues';
import { preloadModels } from './hooks/useFaceDetection';

const sceneConfigs: Record<string, {
  title: string;
  dialogues: Record<string, any>;
  startId: string;
  color: string;
}> = {
  scene1: {
    title: 'CH.01 · A CATTLE\'S DAY',
    dialogues: scene1Dialogues,
    startId: 'intro_0',
    color: '#f5f5f5',
  },
  scene2: {
    title: 'CH.02 · DREAM DIVE',
    dialogues: scene2Dialogues,
    startId: 'intro_1',
    color: '#f5f5f5',
  },
  scene3: {
    title: 'CH.03 · THERAPY',
    dialogues: scene3Dialogues,
    startId: 'intro_1',
    color: '#f5f5f5',
  },
};

type GamePhase = 'start' | 'menu' | 'playing';

export default function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('start');
  const [currentScene, setCurrentScene] = useState<string | null>(null);
  const [startNodeId, setStartNodeId] = useState<string | undefined>(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  const unlockAchievement = useGameStore((state) => state.unlockAchievement);
  const updatePlayTime = useGameStore((state) => state.updatePlayTime);
  const checkAchievements = useGameStore((state) => state.checkAchievements);
  const saveGame = useGameStore((state) => state.saveGame);
  const loadGame = useGameStore((state) => state.loadGame);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const progress = useProgress();
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    preloadModels().catch(console.error);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 's' || e.key === 'S') {
        setShowSettings(prev => !prev);
      }
      if (e.key === 'a' || e.key === 'A') {
        setShowAchievements(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (gamePhase !== 'playing') return;
    
    const playTimeInterval = setInterval(() => {
      updatePlayTime(1);
    }, 1000);
    
    const checkInterval = setInterval(() => {
      const newlyUnlocked = checkAchievements();
      newlyUnlocked.forEach((achievementId) => {
        const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
        if (achievement) {
          addNotification({
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            rarity: achievement.rarity,
          });
        }
      });
    }, 2000);
    
    return () => {
      clearInterval(playTimeInterval);
      clearInterval(checkInterval);
    };
  }, [gamePhase, updatePlayTime, checkAchievements, addNotification]);

  const handleNewGame = useCallback(() => {
    resetProgress();
    setGamePhase('menu');
  }, [resetProgress]);

  const handleLoadGame = useCallback(() => {
    const success = loadGame();
    if (success) {
      setGamePhase('menu');
    }
  }, [loadGame]);

  const handleSaveGame = useCallback(() => {
    saveGame();
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  }, [saveGame]);

  const handleStartScene = useCallback((sceneId: string, nodeId?: string) => {
    setCurrentScene(sceneId);
    setStartNodeId(nodeId);
    setGamePhase('playing');
  }, []);

  const handleExit = useCallback(() => {
    setCurrentScene(null);
    setStartNodeId(undefined);
    setGamePhase('menu');
  }, []);

  const handleReturnToStart = useCallback(() => {
    setCurrentScene(null);
    setStartNodeId(undefined);
    setGamePhase('start');
  }, []);

  if (gamePhase === 'start') {
    return (
      <ErrorBoundary>
        <StartScreen onNewGame={handleNewGame} onLoadGame={handleLoadGame} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {currentScene && sceneConfigs[currentScene] ? (
        <SceneRenderer
          key={currentScene + (startNodeId || '')}
          dialogues={sceneConfigs[currentScene].dialogues}
          startId={startNodeId || sceneConfigs[currentScene].startId}
          onExit={handleExit}
          sceneTitle={sceneConfigs[currentScene].title}
          sceneColor={sceneConfigs[currentScene].color}
          onOpenSettings={() => setShowSettings(true)}
        />
      ) : (
        <MainMenu 
          onStartScene={handleStartScene} 
          onOpenSettings={() => setShowSettings(true)}
          onOpenAchievements={() => setShowAchievements(true)}
          onSaveGame={handleSaveGame}
          onReturnToStart={handleReturnToStart}
        />
      )}
      
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AchievementPanel isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
      <AchievementToast />
      
      {showSaveConfirm && (
        <div 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] px-8 py-4 border border-amber-400/40 bg-black/90 backdrop-blur-md"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💾</span>
            <div>
              <div className="font-display text-sm tracking-wider text-amber-400">存档成功</div>
              <div className="font-mono text-xs text-white/50 mt-1">游戏进度已保存</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </ErrorBoundary>
  );
}
