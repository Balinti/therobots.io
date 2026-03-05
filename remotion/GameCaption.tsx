import React from 'react';
import { AbsoluteFill } from 'remotion';

const THEMES: Record<string, { bg: string; accent: string; accent2: string; badge: string }> = {
  fire:    { bg: 'linear-gradient(135deg, #2a0600 0%, #0a0200 100%)', accent: '#ff5500', accent2: '#ff8c00', badge: '#cc2200' },
  ocean:   { bg: 'linear-gradient(135deg, #001830 0%, #000810 100%)', accent: '#00ccff', accent2: '#0088cc', badge: '#005588' },
  space:   { bg: 'linear-gradient(135deg, #0c0420 0%, #030210 100%)', accent: '#9d4edd', accent2: '#c77dff', badge: '#6a1f9a' },
  neon:    { bg: 'linear-gradient(135deg, #020a1c 0%, #010510 100%)', accent: '#00e5ff', accent2: '#00aacc', badge: '#006688' },
  forest:  { bg: 'linear-gradient(135deg, #041608 0%, #020804 100%)', accent: '#44cc44', accent2: '#22aa22', badge: '#156615' },
  ice:     { bg: 'linear-gradient(135deg, #061c28 0%, #030e16 100%)', accent: '#88ddff', accent2: '#55bbdd', badge: '#2288aa' },
  candy:   { bg: 'linear-gradient(135deg, #200614 0%, #0e0308 100%)', accent: '#ff66cc', accent2: '#ff44aa', badge: '#aa1166' },
  desert:  { bg: 'linear-gradient(135deg, #1e0e00 0%, #0a0500 100%)', accent: '#ffaa00', accent2: '#ff8800', badge: '#aa5500' },
  rhythm:  { bg: 'linear-gradient(135deg, #120318 0%, #080110 100%)', accent: '#cc44ff', accent2: '#aa22ee', badge: '#770099' },
  pixel:   { bg: 'linear-gradient(135deg, #050520 0%, #020210 100%)', accent: '#4466ff', accent2: '#2244dd', badge: '#1133aa' },
  default: { bg: 'linear-gradient(135deg, #08060f 0%, #040408 100%)', accent: '#9d4edd', accent2: '#7b2fbe', badge: '#5a189a' },
};

const CAT_LABEL: Record<string, string> = {
  action: 'Action',
  arcade: 'Arcade',
  puzzle: 'Puzzle',
  rhythm: 'Rhythm',
};

