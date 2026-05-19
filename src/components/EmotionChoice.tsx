import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { EmotionType, EmotionResult } from '../types/game';
import { useFaceDetection } from '../hooks/useFaceDetection';

interface EmotionChoiceProps {
  prompt: string;
  availableBranches: Record<string, string>;
  onEmotionSelected: (emotion: EmotionType) => void;
  sceneColor?: string;
}

const emotionMeta: Record<string, { label: string; icon: string; color: string; desc: string; tips: string[] }> = {
  happy:     { label: 'SMILE',  icon: '😊', color: '#fbbf24', desc: 'Raise the corners of your mouth', tips: ['嘴角上扬', '露出牙齿', '眼睛微眯', '自然微笑'] },
  surprised: { label: 'SURPRISE',  icon: '😲', color: '#f472b6', desc: 'Widen your eyes, open your mouth', tips: ['睁大眼睛', '张开嘴巴', '眉毛上扬', '下巴放松'] },
  angry:     { label: 'ANGER',  icon: '😠', color: '#f87171', desc: 'Furrow your brows, express displeasure', tips: ['皱紧眉头', '嘴唇紧闭', '眼神锐利', '下颚紧绷'] },
  sad:       { label: 'SADNESS',  icon: '😢', color: '#60a5fa', desc: 'Lower your eyes, show sorrow', tips: ['嘴角下垂', '眼神低垂', '眉头微蹙', '表情沉重'] },
  neutral:   { label: 'NEUTRAL',  icon: '😐', color: '#9ca3af', desc: 'Maintain a blank expression', tips: ['面部放松', '不要笑', '不要皱眉', '保持平静'] },
  fearful:   { label: 'FEAR',  icon: '😰', color: '#a78bfa', desc: 'Show fear and tension', tips: ['眼睛睁大', '眉毛上扬', '嘴唇微张', '表情紧张'] },
  disgusted: { label: 'DISGUST',  icon: '🤢', color: '#4ade80', desc: 'Wrinkle your nose, show distaste', tips: ['皱起鼻子', '上唇上扬', '眼神厌恶', '嘴角下拉'] },
};

