import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GAMES } from './remotion/games-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'images', 'thumbs');
fs.mkdirSync(OUT, { recursive: true });

const CATS = { action: 'ACTION', arcade: 'ARCADE', puzzle: 'PUZZLE', rhythm: 'RHYTHM' };

const COLORS = {
  fire:    { bg1:'#2a0600', bg2:'#0a0200', accent:'#ff5500', accent2:'#ff8c00', badge:'#cc2200' },
  ocean:   { bg1:'#001830', bg2:'#000810', accent:'#00ccff', accent2:'#0088cc', badge:'#005588' },
  space:   { bg1:'#0c0420', bg2:'#030210', accent:'#9d4edd', accent2:'#c77dff', badge:'#6a1f9a' },
  neon:    { bg1:'#020a1c', bg2:'#010510', accent:'#00e5ff', accent2:'#00aacc', badge:'#006688' },
  forest:  { bg1:'#041608', bg2:'#020804', accent:'#44cc44', accent2:'#22aa22', badge:'#156615' },
  ice:     { bg1:'#061c28', bg2:'#030e16', accent:'#88ddff', accent2:'#55bbdd', badge:'#2288aa' },
  candy:   { bg1:'#200614', bg2:'#0e0308', accent:'#ff66cc', accent2:'#ff44aa', badge:'#aa1166' },
  desert:  { bg1:'#1e0e00', bg2:'#0a0500', accent:'#ffaa00', accent2:'#ff8800', badge:'#aa5500' },
  rhythm:  { bg1:'#120318', bg2:'#080110', accent:'#cc44ff', accent2:'#aa22ee', badge:'#770099' },
  pixel:   { bg1:'#050520', bg2:'#020210', accent:'#4466ff', accent2:'#2244dd', badge:'#1133aa' },
  default: { bg1:'#08060f', bg2:'#040408', accent:'#9d4edd', accent2:'#7b2fbe', badge:'#5a189a' },
};