function ThemeArtwork({ theme, accent, accent2 }: { theme: string; accent: string; accent2: string }) {
  const svgStyle: React.CSSProperties = {
    position: 'absolute', right: 0, top: 0,
    width: 160, height: '100%', opacity: 0.38,
  };

  if (theme === 'fire') return (
    <svg viewBox="0 0 120 130" style={svgStyle}>
      <defs>
        <radialGradient id="fglow" cx="50%" cy="90%" r="55%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={accent2} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <path d="M62 128 C32 105 22 78 38 52 C43 67 53 62 57 46 C62 30 52 14 57 4 C82 26 93 58 76 82 C92 67 90 88 82 108 Z" fill={accent} opacity="0.85"/>
      <path d="M60 122 C42 102 38 82 48 62 C51 73 56 70 59 60 C63 49 57 36 60 26 C74 44 80 67 68 88 C78 75 76 90 70 107 Z" fill={accent2} opacity="0.7"/>
      <path d="M46 118 C33 100 30 82 38 65 C40 74 44 71 46 63 C49 54 44 43 47 36 C58 50 62 67 54 84 C61 74 59 87 55 102 Z" fill={accent} opacity="0.45"/>
      <circle cx="35" cy="58" r="3.5" fill={accent} opacity="0.6"/>
      <circle cx="82" cy="38" r="2.5" fill={accent2} opacity="0.7"/>
      <circle cx="48" cy="28" r="2" fill={accent} opacity="0.5"/>
      <circle cx="93" cy="68" r="3" fill={accent2} opacity="0.5"/>
      <circle cx="22" cy="80" r="1.5" fill={accent} opacity="0.4"/>
      <ellipse cx="60" cy="124" rx="45" ry="12" fill="url(#fglow)" opacity="0.55"/>
    </svg>
  );

  if (theme === 'ocean') return (
    <svg viewBox="0 0 120 130" style={svgStyle}>
      <path d="M0 80 Q30 60 60 80 Q90 100 120 80 L120 130 L0 130 Z" fill={accent} opacity="0.3"/>
      <path d="M0 92 Q30 72 60 92 Q90 112 120 92 L120 130 L0 130 Z" fill={accent2} opacity="0.4"/>
      <path d="M0 105 Q25 88 55 105 Q80 120 120 103 L120 130 L0 130 Z" fill={accent} opacity="0.55"/>
      <ellipse cx="80" cy="55" rx="18" ry="10" fill={accent} opacity="0.35"/>
      <path d="M98 55 L116 44 L116 66 Z" fill={accent} opacity="0.35"/>
      <circle cx="76" cy="50" r="2.5" fill="white" opacity="0.3"/>
      <circle cx="38" cy="72" r="5" fill="none" stroke={accent} strokeWidth="1.8" opacity="0.45"/>
      <circle cx="65" cy="52" r="3.5" fill="none" stroke={accent2} strokeWidth="1.5" opacity="0.4"/>
      <circle cx="25" cy="45" r="2.5" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.35"/>
      <circle cx="10" cy="62" r="2" fill="none" stroke={accent2} strokeWidth="1" opacity="0.3"/>
      <path d="M12 130 L12 96 Q6 86 12 76 Q18 86 12 96" stroke={accent2} strokeWidth="3.5" fill="none" opacity="0.45"/>
      <path d="M20 130 L20 102 Q26 92 20 85" stroke={accent} strokeWidth="2.5" fill="none" opacity="0.35"/>
    </svg>
  );

  if (theme === 'space') return (
    <svg viewBox="0 0 120 130" style={svgStyle}>
      <circle cx="78" cy="52" r="30" fill={accent} opacity="0.1"/>
      <circle cx="78" cy="52" r="26" fill="none" stroke={accent} strokeWidth="2.5" opacity="0.6"/>
      <circle cx="78" cy="52" r="20" fill={accent} opacity="0.07"/>
      <ellipse cx="78" cy="52" rx="48" ry="10" fill="none" stroke={accent2} strokeWidth="3" opacity="0.5"/>
      <ellipse cx="78" cy="52" rx="48" ry="10" fill="none" stroke={accent} strokeWidth="1" opacity="0.25"/>
      {([[10,18],[28,8],[52,28],[105,14],[112,42],[22,68],[45,92],[98,92],[108,68],[62,12],[8,82],[72,78]] as [number,number][]).map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.5 : 1.2} fill="white" opacity={0.25 + 0.35 * (i % 3)}/>
      ))}
      <rect x="16" y="48" width="14" height="7" fill={accent2} opacity="0.55" rx="1.5"/>
      <rect x="6" y="49" width="12" height="5" fill={accent} opacity="0.45"/>
      <rect x="18" y="49.5" width="12" height="5" fill={accent} opacity="0.45"/>
    </svg>
  );

  if (theme === 'neon') return (
    <svg viewBox="0 0 120 130" style={svgStyle}>
      {([0,15,30,45,60,75,90,105,120] as number[]).map((x, i) => (
        <line key={i} x1={x} y1="0" x2={x} y2="130" stroke={accent} strokeWidth="0.5" opacity="0.3"/>
      ))}
      {([0,13,26,39,52,65,78,91,104,117,130] as number[]).map((y, i) => (
        <line key={i} x1="0" y1={y} x2="120" y2={y} stroke={accent} strokeWidth="0.5" opacity="0.3"/>
      ))}
      {([[30,32],[78,28],[62,62],[48,92],[92,78]] as [number,number][]).map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="6" fill={accent} opacity="0.65"/>
      ))}
      <path d="M30 32 L78 28 L78 62 L62 62 L62 92 L48 92" stroke={accent} strokeWidth="2.5" fill="none" opacity="0.65"/>
      <path d="M78 28 L92 44 L92 78" stroke={accent2} strokeWidth="2" fill="none" opacity="0.5"/>
      <rect x="50" y="46" width="32" height="22" fill="none" stroke={accent} strokeWidth="2" opacity="0.45" rx="2"/>
      <circle cx="30" cy="32" r="3" fill="white" opacity="0.5"/>
      <circle cx="78" cy="28" r="3" fill="white" opacity="0.5"/>
    </svg>
  );

  if (theme === 'forest') return (
    <svg viewBox="0 0 120 130" style={svgStyle}>
      <circle cx="92" cy="22" r="20" fill={accent2} opacity="0.08"/>
      <circle cx="92" cy="22" r="15" fill={accent} opacity="0.1"/>
      <polygon points="100,92 84,54 68,92" fill={accent} opacity="0.6"/>
      <polygon points="107,98 96,65 85,98" fill={accent2} opacity="0.5"/>
      <polygon points="52,102 36,63 20,102" fill={accent} opacity="0.55"/>
      <polygon points="78,96 67,70 56,96" fill={accent2} opacity="0.45"/>
      <polygon points="30,88 18,58 6,88" fill={accent} opacity="0.4"/>
      <rect x="85" y="92" width="5" height="22" fill={accent2} opacity="0.4"/>
      <rect x="33" y="102" width="4" height="16" fill={accent} opacity="0.35"/>
      <rect x="65" y="96" width="4" height="18" fill={accent2} opacity="0.3"/>
      <rect x="13" y="88" width="3" height="14" fill={accent} opacity="0.3"/>
      <rect x="0" y="112" width="120" height="18" fill={accent2} opacity="0.12"/>
      <circle cx="42" cy="48" r="2.5" fill={accent} opacity="0.6"/>
      <circle cx="112" cy="58" r="2" fill={accent2} opacity="0.5"/>
      <circle cx="18" cy="68" r="2" fill={accent} opacity="0.45"/>
    </svg>
  );

  if (theme === 'ice') return (
    <svg viewBox="0 0 120 130" style={svgStyle}>
      <g transform="translate(72,52)">
        {([0,30,60,90,120,150] as number[]).map((deg, i) => (
          <line key={i}
            x1="0" y1="0"
            x2={Math.cos(deg * Math.PI / 180) * 32}
            y2={Math.sin(deg * Math.PI / 180) * 32}
            stroke={accent} strokeWidth="3" opacity="0.7"/>
        ))}
        {([0,30,60,90,120,150] as number[]).map((deg, i) => (
          <React.Fragment key={i}>
            <circle
              cx={Math.cos(deg * Math.PI / 180) * 20}
              cy={Math.sin(deg * Math.PI / 180) * 20}
              r="3.5" fill={accent} opacity="0.55"/>
            <circle
              cx={Math.cos(deg * Math.PI / 180) * 32}
              cy={Math.sin(deg * Math.PI / 180) * 32}
              r="2.5" fill={accent2} opacity="0.65"/>
          </React.Fragment>
        ))}
        <circle cx="0" cy="0" r="6" fill={accent} opacity="0.85"/>
        <circle cx="0" cy="0" r="3" fill="white" opacity="0.6"/>
      </g>
      <polygon points="18,48 12,70 24,70" fill={accent} opacity="0.4"/>
      <polygon points="28,26 22,50 34,50" fill={accent2} opacity="0.35"/>
      <polygon points="108,82 102,104 114,104" fill={accent} opacity="0.35"/>
      {([[8,18],[42,8],[62,22],[92,12],[112,28],[22,88],[52,108],[86,112]] as [number,number][]).map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 2.5 : 1.5} fill="white" opacity="0.3"/>
      ))}
    </svg>
  );

  if (theme === 'candy') return (
    <svg viewBox="0 0 120 130" style={svgStyle}>
      <circle cx="80" cy="48" r="30" fill={accent} opacity="0.1"/>
      <circle cx="80" cy="48" r="26" fill="none" stroke={accent} strokeWidth="7" opacity="0.22" strokeDasharray="16 9"/>
      <circle cx="80" cy="48" r="20" fill={accent2} opacity="0.18"/>
      <circle cx="80" cy="48" r="14" fill={accent} opacity="0.25"/>
      <circle cx="80" cy="48" r="8" fill={accent2} opacity="0.35"/>
      <line x1="80" y1="78" x2="80" y2="118" stroke={accent} strokeWidth="5" opacity="0.4"/>
      <circle cx="80" cy="120" r="5" fill={accent} opacity="0.3"/>
      <circle cx="24" cy="38" r="14" fill={accent2} opacity="0.18"/>
      <circle cx="24" cy="38" r="10" fill="none" stroke={accent} strokeWidth="3.5" strokeDasharray="9 6" opacity="0.3"/>
      <circle cx="24" cy="38" r="5" fill={accent} opacity="0.25"/>
      {([[45,12],[102,92],[14,92],[56,112],[108,25],[10,25]] as [number,number][]).map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={2.5 + (i % 2)} fill={i % 2 === 0 ? accent : accent2} opacity="0.45"/>
      ))}
    </svg>
  );

  if (theme === 'desert') return (
    <svg viewBox="0 0 120 130" style={svgStyle}>
      <circle cx="85" cy="33" r="24" fill={accent} opacity="0.12"/>
      <circle cx="85" cy="33" r="19" fill={accent2} opacity="0.18"/>
      <circle cx="85" cy="33" r="14" fill={accent} opacity="0.32"/>
      {([0,45,90,135,180,225,270,315] as number[]).map((deg, i) => (
        <line key={i}
          x1={85 + Math.cos(deg * Math.PI / 180) * 17}
          y1={33 + Math.sin(deg * Math.PI / 180) * 17}
          x2={85 + Math.cos(deg * Math.PI / 180) * 30}
          y2={33 + Math.sin(deg * Math.PI / 180) * 30}
          stroke={accent} strokeWidth="2.5" opacity="0.45"/>
      ))}
      <path d="M0 98 Q30 74 62 94 Q92 114 120 90 L120 130 L0 130 Z" fill={accent} opacity="0.3"/>
      <path d="M0 110 Q25 90 58 108 Q82 124 120 105 L120 130 L0 130 Z" fill={accent2} opacity="0.22"/>
      <rect x="12" y="72" width="7" height="32" fill={accent} opacity="0.45" rx="3.5"/>
      <path d="M12 86 Q2 83 2 72 L6 72 Q6 81 12 83" fill={accent} opacity="0.38"/>
      <path d="M19 84 Q29 81 29 70 L25 70 Q25 79 19 81" fill={accent} opacity="0.38"/>
    </svg>
  );

  if (theme === 'rhythm') return (
    <svg viewBox="0 0 120 130" style={svgStyle}>
      {([
        {x:4,  h:42}, {x:16, h:72}, {x:28, h:52}, {x:40, h:95},
        {x:52, h:62}, {x:64, h:85}, {x:76, h:48}, {x:88, h:105}, {x:100, h:58}, {x:112, h:78}
      ] as {x:number,h:number}[]).map((bar, i) => (
        <rect key={i} x={bar.x} y={130 - bar.h} width="10" height={bar.h}
          fill={i % 2 === 0 ? accent : accent2} opacity="0.5" rx="2"/>
      ))}
      <circle cx="38" cy="24" r="16" fill="none" stroke={accent} strokeWidth="2.5" opacity="0.45"/>
      <circle cx="38" cy="24" r="10" fill="none" stroke={accent2} strokeWidth="2" opacity="0.4"/>
      <circle cx="38" cy="24" r="5" fill={accent} opacity="0.55"/>
      <path d="M62 24 Q68 16 74 24 Q80 32 86 24" fill="none" stroke={accent2} strokeWidth="2.5" opacity="0.45"/>
      <path d="M58 24 Q67 12 76 24 Q85 36 94 24" fill="none" stroke={accent} strokeWidth="1.8" opacity="0.35"/>
      <path d="M54 24 Q66 8 78 24 Q90 40 102 24" fill="none" stroke={accent2} strokeWidth="1.2" opacity="0.25"/>
    </svg>
  );

  if (theme === 'pixel') return (
    <svg viewBox="0 0 120 130" style={svgStyle}>
      <g opacity="0.62">
        <rect x="38" y="22" width="44" height="38" fill={accent} opacity="0.45" rx="2"/>
        <rect x="46" y="30" width="10" height="10" fill={accent2} opacity="0.9"/>
        <rect x="64" y="30" width="10" height="10" fill={accent2} opacity="0.9"/>
        <rect x="46" y="46" width="28" height="5" fill={accent2} opacity="0.75"/>
        <rect x="56" y="13" width="8" height="10" fill={accent} opacity="0.55"/>
        <rect x="53" y="9" width="14" height="7" fill={accent2} opacity="0.65"/>
        <rect x="43" y="62" width="34" height="28" fill={accent} opacity="0.4" rx="1"/>
        <rect x="50" y="68" width="8" height="8" fill={accent2} opacity="0.75"/>
        <rect x="62" y="68" width="8" height="8" fill={accent2} opacity="0.6"/>
        <rect x="50" y="92" width="9" height="18" fill={accent} opacity="0.4"/>
        <rect x="61" y="92" width="9" height="18" fill={accent} opacity="0.4"/>
        <rect x="27" y="64" width="16" height="7" fill={accent} opacity="0.4"/>
        <rect x="77" y="64" width="16" height="7" fill={accent} opacity="0.4"/>
      </g>
      {([[8,18],[108,14],[12,102],[110,98],[8,54],[114,58]] as [number,number][]).map(([x,y],i) => (
        <rect key={i} x={x-3} y={y-3} width="6" height="6" fill={i % 2 === 0 ? accent : accent2} opacity="0.4"/>
      ))}
    </svg>
  );

  // default - hexagons + circuit
  return (
    <svg viewBox="0 0 120 130" style={svgStyle}>
      <polygon points="60,14 82,27 82,53 60,66 38,53 38,27" fill="none" stroke={accent} strokeWidth="2.5" opacity="0.55"/>
      <polygon points="88,40 110,53 110,79 88,92 66,79 66,53" fill="none" stroke={accent2} strokeWidth="1.8" opacity="0.4"/>
      <polygon points="32,44 54,57 54,83 32,96 10,83 10,57" fill="none" stroke={accent} strokeWidth="1.8" opacity="0.38"/>
      <circle cx="60" cy="40" r="12" fill={accent} opacity="0.18"/>
      <circle cx="60" cy="40" r="6" fill={accent} opacity="0.45"/>
      <circle cx="60" cy="40" r="2.5" fill="white" opacity="0.5"/>
      <path d="M60 66 L60 84 L38 84 L38 104" stroke={accent} strokeWidth="2" fill="none" opacity="0.45"/>
      <path d="M82 53 L104 53 L104 74" stroke={accent2} strokeWidth="2" fill="none" opacity="0.4"/>
      <circle cx="60" cy="84" r="3.5" fill={accent} opacity="0.55"/>
      <circle cx="38" cy="104" r="3.5" fill={accent2} opacity="0.5"/>
      <circle cx="104" cy="74" r="3.5" fill={accent} opacity="0.5"/>
    </svg>
  );
}