export default function EmotionChoice({ prompt, availableBranches, onEmotionSelected }: EmotionChoiceProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionType | null>(null);
  const [isReady, setIsReady] = useState(false);
  const handledRef = useRef(false);
  const mountedRef = useRef(false);

  const handleDetected = useCallback((result: EmotionResult) => {
    if (handledRef.current) return;
    if (availableBranches[result.dominant]) {
      handledRef.current = true;
      setDetectedEmotion(result.dominant);
      setTimeout(() => onEmotionSelected(result.dominant), 1800);
    }
  }, [availableBranches, onEmotionSelected]);

  const {
    videoRef, canvasRef, isModelLoading,
    isCameraReady, currentEmotion, error,
    loadModels,
  } = useFaceDetection({
    enabled: mode === 'camera' && !detectedEmotion,
    onEmotionDetected: handleDetected,
    confidenceThreshold: 0.30,
    stableFrames: 4,
  });

  useEffect(() => {
    mountedRef.current = true;
    loadModels().then(() => {
      if (mountedRef.current) setIsReady(true);
    });
    return () => {
      mountedRef.current = false;
    };
  }, [loadModels]);

  const handleManualSelect = useCallback((emotion: EmotionType) => {
    if (handledRef.current) return;
    handledRef.current = true;
    setDetectedEmotion(emotion);
    setTimeout(() => onEmotionSelected(emotion), 1200);
  }, [onEmotionSelected]);

  const handleSwitchToManual = useCallback(() => setMode('manual'), []);
  const handleSwitchToCamera = useCallback(() => setMode('camera'), []);

  const dominant = currentEmotion ? emotionMeta[currentEmotion.dominant] : null;
  const availableEmotions = useMemo(() => 
    Object.keys(availableBranches).filter(k => emotionMeta[k]) as EmotionType[],
    [availableBranches]
  );
  
  const targetEmotion = availableEmotions.length === 1 ? availableEmotions[0] : null;
  const targetMeta = targetEmotion ? emotionMeta[targetEmotion] : null;
  const showDetectedResult = detectedEmotion && emotionMeta[detectedEmotion];

  if (!isReady) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95" />
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/92 backdrop-blur-xl">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent 70%)' }}
        />
      </div>

      {showDetectedResult && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="text-8xl mb-6">{emotionMeta[detectedEmotion!].icon}</div>
            <div 
              className="font-display text-xl tracking-[0.2em] mb-2"
              style={{ color: emotionMeta[detectedEmotion!].color }}
            >
              {emotionMeta[detectedEmotion!].label}
            </div>
            <div className="font-mono text-xs tracking-[0.25em] uppercase text-white/30">
              EMOTION DETECTED · STORY CONTINUES
            </div>
            {targetEmotion && detectedEmotion === targetEmotion && (
              <div className="mt-4 font-display text-sm text-emerald-400/80 tracking-wider">
                ✓ CORRECT EXPRESSION
              </div>
            )}
          </div>
        </div>
      )}

      {!showDetectedResult && (
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 flex flex-col items-center">
          <div className="text-center mb-8 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 mb-4">
              <div className="w-2 h-2 rounded-full bg-white/60" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/50">
                DECISION MOMENT
              </span>
            </div>
            <p className="font-serif text-lg md:text-xl leading-relaxed max-w-lg mx-auto text-white/60">
              {prompt}
            </p>
          </div>

          {targetMeta && (
            <div className="flex justify-center mb-8 w-full">
              <div className="flex flex-col items-center gap-4 px-8 py-6 border border-white/20 bg-white/5">
                <div className="text-center">
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2">
                    TARGET EXPRESSION
                  </div>
                  <div className="text-5xl mb-2">{targetMeta.icon}</div>
                  <div 
                    className="font-display text-sm tracking-wider"
                    style={{ color: targetMeta.color }}
                  >
                    {targetMeta.label}
                  </div>
                  <div className="font-mono text-[10px] text-white/30 mt-1">
                    {targetMeta.desc}
                  </div>
                </div>
                
                <div className="w-full border-t border-white/10 pt-4 mt-2">
                  <div className="font-mono text-[10px] tracking-wider text-white/40 mb-3 text-center">
                    💡 表情提示
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {targetMeta.tips.map((tip, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10">
                        <span className="text-xs" style={{ color: targetMeta.color }}>●</span>
                        <span className="font-mono text-[10px] text-white/60">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === 'camera' && !showDetectedResult && (
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="relative" style={{ width: 280, height: 210 }}>
                <div 
                  className="absolute -inset-3"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), transparent, rgba(255,255,255,0.02))' }}
                />
                
                <div className="relative w-full h-full overflow-hidden border border-white/20 bg-black">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }} 
                  />
                  <canvas 
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ transform: 'scaleX(-1)' }} 
                  />

                  {isCameraReady && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-white/40" />
                      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-white/40" />
                      <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-white/40" />
                      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-white/40" />
                    </div>
                  )}

                  {(!isCameraReady || isModelLoading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <div className="text-center">
                        <div className="relative w-12 h-12 mx-auto mb-3">
                          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/40 animate-spin" />
                          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-white/20 animate-spin" style={{ animationDirection: 'reverse' }} />
                        </div>
                        <span className="font-mono text-xs text-white/40">
                          {isModelLoading ? 'LOADING EMOTION ENGINE...' : 'INITIALIZING CAMERA...'}
                        </span>
                      </div>
                    </div>
                  )}

                  {isCameraReady && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 bg-black/60">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="font-mono text-[9px] tracking-widest uppercase text-white/40">REC</span>
                    </div>
                  )}
                </div>
              </div>

              {currentEmotion && isCameraReady && dominant && (
                <div className="flex items-center gap-3 px-5 py-3 border border-white/10">
                  <span className="text-2xl">{dominant.icon}</span>
                  <div>
                    <div className="font-display text-sm" style={{ color: dominant.color }}>
                      {dominant.label}
                    </div>
                    <div className="font-mono text-[10px] text-white/30">
                      CONFIDENCE {Math.round(currentEmotion.confidence * 100)}%
                      {currentEmotion.confidence < 0.35 && ' · HOLD EXPRESSION'}
                    </div>
                  </div>
                  <div className="w-16 h-1.5 bg-white/5 overflow-hidden ml-2">
                    <div 
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${currentEmotion.confidence * 100}%`,
                        background: dominant.color,
                        opacity: 0.7,
                      }} 
                    />
                  </div>
                </div>
              )}

              <button 
                onClick={handleSwitchToManual}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 border border-white/10 font-mono text-xs
                  transition-colors duration-200 hover:bg-white/5 text-white/30 hover:text-white/50"
              >
                <span>⌨</span>
                <span>SWITCH TO MANUAL</span>
              </button>

              {error && (
                <div className="mt-2 px-4 py-2 border border-red-400/30 font-mono text-xs text-red-400/80">
                  ⚠ {error}
                  <button onClick={handleSwitchToManual} className="ml-2 underline">
                    USE MANUAL MODE
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'manual' && !showDetectedResult && (
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="font-mono text-xs tracking-[0.15em] uppercase text-white/30">
                SELECT YOUR EMOTIONAL RESPONSE
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                {availableEmotions.map((emo) => {
                  const meta = emotionMeta[emo];
                  const isTarget = emo === targetEmotion;
                  return (
                    <button 
                      key={emo}
                      onClick={() => handleManualSelect(emo)}
                      className="group relative flex flex-col items-center gap-2.5 px-5 py-5 border transition-colors duration-200 hover:bg-white/5"
                      style={{ borderColor: isTarget ? `${meta.color}40` : 'rgba(255,255,255,0.1)' }}
                    >
                      <span className="text-3xl transition-transform duration-200 group-hover:scale-110">
                        {meta.icon}
                      </span>
                      <div className="text-center">
                        <div className="font-display text-sm tracking-wider" style={{ color: `${meta.color}cc` }}>
                          {meta.label}
                        </div>
                        <div className="font-mono text-[10px] mt-0.5 text-white/30">
                          {meta.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={handleSwitchToCamera}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 border border-white/10 font-mono text-xs
                  transition-colors duration-200 hover:bg-white/5 text-white/30 hover:text-white/50"
              >
                <span>📷</span>
                <span>SWITCH TO CAMERA</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
