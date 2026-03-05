import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

// Theme color palettes — match existing site CSS
const THEME_COLORS: Record<string, { bg1: string; bg2: string; accent: string; badge: string }> = {
  fire:    { bg1: '#1a0400', bg2: '#0a0200', accent: '#ff5500', badge: '#ff3300' },
  ocean:   { bg1: '#001a2a', bg2: '#000d14', accent: '#00ccff', badge: '#0088cc' },
  space:   { bg1: '#08041a', bg2: '#030210', accent: '#9d4edd', badge: '#7b2fbe' },
  neon:    { bg1: '#030a1a', bg2: '#010510', accent: '#00e5ff', badge: '#0090a0' },
  forest:  { bg1: '#041408', bg2: '#020a04', accent: '#44cc44', badge: '#228822' },
  ice:     { bg1: '#061822', bg2: '#030d14', accent: '#88ddff', badge: '#4499bb' },
  candy:   { bg1: '#1a0614', bg2: '#0d0308', accent: '#ff66cc', badge: '#cc3399' },
  desert:  { bg1: '#1a0e00', bg2: '#0d0700', accent: '#ffaa00', badge: '#cc7700' },
  rhythm:  { bg1: '#10031a', bg2: '#080110', accent: '#cc44ff', badge: '#8800cc' },
  pixel:   { bg1: '#050514', bg2: '#020208', accent: '#4466ff', badge: '#2244cc' },
  default: { bg1: '#07070f', bg2: '#040408', accent: '#9d4edd', badge: '#7b2fbe' },
};

// Category labels
const CAT_LABEL: Record<string, string> = {
  action: 'Action',
  arcade: 'Arcade',
  puzzle: 'Puzzle',
  rhythm: 'Rhythm',
};

// Subtle decorative shapes per theme
function ThemeDecor({ theme, w, h }: { theme: string; w: number; h: number }) {
  const c = THEME_COLORS[theme] || THEME_COLORS.default;

  if (theme === 'fire') {
    return (
      <>
        <div style={{ position: 'absolute', bottom: -10, left: '20%', width: 60, height: 80, background: `radial-gradient(ellipse at 50% 100%, ${c.accent}88 0%, transparent 70%)`, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -10, left: '55%', width: 40, height: 60, background: `radial-gradient(ellipse at 50% 100%, ${c.accent}55 0%, transparent 70%)`, borderRadius: '50%' }} />
      </>
    );
  }
  if (theme === 'ocean') {
    return (
      <>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30, background: `linear-gradient(90deg, transparent, ${c.accent}22, transparent, ${c.accent}18, transparent)`, borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, height: 20, background: `linear-gradient(90deg, ${c.accent}15, transparent, ${c.accent}12, transparent)`, borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
      </>
    );
  }
  if (theme === 'space') {
    return (
      <>
        {[...Array(18)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', width: i % 4 === 0 ? 2 : 1, height: i % 4 === 0 ? 2 : 1, borderRadius: '50%', background: 'white', opacity: 0.3 + (i % 3) * 0.2, top: `${(i * 17 + 7) % 90}%`, left: `${(i * 23 + 5) % 95}%` }} />
        ))}
        <div style={{ position: 'absolute', right: 16, top: 12, width: 28, height: 28, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${c.accent}88, ${c.accent}33)`, boxShadow: `0 0 12px ${c.accent}44` }} />
      </>
    );
  }
  if (theme === 'neon') {
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', width: '100%', height: 1, background: `${c.accent}12`, top: `${20 + i * 18}%` }} />
          </React.Fragment>
        ))}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', width: 1, height: '100%', background: `${c.accent}10`, left: `${10 + i * 16}%` }} />
        ))}
      </>
    );
  }
  if (theme === 'ice') {
    return (
      <>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', width: 3, height: 3, borderRadius: '50%', background: 'white', opacity: 0.35, top: `${(i * 19 + 5) % 85}%`, left: `${(i * 27 + 8) % 88}%` }} />
        ))}
      </>
    );
  }
  if (theme === 'forest') {
    return (
      <>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, background: `linear-gradient(180deg, transparent, ${c.accent}18)` }} />
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', bottom: 0, left: `${15 + i * 22}%`, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `28px solid ${c.accent}22` }} />
        ))}
      </>
    );
  }

  // default / others: subtle glow
  return (
    <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${c.accent}15 0%, transparent 70%)` }} />
  );
}

interface GameCaptionProps {
  slug: string;
  name: string;
  desc: string;
  cat: string;
  theme: string;
}

export const GameCaption: React.FC<GameCaptionProps> = ({ slug, name, desc, cat, theme }) => {
  const frame = useCurrentFrame();
  const c = THEME_COLORS[theme] || THEME_COLORS.default;
  const catLabel = CAT_LABEL[cat] || cat;

  // Animations
  const titleOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [10, 30], [14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const badgeOpacity = interpolate(frame, [20, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glowOpacity = interpolate(frame, [0, 30], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Clamp title for display
  const displayName = name.length > 18 ? name.slice(0, 17) + '…' : name;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Background gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, ${c.bg1} 0%, ${c.bg2} 100%)`,
      }} />

      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 70% 40%, ${c.accent}28 0%, transparent 60%)`,
        opacity: glowOpacity,
      }} />

      {/* Theme decorations */}
      <ThemeDecor theme={theme} w={280} h={130} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)',
      }} />

      {/* Title */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px 16px',
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
      }}>
        <div style={{
          fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
          fontSize: displayName.length > 12 ? 22 : 26,
          fontWeight: 800,
          color: '#fff',
          textAlign: 'center',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          textShadow: `0 0 24px ${c.accent}88, 0 2px 8px rgba(0,0,0,0.8)`,
        }}>
          {displayName}
        </div>
      </div>

      {/* Category badge */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        opacity: badgeOpacity,
      }}>
        <div style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#fff',
          background: `${c.badge}cc`,
          padding: '3px 8px',
          borderRadius: 4,
        }}>
          {catLabel}
        </div>
      </div>

      {/* Accent line */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)`,
        opacity: 0.6,
      }} />
    </AbsoluteFill>
  );
};
