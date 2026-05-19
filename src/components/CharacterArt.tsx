import { useState, useEffect } from 'react';

interface CharacterArtProps {
  artId?: string;
}

const BG = {
  office:      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=85',
  office_dark: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1920&q=85',
  night_rain:  'https://images.unsplash.com/photo-1501999635878-71cb5379-c2d8?w=1920&q=85',
  sakura:      'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=85',
  stadium:     'https://images.unsplash.com/photo-1461896836934-bd45ba734407?w=1920&q=85',
  dark_room:   'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1920&q=85',
  mirror_room: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1920&q=85',
};

const AVATAR = {
  boss:       'https://api.dicebear.com/9.x/personas/svg?seed=boss2024&backgroundColor=b6e3f4&clothingColor=1a1a2e',
  boss_angry: 'https://api.dicebear.com/9.x/personas/svg?seed=bossangry2&backgroundColor=ffc9c9&clothingColor=8b0000',
  colleague:  'https://api.dicebear.com/9.x/personas/svg?seed=wang2024&backgroundColor=c0ffc0&clothingColor=3a5a8a',
  player:     'https://api.dicebear.com/9.x/personas/svg?seed=hero2024&backgroundColor=d4e4ff&clothingColor=4a6a4a',
  friend:     'https://api.dicebear.com/9.x/personas/svg?seed=friend2024&backgroundColor=ffe4b5&clothingColor=e67e22',
  captain:    'https://api.dicebear.com/9.x/personas/svg?seed=captain2024&backgroundColor=add8e6&clothingColor=2c3e50',
  senior:     'https://api.dicebear.com/9.x/personas/svg?seed=senior2024&backgroundColor=dda0dd&clothingColor=2f4f4f',
  mirror:     'https://api.dicebear.com/9.x/personas/svg?seed=mirror2024&backgroundColor=e0e0ff&clothingColor=1a1a3e',
};

export default function CharacterArt({ artId }: CharacterArtProps) {
  const [currentArtId, setCurrentArtId] = useState<string | undefined>(artId);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (currentArtId !== artId) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setCurrentArtId(artId);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [artId, currentArtId]);

  if (!currentArtId) return null;

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-300 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {renderScene(currentArtId)}
    </div>
  );
}

function renderScene(id: string) {
  switch (id) {
    case 'office':
      return <OfficeScene />;
    case 'colleague':
      return <CharScene bg={BG.office} avatar={AVATAR.colleague} name="Colleague" color="#86efac" position="left" />;
    case 'boss':
      return <CharScene bg={BG.office} avatar={AVATAR.boss} name="Director" color="#93c5fd" position="right" filter="brightness(0.7)" />;
    case 'boss_angry':
      return <CharScene bg={BG.office_dark} avatar={AVATAR.boss_angry} name="Director" color="#f87171" position="right" angry filter="saturate(0.3) brightness(0.45)" />;
    case 'boss_happy':
      return <CharScene bg={BG.office} avatar={AVATAR.boss} name="Director" color="#4ade80" position="right" filter="saturate(1.1) brightness(0.95)" />;
    case 'player_surprised':
      return <CharScene bg={BG.office} avatar={AVATAR.player} name="You" color="#f5f5f5" position="left" />;
    case 'night':
      return <NightScene />;
    case 'warm':
      return <WarmScene />;
    case 'tense':
      return <TenseScene />;
    case 'angry':
      return <AngryScene />;
    default:
      if (id.startsWith('mirror')) return <MirrorScene variant={id} />;
      return null;
  }
}

function SceneBg({ src, filter, className = '' }: { src: string; filter?: string; className?: string }) {
  return (
    <div className={`absolute inset-[-20px] bg-cover bg-center animate-ken-burns ${className}`}
      style={{ backgroundImage: `url(${src})`, filter: filter || 'brightness(0.55) saturate(0.6)' }} />
  );
}

function AvatarCard({ avatar, name, color, position = 'right', angry }:
  { avatar: string; name: string; color: string; position?: 'left' | 'right'; angry?: boolean }) {
  const posClass = position === 'left' ? 'left-[15%]' : 'right-[15%]';
  return (
    <div 
      className={`absolute ${posClass} bottom-[35%] z-10`}
      style={{ animation: 'avatarFadeIn 0.6s ease-out' }}
    >
      <div className="flex flex-col items-center">
        <div className="absolute -inset-8 rounded-full blur-3xl animate-breath-glow"
          style={{ background: `${color}15` }} />
        <div 
          className={`relative w-16 h-16 md:w-20 md:h-20 border border-white/20 overflow-hidden ${angry ? 'animate-shake' : ''}`}
          style={{ 
            boxShadow: `0 0 40px ${color}10, 0 8px 32px rgba(0,0,0,0.5)`,
            animation: 'avatarFadeIn 0.6s ease-out',
          }}
        >
          <img src={avatar} alt={name} className="w-full h-full object-cover" crossOrigin="anonymous" />
        </div>
        <div className="mt-2 px-3 py-1 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, opacity: 0.6 }} />
          <span className="font-mono text-[10px] tracking-wider" style={{ color: `${color}cc` }}>{name}</span>
        </div>
      </div>
    </div>
  );
}

function OfficeScene() {
  return (
    <>
      <SceneBg src={BG.office} filter="brightness(0.5) saturate(0.5)" />
      <div className="absolute top-0 right-0 w-1/2 h-full"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02), transparent 60%)' }} />
    </>
  );
}