interface GameCaptionProps {
  slug: string;
  name: string;
  desc: string;
  cat: string;
  theme: string;
}

export const GameCaption: React.FC<GameCaptionProps> = ({ name, cat, theme }) => {
  const t = THEMES[theme] || THEMES.default;
  const catLabel = CAT_LABEL[cat] || cat;
  const displayName = name.length > 22 ? name.slice(0, 21) + '…' : name;
  const fontSize = displayName.length > 16 ? 17 : displayName.length > 12 ? 20 : 24;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: t.bg }} />

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 78% 38%, ${t.accent}28 0%, transparent 65%)`,
      }} />

      {/* Theme-specific artwork */}
      <ThemeArtwork theme={theme} accent={t.accent} accent2={t.accent2} />

      {/* Left gradient for text readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.38) 55%, transparent 82%)',
      }} />

      {/* Bottom gradient for text zone */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 45%, transparent 65%)',
      }} />

      {/* Text block at bottom-left */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0,
        padding: '0 12px 10px',
        maxWidth: '62%',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        <div style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          textShadow: `0 0 22px ${t.accent}77, 0 2px 10px rgba(0,0,0,0.95)`,
        }}>
          {displayName}
        </div>

        <div style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase' as const,
          color: '#fff',
          background: `${t.badge}e0`,
          padding: '2px 7px',
          borderRadius: 3,
          width: 'fit-content',
        }}>
          {catLabel}
        </div>
      </div>

      {/* Accent bottom line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 2.5,
        background: `linear-gradient(90deg, ${t.accent}, ${t.accent2} 60%, transparent)`,
        opacity: 0.85,
      }} />
    </AbsoluteFill>
  );
};
