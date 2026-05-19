import { useState, useEffect, useCallback } from 'react';
import { DialogueNode } from '../types/game';

interface DialogBoxProps {
  dialogue: DialogueNode;
  onNext: () => void;
  isWaitingForEmotion: boolean;
  textSpeed?: number;
  onTypingComplete?: () => void;
}

const speakerTheme: Record<string, { color: string; accent: string }> = {
  '旁白':      { color: '#a3a3a3', accent: '#737373' },
  '王总':      { color: '#f87171', accent: '#dc2626' },
  '同事小王':  { color: '#86efac', accent: '#22c55e' },
  '你':        { color: '#f5f5f5', accent: '#d4d4d4' },
  '主角':      { color: '#f5f5f5', accent: '#d4d4d4' },
  '好友':      { color: '#fbbf24', accent: '#f59e0b' },
  '队长':      { color: '#60a5fa', accent: '#3b82f6' },
  '学长':      { color: '#f87171', accent: '#ef4444' },
  '叶成武':    { color: '#a78bfa', accent: '#8b5cf6' },
  '治疗师':    { color: '#a78bfa', accent: '#8b5cf6' },
};

export default function DialogBox({ dialogue, onNext, isWaitingForEmotion, textSpeed = 1, onTypingComplete }: DialogBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const fullText = dialogue.text;
  const isNarrator = dialogue.speaker === '旁白' || dialogue.speaker === 'Narrator';
  const theme = speakerTheme[dialogue.speaker] || { color: '#f5f5f5', accent: '#d4d4d4' };
  const isChoiceNode = dialogue.waitForEmotion;

  useEffect(() => {
    setDisplayedText('');
    setCharIndex(0);
    setIsTyping(true);
  }, [dialogue.id]);

  useEffect(() => {
    if (charIndex < fullText.length && isTyping) {
      const ch = fullText[charIndex];
      const baseSpeed =
        ch === '\n' ? 180 :
        '。！？…'.includes(ch) ? 140 :
        '，、；：'.includes(ch) ? 80 :
        '——'.includes(ch) ? 50 :
        32;
      
      const speed = baseSpeed / textSpeed;
      
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[charIndex]);
        setCharIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (charIndex >= fullText.length) {
      setIsTyping(false);
      if (onTypingComplete) {
        onTypingComplete();
      }
    }
  }, [charIndex, fullText, isTyping, textSpeed, onTypingComplete]);

  const handleClick = useCallback(() => {
    if (isTyping) {
      setDisplayedText(fullText);
      setCharIndex(fullText.length);
      setIsTyping(false);
      if (onTypingComplete) {
        onTypingComplete();
      }
    } else if (!isWaitingForEmotion && !dialogue.isEnding) {
      onNext();
    }
  }, [isTyping, fullText, isWaitingForEmotion, dialogue.isEnding, onNext, onTypingComplete]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const cleanText = displayedText
    .replace(/🎭.*$/ms, '')
    .replace(/🪞.*$/ms, '')
    .replace(/😊.*$/ms, '')
    .trim();

  return (
    <div 
      className="absolute left-0 right-0 cursor-pointer select-none z-30" 
      style={{ bottom: '80px' }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${dialogue.speaker}: ${isChoiceNode ? cleanText : displayedText}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent" style={{ paddingTop: '100px' }}>
        <div className="mx-4 mb-4 md:mx-12 md:mb-6 max-w-4xl lg:mx-auto">

          {!isNarrator ? (
            <div className={`mb-3 ${dialogue.speakerPosition === 'right' ? 'flex justify-end' : 'flex justify-start'}`}>
              <div className="inline-flex items-center gap-2.5">
                <div className="w-5 h-[1px]" style={{ background: theme.color, opacity: 0.6 }} aria-hidden="true" />
                <span className="font-serif text-sm tracking-wider" style={{ color: theme.color }}>
                  {dialogue.speaker}
                </span>
                {dialogue.emotion && (
                  <span className="font-mono text-[10px] tracking-wider"
                    style={{ color: `${theme.color}50` }}>
                    — {dialogue.emotion}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-3 flex justify-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-px bg-white/10" aria-hidden="true" />
                <span className="font-mono text-[9px] font-bold tracking-[0.35em] uppercase text-white/20">
                  Narration
                </span>
                <div className="w-10 h-px bg-white/10" aria-hidden="true" />
              </div>
            </div>
          )}

          <div className={`${isNarrator ? 'text-center' : dialogue.speakerPosition === 'right' ? 'text-right' : 'text-left'}`}>
            <p className={`text-[14px] md:text-[16px] leading-[2.2] tracking-wider whitespace-pre-line
              ${isNarrator ? 'font-serif italic text-white/45' : 'font-serif text-white/88'}`}>
              {isChoiceNode ? cleanText : displayedText}
              {isTyping && (
                <span className="inline-block w-[2px] h-[14px] ml-1 align-middle"
                  style={{
                    background: isNarrator ? '#ff4757' : theme.color,
                    opacity: 0.6,
                    animation: 'typewriterCursor 0.8s ease-in-out infinite',
                  }}
                  aria-hidden="true"
                />
              )}
            </p>
          </div>

          {isChoiceNode && !isTyping && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="group relative flex items-center gap-3 px-8 py-4 border border-amber-400/30
                  transition-colors duration-300 hover:bg-amber-400/5 hover:border-amber-400/50"
                aria-label="开始表情选择"
              >
                <span className="font-mono text-xs tracking-wider text-amber-400/70 group-hover:text-amber-400">🎭</span>
                <span className="font-mono text-xs tracking-wider text-amber-400/70 group-hover:text-amber-400">BEGIN EMOTION CHALLENGE</span>
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-end">
            {dialogue.isEnding && !isTyping ? (
              <span className={`font-display text-xs tracking-wider
                ${dialogue.endingType === 'bad' ? 'text-red-400/60' : 'text-white/20'}`}>
                {dialogue.endingType === 'good' ? '✦ GOOD END' :
                 dialogue.endingType === 'bad' ? '✦ BAD END' : '✦ END'}
              </span>
            ) : !isChoiceNode && !isTyping ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-wider text-white/30">
                  CLICK TO CONTINUE
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" className="animate-bounce text-white/30" style={{ animationDuration: '2s' }} aria-hidden="true">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            ) : isTyping ? (
              <div>
                <span className="font-mono text-[10px] tracking-wider text-white/30">
                  CLICK TO SKIP ▸
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
