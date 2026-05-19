import { useState, useEffect, useCallback } from 'react';

interface CustomCursorProps {
  hoverText?: string;
  hoverColor?: string;
}

export default function CustomCursor({ hoverText, hoverColor }: CustomCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseDown = useCallback(() => setIsClicking(true), []);
  const handleMouseUp = useCallback(() => setIsClicking(false), []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    const handleHoverStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || 
          target.tagName === 'A' || 
          target.closest('button') || 
          target.closest('a') ||
          target.classList.contains('cursor-pointer') ||
          target.closest('.cursor-pointer')) {
        setIsHovering(true);
      }
    };

    const handleHoverEnd = () => setIsHovering(false);

    document.addEventListener('mouseover', handleHoverStart);
    document.addEventListener('mouseout', handleHoverEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleHoverStart);
      document.removeEventListener('mouseout', handleHoverEnd);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp]);

  return (
    <>
      <div
        className="fixed pointer-events-none z-[10001] transition-all duration-200 ease-out"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className={`rounded-full transition-all duration-200 ease-out ${
            isClicking ? 'scale-75' : 'scale-100'
          }`}
          style={{
            width: isHovering ? '48px' : '12px',
            height: isHovering ? '48px' : '12px',
            backgroundColor: isHovering ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
            border: isHovering ? `1.5px solid ${hoverColor || 'rgba(255, 255, 255, 0.8)'}` : 'none',
            mixBlendMode: 'difference',
          }}
        />
      </div>

      {hoverText && isHovering && (
        <div
          className="fixed pointer-events-none z-[10002] transition-opacity duration-150"
          style={{
            left: position.x + 30,
            top: position.y + 30,
          }}
        >
          <div 
            className="px-3 py-1.5 border border-white/30 bg-black/90 backdrop-blur-sm font-mono text-[10px] tracking-wider text-white/70"
          >
            {hoverText}
          </div>
        </div>
      )}
    </>
  );
}