function x(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Smart text layout: wrap into 1-2 lines, scale font to fit
function layout(name) {
  const words = name.split(' ');
  if (words.length === 1 || name.length <= 13) {
    const fs = name.length > 16 ? 14 : name.length > 13 ? 17 : 21;
    return { l1: name, l2: null, fs };
  }
  // Split at middle word boundary
  const mid = Math.ceil(words.length / 2);
  const l1 = words.slice(0, mid).join(' ');
  const l2 = words.slice(mid).join(' ');
  const longer = Math.max(l1.length, l2.length);
  const fs = longer > 15 ? 13 : longer > 12 ? 15 : longer > 9 ? 17 : 20;
  return { l1, l2, fs };
}

// ─────────────────────────────────────────────
// THEME ANIMATIONS
// ─────────────────────────────────────────────

function fireSVG(c) {
  return `
  <g>
    <!-- Large flame -->
    <g transform="translate(220,130)">
      <path d="M0,0 C-20,-38 -32,-72 -14,-100 C-7,-80 7,-76 11,-56 C15,-38 7,-20 0,0" fill="${c.accent}" opacity="0.85">
        <animateTransform attributeName="transform" type="scale" values="1,1;1.07,1.12;0.96,1.05;1,1" dur="1.1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.85;0.95;0.78;0.85" dur="1.1s" repeatCount="indefinite"/>
      </path>
      <path d="M0,0 C-10,-28 -15,-55 -6,-78 C-3,-62 6,-59 8,-44 C11,-30 4,-15 0,0" fill="${c.accent2}" opacity="0.7">
        <animateTransform attributeName="transform" type="scale" values="1,1;0.93,1.14;1.04,1.06;1,1" dur="0.85s" repeatCount="indefinite"/>
      </path>
    </g>
    <!-- Small side flame -->
    <g transform="translate(188,130)">
      <path d="M0,0 C-10,-22 -17,-44 -7,-62 C-3,-48 4,-45 6,-32 C8,-21 2,-10 0,0" fill="${c.accent}" opacity="0.6">
        <animateTransform attributeName="transform" type="scale" values="1,1;1.1,1.06;0.94,1.1;1,1" dur="1.4s" repeatCount="indefinite"/>
      </path>
    </g>
    <!-- Embers -->
    <circle cx="200" cy="90" r="2.5" fill="${c.accent2}" opacity="0">
      <animate attributeName="opacity" values="0;0.9;0.5;0" dur="1.8s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="translate" values="0,0;-6,-55;-10,-100" dur="1.8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="218" cy="70" r="2" fill="${c.accent}" opacity="0">
      <animate attributeName="opacity" values="0;0.8;0.3;0" dur="2.2s" begin="0.5s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="translate" values="0,0;8,-60;14,-105" dur="2.2s" begin="0.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="210" cy="55" r="1.5" fill="${c.accent2}" opacity="0">
      <animate attributeName="opacity" values="0;0.7;0;0" dur="1.5s" begin="1s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="translate" values="0,0;4,-45;6,-80" dur="1.5s" begin="1s" repeatCount="indefinite"/>
    </circle>
    <!-- Base glow -->
    <ellipse cx="212" cy="128" rx="48" ry="10" fill="${c.accent}" opacity="0.18">
      <animate attributeName="rx" values="48;56;48" dur="1.1s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.18;0.32;0.18" dur="1.1s" repeatCount="indefinite"/>
    </ellipse>
  </g>`;
}

function oceanSVG(c) {
  return `
  <g>
    <!-- Wave layer 1 -->
    <path fill="${c.accent}" opacity="0.35">
      <animate attributeName="d"
        values="M148,78 Q168,62 188,78 Q208,94 228,78 Q248,62 280,70 L280,130 L148,130 Z;
                M148,72 Q168,88 188,72 Q208,56 228,72 Q248,88 280,76 L280,130 L148,130 Z;
                M148,78 Q168,62 188,78 Q208,94 228,78 Q248,62 280,70 L280,130 L148,130 Z"
        dur="2.2s" repeatCount="indefinite"/>
    </path>
    <!-- Wave layer 2 -->
    <path fill="${c.accent}" opacity="0.5">
      <animate attributeName="d"
        values="M148,96 Q170,80 192,96 Q214,112 236,96 Q258,80 280,90 L280,130 L148,130 Z;
                M148,90 Q170,106 192,90 Q214,74 236,90 Q258,106 280,96 L280,130 L148,130 Z;
                M148,96 Q170,80 192,96 Q214,112 236,96 Q258,80 280,90 L280,130 L148,130 Z"
        dur="1.7s" repeatCount="indefinite"/>
    </path>
    <!-- Fish swimming right-to-left -->
    <g opacity="0.75">
      <animateTransform attributeName="transform" type="translate" values="285,52;148,68;285,52" dur="4.5s" repeatCount="indefinite"/>
      <ellipse cx="0" cy="0" rx="16" ry="8" fill="${c.accent}"/>
      <path d="M-16,0 L-26,-8 L-26,8 Z" fill="${c.accent}"/>
      <circle cx="9" cy="-2.5" r="2.5" fill="white" opacity="0.5"/>
    </g>
    <!-- Bubbles rising -->
    <circle cx="162" cy="118" r="4.5" fill="none" stroke="${c.accent}" stroke-width="1.8" opacity="0">
      <animate attributeName="cy" values="118;20" dur="2.8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.6;0.4;0" dur="2.8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="188" cy="125" r="3" fill="none" stroke="${c.accent}" stroke-width="1.5" opacity="0">
      <animate attributeName="cy" values="125;30" dur="2.2s" begin="0.7s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.5;0.3;0" dur="2.2s" begin="0.7s" repeatCount="indefinite"/>
    </circle>
    <circle cx="248" cy="120" r="3.5" fill="none" stroke="${c.accent}" stroke-width="1.5" opacity="0">
      <animate attributeName="cy" values="120;25" dur="3s" begin="1.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.5;0.3;0" dur="3s" begin="1.4s" repeatCount="indefinite"/>
    </circle>
  </g>`;
}

function spaceSVG(c) {
  const stars = Array.from({length:14}, (_,i) => {
    const sx = 148 + (i*29)%134, sy = 3 + (i*19)%85;
    const sr = i%4===0 ? 2.2 : 1.2;
    const dur = (1.4 + (i%5)*0.35).toFixed(1);
    const begin = (i*0.28).toFixed(1);
    return `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="white" opacity="0.35">
      <animate attributeName="opacity" values="0.35;0.9;0.35" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');

  return `
  <g>
    ${stars}
    <!-- Planet -->
    <circle cx="232" cy="55" r="30" fill="${c.accent}" opacity="0.1"/>
    <circle cx="232" cy="55" r="25" fill="none" stroke="${c.accent}" stroke-width="2.5" opacity="0.5">
      <animate attributeName="stroke-opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite"/>
    </circle>
    <!-- Orbit ring -->
    <ellipse cx="232" cy="55" rx="44" ry="9" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.45"/>
    <!-- Moon orbiting via animateMotion -->
    <circle r="5.5" fill="${c.accent2}" opacity="0.85">
      <animateMotion dur="3.2s" repeatCount="indefinite"
        path="M276,55 A44,9 0 0,1 188,55 A44,9 0 0,1 276,55"/>
    </circle>
    <!-- Shooting star -->
    <g opacity="0">
      <animate attributeName="opacity" values="0;0;1;0" dur="3.5s" begin="1s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="translate" values="280,15;148,55" dur="3.5s" begin="1s" repeatCount="indefinite"/>
      <line x1="0" y1="0" x2="22" y2="0" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
    </g>
  </g>`;
}

function neonSVG(c) {
  const vLines = [148,168,188,208,228,248,268].map(lx =>
    `<line x1="${lx}" y1="0" x2="${lx}" y2="130" stroke="${c.accent}" stroke-width="0.5" opacity="0.2"/>`
  ).join('');
  const hLines = [0,16,32,48,64,80,96,112,128].map(ly =>
    `<line x1="148" y1="${ly}" x2="280" y2="${ly}" stroke="${c.accent}" stroke-width="0.5" opacity="0.2"/>`
  ).join('');

  return `
  <g>
    ${vLines}${hLines}
    <!-- Nodes -->
    <circle cx="173" cy="30" r="5.5" fill="${c.accent}" opacity="0.7">
      <animate attributeName="r" values="5.5;8;5.5" dur="1.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;1;0.7" dur="1.4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="228" cy="68" r="5.5" fill="${c.accent}" opacity="0.7">
      <animate attributeName="r" values="5.5;8;5.5" dur="1.1s" begin="0.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;1;0.7" dur="1.1s" begin="0.4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="262" cy="30" r="4.5" fill="${c.accent}" opacity="0.6">
      <animate attributeName="r" values="4.5;7;4.5" dur="1.7s" begin="0.8s" repeatCount="indefinite"/>
    </circle>
    <!-- Circuit trace -->
    <path d="M173,30 L228,30 L228,68 L262,68" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.45"/>
    <!-- Travelling glow dot -->
    <circle r="4.5" fill="${c.accent}" opacity="0.95">
      <animateMotion dur="2s" repeatCount="indefinite"
        path="M173,30 L228,30 L228,68 L262,68"/>
      <animate attributeName="opacity" values="0.95;0.3;0.95" dur="2s" repeatCount="indefinite"/>
    </circle>
    <!-- Scanline -->
    <rect x="148" y="-4" width="132" height="4" fill="${c.accent}" opacity="0.07">
      <animateTransform attributeName="transform" type="translate" values="0,0;0,134" dur="2.8s" repeatCount="indefinite"/>
    </rect>
  </g>`;
}

function forestSVG(c) {
  return `
  <g>
    <!-- Tree 1 swaying -->
    <g>
      <animateTransform attributeName="transform" type="rotate"
        values="0 214 130;2.5 214 130;-2.5 214 130;0 214 130" dur="3s" repeatCount="indefinite"/>
      <polygon points="214,92 196,60 232,60" fill="${c.accent}" opacity="0.55"/>
      <polygon points="214,74 194,44 234,44" fill="${c.accent}" opacity="0.48"/>
      <rect x="211" y="92" width="7" height="22" fill="${c.accent}" opacity="0.4"/>
    </g>
    <!-- Tree 2 swaying -->
    <g>
      <animateTransform attributeName="transform" type="rotate"
        values="0 250 130;-2.5 250 130;2.5 250 130;0 250 130" dur="2.5s" begin="0.5s" repeatCount="indefinite"/>
      <polygon points="250,100 235,72 265,72" fill="${c.accent}" opacity="0.45"/>
      <polygon points="250,82 233,54 267,54" fill="${c.accent}" opacity="0.38"/>
      <rect x="247" y="100" width="6" height="20" fill="${c.accent}" opacity="0.35"/>
    </g>
    <!-- Falling leaf 1 -->
    <path d="M0,0 Q4,-5 8,0 Q4,5 0,0" fill="${c.accent}" opacity="0.65">
      <animateMotion dur="3s" repeatCount="indefinite"
        path="M215,5 C204,35 224,58 208,88 C198,110 218,122 212,130"/>
      <animateTransform attributeName="transform" type="rotate" values="0;360" dur="3s" repeatCount="indefinite"/>
    </path>
    <!-- Falling leaf 2 -->
    <path d="M0,0 Q3,-4 7,0 Q3,4 0,0" fill="${c.accent2}" opacity="0.5">
      <animateMotion dur="2.6s" begin="1.1s" repeatCount="indefinite"
        path="M244,4 C233,32 252,54 238,82 C228,104 248,116 242,130"/>
      <animateTransform attributeName="transform" type="rotate" values="0;-360" dur="2.6s" begin="1.1s" repeatCount="indefinite"/>
    </path>
    <!-- Firefly 1 -->
    <circle cx="168" cy="58" r="2.8" fill="${c.accent}" opacity="0">
      <animate attributeName="opacity" values="0;0.85;0" dur="1.3s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="translate" values="0,0;9,-6;3,9;0,0" dur="3.2s" repeatCount="indefinite"/>
    </circle>
    <!-- Firefly 2 -->
    <circle cx="267" cy="42" r="2.2" fill="${c.accent}" opacity="0">
      <animate attributeName="opacity" values="0;0.75;0" dur="1.6s" begin="0.7s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="translate" values="0,0;-7,9;4,-4;0,0" dur="4s" begin="0.7s" repeatCount="indefinite"/>
    </circle>
    <!-- Ground -->
    <rect x="148" y="116" width="132" height="14" fill="${c.accent}" opacity="0.1"/>
  </g>`;
}

function iceSVG(c) {
  const arms = [0,30,60,90,120,150].map(deg => {
    const rad = deg * Math.PI / 180;
    const ex = (230 + Math.cos(rad)*30).toFixed(1);
    const ey = (52 + Math.sin(rad)*30).toFixed(1);
    const mx = (230 + Math.cos(rad)*18).toFixed(1);
    const my = (52 + Math.sin(rad)*18).toFixed(1);
    return `<line x1="230" y1="52" x2="${ex}" y2="${ey}" stroke="${c.accent}" stroke-width="2.5" opacity="0.7"/>
    <circle cx="${mx}" cy="${my}" r="3" fill="${c.accent}" opacity="0.5"/>
    <circle cx="${ex}" cy="${ey}" r="2.2" fill="${c.accent2}" opacity="0.65"/>`;
  }).join('');

  const snow = Array.from({length:9}, (_,i) => {
    const sx = 152 + i*15, dur = (1.6+i*0.28).toFixed(1), begin = (i*0.35).toFixed(1);
    return `<circle cx="${sx}" cy="0" r="${i%2===0?2:1.5}" fill="white" opacity="0.45">
      <animateTransform attributeName="transform" type="translate"
        values="0,0;${i%2===0?4:-4},130" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.45;0.15" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');

  return `
  <g>
    <!-- Rotating snowflake -->
    <g>
      <animateTransform attributeName="transform" type="rotate"
        values="0 230 52;360 230 52" dur="8s" repeatCount="indefinite"/>
      ${arms}
      <circle cx="230" cy="52" r="7" fill="${c.accent}" opacity="0.85"/>
      <circle cx="230" cy="52" r="3.5" fill="white" opacity="0.55"/>
    </g>
    <!-- Pulse ring -->
    <circle cx="230" cy="52" r="34" fill="none" stroke="${c.accent}" stroke-width="1.2" opacity="0.18">
      <animate attributeName="r" values="34;40;34" dur="2.2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.18;0.42;0.18" dur="2.2s" repeatCount="indefinite"/>
    </circle>
    <!-- Falling snow -->
    ${snow}
  </g>`;
}

function candySVG(c) {
  return `
  <g>
    <!-- Lollipop stick -->
    <line x1="232" y1="96" x2="232" y2="125" stroke="${c.accent}" stroke-width="6" stroke-linecap="round"/>
    <!-- Spinning lollipop -->
    <g>
      <animateTransform attributeName="transform" type="rotate"
        values="0 232 55;360 232 55" dur="4s" repeatCount="indefinite"/>
      <circle cx="232" cy="55" r="30" fill="${c.accent}" opacity="0.1"/>
      <circle cx="232" cy="55" r="26" fill="none" stroke="${c.accent}" stroke-width="8" stroke-dasharray="20 11" opacity="0.32"/>
      <circle cx="232" cy="55" r="18" fill="${c.accent}" opacity="0.18"/>
      <circle cx="232" cy="55" r="11" fill="${c.accent}" opacity="0.32"/>
      <circle cx="232" cy="55" r="5" fill="${c.accent2}" opacity="0.7"/>
    </g>
    <!-- Bouncing candy A -->
    <g>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,-10;0,0" dur="0.85s" repeatCount="indefinite"/>
      <circle cx="168" cy="36" r="8" fill="${c.accent}" opacity="0.42"/>
      <circle cx="168" cy="36" r="4" fill="white" opacity="0.25"/>
    </g>
    <!-- Bouncing candy B -->
    <g>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,-8;0,0" dur="1.05s" begin="0.32s" repeatCount="indefinite"/>
      <circle cx="262" cy="24" r="6" fill="${c.accent2}" opacity="0.4"/>
    </g>
    <!-- Bouncing candy C -->
    <g>
      <animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur="1.2s" begin="0.65s" repeatCount="indefinite"/>
      <circle cx="154" cy="68" r="5" fill="${c.accent}" opacity="0.35"/>
    </g>
    <!-- Sparkle -->
    <circle cx="202" cy="18" r="2.5" fill="${c.accent2}" opacity="0.5">
      <animate attributeName="r" values="2.5;4;2.5" dur="0.75s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;1;0.5" dur="0.75s" repeatCount="indefinite"/>
    </circle>
    <circle cx="272" cy="78" r="2" fill="white" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.1s" begin="0.4s" repeatCount="indefinite"/>
    </circle>
  </g>`;
}

function desertSVG(c) {
  const rays = [0,45,90,135,180,225,270,315].map(deg => {
    const rad = deg * Math.PI / 180;
    const x1 = (233+Math.cos(rad)*16).toFixed(1), y1 = (38+Math.sin(rad)*16).toFixed(1);
    const x2 = (233+Math.cos(rad)*30).toFixed(1), y2 = (38+Math.sin(rad)*30).toFixed(1);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c.accent}" stroke-width="2.5" opacity="0.45"/>`;
  }).join('');

  const sand = Array.from({length:6}, (_,i) => {
    const sy = 78 + i*7, dur = (1.8+i*0.35).toFixed(1);
    return `<circle cx="150" cy="${sy}" r="1.8" fill="${c.accent}" opacity="0">
      <animate attributeName="opacity" values="0;0.45;0.45;0" dur="${dur}s" begin="${i*0.5}s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="translate" values="0,0;130,0" dur="${dur}s" begin="${i*0.5}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');

  return `
  <g>
    <!-- Rotating sun -->
    <g>
      <animateTransform attributeName="transform" type="rotate"
        values="0 233 38;360 233 38" dur="14s" repeatCount="indefinite"/>
      ${rays}
    </g>
    <circle cx="233" cy="38" r="15" fill="${c.accent}" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.48;0.3" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="233" cy="38" r="10" fill="${c.accent}" opacity="0.48"/>
    <!-- Animated dunes -->
    <path fill="${c.accent}" opacity="0.28">
      <animate attributeName="d"
        values="M148,94 Q172,74 200,90 Q228,108 256,90 Q268,84 280,88 L280,130 L148,130 Z;
                M148,98 Q172,78 200,94 Q228,112 256,94 Q268,88 280,92 L280,130 L148,130 Z;
                M148,94 Q172,74 200,90 Q228,108 256,90 Q268,84 280,88 L280,130 L148,130 Z"
        dur="3s" repeatCount="indefinite"/>
    </path>
    <!-- Drifting sand -->
    ${sand}
  </g>`;
}

function rhythmSVG(c) {
  const bars = [
    {x:150,h:35,d:0.48},{x:162,h:68,d:0.38},{x:174,h:46,d:0.6},
    {x:186,h:88,d:0.33},{x:198,h:56,d:0.44},{x:210,h:78,d:0.5},
    {x:222,h:42,d:0.52},{x:234,h:98,d:0.36},{x:246,h:52,d:0.42},
    {x:258,h:72,d:0.46},{x:270,h:40,d:0.54}
  ].map((b,i) => {
    const minH = Math.max(6, b.h-32), maxH = Math.min(105, b.h+22);
    return `<rect x="${b.x}" y="${130-b.h}" width="9" height="${b.h}"
      fill="${i%2===0?c.accent:c.accent2}" opacity="0.55" rx="2">
      <animate attributeName="height" values="${b.h};${minH};${maxH};${b.h}" dur="${b.d}s" repeatCount="indefinite"/>
      <animate attributeName="y" values="${130-b.h};${130-minH};${130-maxH};${130-b.h}" dur="${b.d}s" repeatCount="indefinite"/>
    </rect>`;
  }).join('');

  return `
  <g>
    ${bars}
    <!-- Pulse rings -->
    <circle cx="192" cy="42" r="14" fill="none" stroke="${c.accent}" stroke-width="2.5" opacity="0.35">
      <animate attributeName="r" values="14;22;14" dur="1s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.35;0;0.35" dur="1s" repeatCount="indefinite"/>
    </circle>
    <circle cx="192" cy="42" r="7" fill="${c.accent}" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1s" repeatCount="indefinite"/>
      <animate attributeName="r" values="7;9;7" dur="1s" repeatCount="indefinite"/>
    </circle>
    <!-- Sound waves -->
    <path d="M205,42 Q210,34 215,42 Q220,50 225,42" fill="none" stroke="${c.accent2}" stroke-width="2" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1s" repeatCount="indefinite"/>
    </path>
    <path d="M203,42 Q210,29 217,42 Q224,55 231,42" fill="none" stroke="${c.accent}" stroke-width="1.5" opacity="0.35">
      <animate attributeName="opacity" values="0.35;0.7;0.35" dur="1s" begin="0.1s" repeatCount="indefinite"/>
    </path>
  </g>`;
}

function pixelSVG(c) {
  const grid = Array.from({length:5}, (_,col) =>
    Array.from({length:4}, (_,row) =>
      `<rect x="${152+col*26}" y="${row*28}" width="10" height="10" fill="${c.accent}" opacity="0.07" rx="1"/>`
    ).join('')
  ).join('');

  return `
  <g>
    ${grid}
    <!-- Robot walking left-to-right then back -->
    <g>
      <animateTransform attributeName="transform" type="translate"
        values="148,28;272,44;148,28" dur="4s" repeatCount="indefinite"/>
      <!-- Body -->
      <rect x="-13" y="0" width="26" height="24" fill="${c.accent}" opacity="0.55" rx="2"/>
      <!-- Head -->
      <rect x="-11" y="-20" width="22" height="17" fill="${c.accent}" opacity="0.6" rx="1"/>
      <!-- Eyes: left blinks -->
      <rect x="-7" y="-16" width="6" height="7" fill="${c.accent2}" opacity="0.9"/>
      <rect x="2" y="-16" width="6" height="7" fill="${c.accent2}" opacity="0.9">
        <animate attributeName="height" values="7;1;7" dur="0.18s" begin="1.5s" repeatCount="indefinite"/>
        <animate attributeName="y" values="-16;-13;-16" dur="0.18s" begin="1.5s" repeatCount="indefinite"/>
      </rect>
      <!-- Left leg alternates -->
      <rect x="-9" y="24" width="9" height="14" fill="${c.accent}" opacity="0.5" rx="1">
        <animate attributeName="height" values="14;6;14" dur="0.42s" repeatCount="indefinite"/>
        <animate attributeName="y" values="24;32;24" dur="0.42s" repeatCount="indefinite"/>
      </rect>
      <!-- Right leg alternates -->
      <rect x="2" y="24" width="9" height="14" fill="${c.accent}" opacity="0.5" rx="1">
        <animate attributeName="height" values="6;14;6" dur="0.42s" repeatCount="indefinite"/>
        <animate attributeName="y" values="32;24;32" dur="0.42s" repeatCount="indefinite"/>
      </rect>
      <!-- Arms swing -->
      <rect x="-20" y="2" width="9" height="7" fill="${c.accent}" opacity="0.45" rx="1">
        <animate attributeName="y" values="2;6;2" dur="0.42s" repeatCount="indefinite"/>
      </rect>
      <rect x="13" y="6" width="9" height="7" fill="${c.accent}" opacity="0.45" rx="1">
        <animate attributeName="y" values="6;2;6" dur="0.42s" repeatCount="indefinite"/>
      </rect>
    </g>
    <!-- Pixel score dots -->
    <rect x="152" y="8" width="8" height="8" fill="${c.accent}" opacity="0.45" rx="1">
      <animate attributeName="opacity" values="0.45;0.9;0.45" dur="1s" repeatCount="indefinite"/>
    </rect>
    <rect x="165" y="8" width="8" height="8" fill="${c.accent2}" opacity="0.35" rx="1">
      <animate attributeName="opacity" values="0.35;0.8;0.35" dur="1.3s" begin="0.3s" repeatCount="indefinite"/>
    </rect>
    <rect x="178" y="8" width="8" height="8" fill="${c.accent}" opacity="0.3" rx="1">
      <animate attributeName="opacity" values="0.3;0.7;0.3" dur="0.9s" begin="0.6s" repeatCount="indefinite"/>
    </rect>
  </g>`;
}

function defaultSVG(c) {
  const teeth1 = [0,36,72,108,144,180,216,252,288,324].map(deg => {
    const rad = deg*Math.PI/180;
    const tx=(238+Math.cos(rad)*23).toFixed(1), ty=(58+Math.sin(rad)*23).toFixed(1);
    return `<rect x="${(parseFloat(tx)-3).toFixed(1)}" y="${(parseFloat(ty)-4).toFixed(1)}" width="6" height="8" fill="${c.accent}" opacity="0.45" rx="1" transform="rotate(${deg} ${tx} ${ty})"/>`;
  }).join('');
  const teeth2 = [0,45,90,135,180,225,270,315].map(deg => {
    const rad = deg*Math.PI/180;
    const tx=(213+Math.cos(rad)*15).toFixed(1), ty=(85+Math.sin(rad)*15).toFixed(1);
    return `<rect x="${(parseFloat(tx)-2.5).toFixed(1)}" y="${(parseFloat(ty)-3.5).toFixed(1)}" width="5" height="7" fill="${c.accent}" opacity="0.38" rx="1" transform="rotate(${deg} ${tx} ${ty})"/>`;
  }).join('');

  return `
  <g>
    <!-- Gear 1 - clockwise -->
    <g>
      <animateTransform attributeName="transform" type="rotate"
        values="0 238 58;360 238 58" dur="5s" repeatCount="indefinite"/>
      <circle cx="238" cy="58" r="23" fill="none" stroke="${c.accent}" stroke-width="2.5" opacity="0.45"/>
      <circle cx="238" cy="58" r="10" fill="${c.accent}" opacity="0.15"/>
      <circle cx="238" cy="58" r="5" fill="${c.accent}" opacity="0.55"/>
      ${teeth1}
    </g>
    <!-- Gear 2 - counter-clockwise -->
    <g>
      <animateTransform attributeName="transform" type="rotate"
        values="0 213 85;-360 213 85" dur="3.2s" repeatCount="indefinite"/>
      <circle cx="213" cy="85" r="15" fill="none" stroke="${c.accent}" stroke-width="2" opacity="0.38"/>
      <circle cx="213" cy="85" r="6" fill="${c.accent}" opacity="0.45"/>
      ${teeth2}
    </g>
    <!-- Hexagon pulsing -->
    <polygon points="172,38 188,29 204,38 204,56 188,65 172,56"
      fill="none" stroke="${c.accent}" stroke-width="1.8" opacity="0.38">
      <animate attributeName="opacity" values="0.38;0.7;0.38" dur="2.2s" repeatCount="indefinite"/>
    </polygon>
    <polygon points="172,38 188,29 204,38 204,56 188,65 172,56"
      fill="${c.accent}" opacity="0.06">
      <animate attributeName="opacity" values="0.06;0.16;0.06" dur="2.2s" repeatCount="indefinite"/>
    </polygon>
  </g>`;
}

const ANIMS = {
  fire: fireSVG, ocean: oceanSVG, space: spaceSVG, neon: neonSVG,
  forest: forestSVG, ice: iceSVG, candy: candySVG, desert: desertSVG,
  rhythm: rhythmSVG, pixel: pixelSVG, default: defaultSVG,
};

// ─────────────────────────────────────────────
// MAIN GENERATOR
// ─────────────────────────────────────────────

function generateSVG(slug, name, desc, cat, theme) {
  const c = COLORS[theme] || COLORS.default;
  const animFn = ANIMS[theme] || ANIMS.default;
  const catLabel = CATS[cat] || cat.toUpperCase();
  const id = slug.replace(/[^a-z0-9]/gi, '-');

  const { l1, l2, fs } = layout(name);
  const badgeW = catLabel.length * 6.8 + 18;
  const textY = l2 ? 88 : 96;
  const line2Y = textY + fs * 1.25;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 130" width="280" height="130">
  <defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.bg1}"/>
      <stop offset="100%" stop-color="${c.bg2}"/>
    </linearGradient>
    <radialGradient id="gl${id}" cx="76%" cy="38%" r="44%">
      <stop offset="0%" stop-color="${c.accent}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${c.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="tf${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(0,0,0,0.78)"/>
      <stop offset="52%" stop-color="rgba(0,0,0,0.45)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </linearGradient>
    <linearGradient id="bf${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.82)"/>
    </linearGradient>
    <linearGradient id="al${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${c.accent}"/>
      <stop offset="60%" stop-color="${c.accent}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${c.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="280" height="130" fill="url(#bg${id})"/>
  <rect width="280" height="130" fill="url(#gl${id})"/>

  ${animFn(c)}

  <rect width="280" height="130" fill="url(#tf${id})"/>
  <rect width="280" height="130" fill="url(#bf${id})"/>

  <text x="12" y="${textY}"
    font-family="Inter, system-ui, sans-serif"
    font-size="${fs}" font-weight="800" fill="white"
    paint-order="stroke" stroke="rgba(0,0,0,0.6)" stroke-width="3" stroke-linejoin="round"
  >${x(l1)}</text>
  ${l2 ? `<text x="12" y="${line2Y}"
    font-family="Inter, system-ui, sans-serif"
    font-size="${fs}" font-weight="800" fill="white"
    paint-order="stroke" stroke="rgba(0,0,0,0.6)" stroke-width="3" stroke-linejoin="round"
  >${x(l2)}</text>` : ''}

  <rect x="12" y="113" width="${badgeW.toFixed(0)}" height="14" fill="${c.badge}" opacity="0.92" rx="2.5"/>
  <text x="19" y="123.5"
    font-family="Inter, system-ui, sans-serif"
    font-size="8" font-weight="700" letter-spacing="1" fill="white"
  >${catLabel}</text>

  <rect y="128" width="280" height="2.5" fill="url(#al${id})"/>
</svg>`;
}

let done = 0;
for (const [slug, name, desc, cat, theme] of GAMES) {
  const svg = generateSVG(slug, name, desc, cat, theme);
  fs.writeFileSync(path.join(OUT, `${slug}.svg`), svg, 'utf8');
  done++;
  process.stdout.write(`\r${done}/${GAMES.length} — ${slug}                    `);
}
console.log(`\n\nDone! ${done} animated SVGs in images/thumbs/`);