function CharScene({ bg, avatar, name, color, position = 'right', angry, filter }:
  { bg: string; avatar: string; name: string; color: string; position?: 'left' | 'right'; angry?: boolean; filter?: string }) {
  return (
    <>
      <SceneBg src={bg} filter={filter || 'brightness(0.5) saturate(0.6)'} />
      {angry && <div className="absolute inset-0 bg-red-950/15 animate-pulse" style={{ animationDuration: '3s' }} />}
      <AvatarCard avatar={avatar} name={name} color={color} position={position} angry={angry} />
    </>
  );
}

function NightScene() {
  return (
    <>
      <SceneBg src={BG.night_rain} filter="brightness(0.4) saturate(0.4)" />
      <div className="absolute top-[8%] right-[18%] w-24 h-24 rounded-full animate-breath-glow"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%)', filter: 'blur(20px)' }} />
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i} className="absolute w-px"
          style={{
            left: `${Math.random() * 100}%`, top: '-5%',
            height: `${Math.random() * 30 + 15}px`,
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.05), transparent)',
            animation: `fall ${Math.random() * 0.5 + 0.3}s linear infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }} />
      ))}
      <div className="absolute inset-0 bg-black/20" />
    </>
  );
}

function WarmScene() {
  return (
    <>
      <SceneBg src={BG.sakura} filter="saturate(1.2) brightness(0.85) contrast(0.95)" />
      <div className="absolute top-0 right-0 w-[60%] h-[50%]"
        style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05), transparent 60%)' }} />
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="absolute text-pink-200/30"
          style={{
            left: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 10 + 10}px`,
            animation: `floatDown ${Math.random() * 8 + 7}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 10}s`,
          }}>✿</div>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={`b${i}`} className="absolute rounded-full"
          style={{
            width: `${Math.random() * 40 + 20}px`, height: `${Math.random() * 40 + 20}px`,
            background: `radial-gradient(circle, rgba(255,255,255,${Math.random() * 0.03 + 0.01}), transparent 70%)`,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 60}%`, filter: 'blur(8px)',
            animation: `floatUp ${Math.random() * 6 + 5}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }} />
      ))}
      <AvatarCard avatar={AVATAR.friend} name="Friend" color="#fbbf24" position="left" />
      <div className="absolute inset-0 bg-orange-900/5" />
    </>
  );
}

function TenseScene() {
  return (
    <>
      <SceneBg src={BG.stadium} filter="saturate(1.2) contrast(1.15) brightness(0.55)"
        className="animate-ken-burns-reverse" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-full pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 45%)',
          clipPath: 'polygon(40% 0, 60% 0, 80% 100%, 20% 100%)',
        }} />
      <AvatarCard avatar={AVATAR.captain} name="Captain" color="#60a5fa" position="left" />
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)' }} />
    </>
  );
}

function AngryScene() {
  return (
    <>
      <SceneBg src={BG.dark_room} filter="saturate(0.15) brightness(0.3) contrast(1.3)" />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 50% 40% at 50% 50%, transparent, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.85))'
      }} />
      <div className="absolute inset-0 bg-red-950/8 animate-pulse" style={{ animationDuration: '4s' }} />
      <AvatarCard avatar={AVATAR.senior} name="Senior" color="#f87171" position="right" />
    </>
  );
}

function MirrorScene({ variant }: { variant: string }) {
  const isHappy = variant.includes('happy');
  const isAngry = variant.includes('angry');
  const isSurprised = variant.includes('surprised');
  const isSad = variant.includes('sad');
  const isFear = variant.includes('fear');
  const isDisgust = variant.includes('disgust');

  const theme = isHappy ? { glow: '#fbbf24', sat: 1.1, bri: 0.7 } :
    isAngry ? { glow: '#f87171', sat: 0.4, bri: 0.35 } :
    isSurprised ? { glow: '#60a5fa', sat: 0.9, bri: 0.55 } :
    isSad ? { glow: '#a78bfa', sat: 0.35, bri: 0.4 } :
    isFear ? { glow: '#c084fc', sat: 0.5, bri: 0.35 } :
    isDisgust ? { glow: '#a3e635', sat: 0.45, bri: 0.4 } :
    { glow: '#f5f5f5', sat: 0.45, bri: 0.4 };

  return (
    <>
      <SceneBg src={BG.mirror_room} filter={`saturate(${theme.sat}) brightness(${theme.bri})`} />

      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 35% 45% at 50% 42%, ${theme.glow}08, transparent 70%)`
      }} />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] flex items-center justify-center">
        <div className="absolute w-40 h-56 md:w-48 md:h-64 rounded-[50%] animate-pulse-ring"
          style={{ boxShadow: `0 0 50px ${theme.glow}18`, border: `1px solid ${theme.glow}0a` }} />
        <div className="relative w-32 h-44 md:w-40 md:h-52 rounded-[50%] overflow-hidden border border-white/10"
          style={{ boxShadow: `0 0 40px ${theme.glow}0c, inset 0 0 20px ${theme.glow}06` }}>
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(160deg, rgba(30,30,50,0.8) 0%, rgba(15,15,30,0.6) 50%, rgba(25,25,45,0.8) 100%)'
          }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden opacity-40">
              <img src={AVATAR.mirror} alt="Mirror" className="w-full h-full object-cover" crossOrigin="anonymous" />
            </div>
          </div>
          <div className="absolute inset-0 animate-mirror-shimmer" />
        </div>
      </div>

      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${30 + Math.random() * 40}%`, top: `${15 + Math.random() * 55}%`,
            background: `${theme.glow}40`,
            animation: `floatUp ${Math.random() * 5 + 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`, filter: 'blur(0.5px)',
          }} />
      ))}

      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 42%, transparent 25%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.7))'
      }} />
    </>
  );
}
