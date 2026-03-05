import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GAMES } from './remotion/games-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'images', 'thumbs');
fs.mkdirSync(OUT, { recursive: true });

// ── Seeded PRNG ──
function mkRand(slug) {
  let s = 0;
  for (const c of slug) s = (Math.imul(s, 31) + c.charCodeAt(0)) | 0;
  s = s >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) | 0; return (s >>> 0) / 0xffffffff; };
}

// ── Colors ──
const COLORS = {
  fire:    { bg1:'#2a0600', bg2:'#0a0200', a1:'#ff5500', a2:'#ff8c00', badge:'#cc2200' },
  ocean:   { bg1:'#001830', bg2:'#000810', a1:'#00ccff', a2:'#0088cc', badge:'#005588' },
  space:   { bg1:'#0c0420', bg2:'#030210', a1:'#9d4edd', a2:'#c77dff', badge:'#6a1f9a' },
  neon:    { bg1:'#020a1c', bg2:'#010510', a1:'#00e5ff', a2:'#00aacc', badge:'#006688' },
  forest:  { bg1:'#041608', bg2:'#020804', a1:'#44cc44', a2:'#22aa22', badge:'#156615' },
  ice:     { bg1:'#061c28', bg2:'#030e16', a1:'#88ddff', a2:'#55bbdd', badge:'#2288aa' },
  candy:   { bg1:'#200614', bg2:'#0e0308', a1:'#ff66cc', a2:'#ff44aa', badge:'#aa1166' },
  desert:  { bg1:'#1e0e00', bg2:'#0a0500', a1:'#ffaa00', a2:'#ff8800', badge:'#aa5500' },
  rhythm:  { bg1:'#120318', bg2:'#080110', a1:'#cc44ff', a2:'#aa22ee', badge:'#770099' },
  pixel:   { bg1:'#050520', bg2:'#020210', a1:'#4466ff', a2:'#2244dd', badge:'#1133aa' },
  default: { bg1:'#08060f', bg2:'#040408', a1:'#9d4edd', a2:'#7b2fbe', badge:'#5a189a' },
};

const CATS = { action:'ACTION', arcade:'ARCADE', puzzle:'PUZZLE', rhythm:'RHYTHM' };

function xe(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Animation type from keywords ──
const RULES = [
  ['stack',    ['stack','tower','pile','pyramid','balance','build','height']],
  ['dash',     ['dash','sprint','rush','race','surge','speed']],
  ['zigzag',   ['zigzag','narrow','weave']],
  ['bubbles',  ['bubble','aqua','shrink','pool','merge','droplet']],
  ['orbit',    ['orbit','astro','cosmic','nebula','stellar','planet','comet']],
  ['pulse',    ['pulse','beat','echo','sync','tempo','mushroom','tap','flicker']],
  ['gravity',  ['gravity','flip','fathom','plunge']],
  ['circuit',  ['circuit','coil','link','connect','tether','pipe','align','trace']],
  ['bounce',   ['bounce','hop','leap','pong','flap','rebound','jam','pop','juggle']],
  ['spiral',   ['spiral','twist','warp','spin','vortex','swirl','loop','orbit-spiral']],
  ['beam',     ['beam','glow','glitch','prism','neon','laser','glare']],
  ['burst',    ['burst','explode','fuse','splitter','split','bloom','divide','break']],
  ['climb',    ['climb','rise','ascent','vault','soar','flight','plunge','surge']],
  ['catch',    ['catch','collect','scoop','tally','snacker','grab','serve','scavenger']],
  ['wave',     ['wave','current','tide','reef','coral','splash','flood','flow','wash']],
  ['match',    ['match','color','hue','swap','combo','sort','twin','dual','collector']],
  ['runner',   ['runner','chase','escape','trail','trek','flee','streak']],
  ['swing',    ['swing','vine','branch','twig','canopy','jungle','flap']],
  ['particles',['ash','sand','ember','dust','mist','dusk','smoke','fog']],
  ['gears',    ['gear','cog','valve','steam','turbo','steampile','machinery']],
  ['crystal',  ['frost','ice','glacier','polar','crystal','icebound','frostfall']],
  ['magnet',   ['magnet','magnetic','attract','pull','repel','charge','field']],
  ['lava',     ['lava','magma','molten','crater','volcano']],
  ['pixelanim',['pixel','retro','bit','digital','classic','arcade-bit']],
  ['drift',    ['drift','float','cloud','nimbus','veil','mirage','haze','glide']],
];

function getType(slug, desc) {
  const t = (slug + ' ' + desc).toLowerCase();
  for (const [type, keys] of RULES)
    if (keys.some(k => t.includes(k))) return type;
  return 'drift';
}

// ── Text layout (centered, no cutoff) ──
function textLayout(name) {
  const words = name.split(' ');
  if (words.length === 1 || name.length <= 12) {
    const fs = name.length > 16 ? 14 : name.length > 12 ? 17 : 20;
    return { l1: name, l2: null, fs };
  }
  const mid = Math.ceil(words.length / 2);
  const l1 = words.slice(0, mid).join(' ');
  const l2 = words.slice(mid).join(' ');
  const longer = Math.max(l1.length, l2.length);
  const fs = longer > 16 ? 12 : longer > 12 ? 15 : 18;
  return { l1, l2, fs };
}

// ─────────────────────────────────────────────────────────
// ANIMATION FUNCTIONS  (c = colors, r = seeded rand)
// All elements centered around SVG center 140,65
// ─────────────────────────────────────────────────────────

function animStack(c, r) {
  const n = 3 + Math.floor(r() * 3);
  const bw = 28 + r() * 30, bh = 10 + r() * 8;
  const spd = 0.7 + r() * 1.2;
  const cx = 100 + r() * 80;
  return Array.from({length:n}, (_,i) => {
    const by = 118 - i*(bh+3), delay = (i*0.55*spd).toFixed(2), dur = (1.1*spd).toFixed(2);
    const col = i%2===0?c.a1:c.a2;
    return `<rect x="${(cx-bw/2).toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${col}" opacity="0" rx="2">
      <animate attributeName="opacity" values="0;0.7;0.7" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="y" values="${-bh};${by};${by}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4,0,0.2,1 0,0,1,1"/>
    </rect>`;
  }).join('');
}

function animDash(c, r) {
  const n = 5 + Math.floor(r() * 5);
  return Array.from({length:n}, (_,i) => {
    const y = 12 + (i/n)*106 + r()*8, len = 25+r()*60;
    const dur = (0.5+r()*0.7).toFixed(2), delay = (r()*1.5).toFixed(2);
    const sw = (1+r()*3).toFixed(1), op = (0.3+r()*0.5).toFixed(2);
    return `<line x1="280" y1="${y.toFixed(1)}" x2="${(280+len).toFixed(1)}" y2="${y.toFixed(1)}"
      stroke="${i%2===0?c.a1:c.a2}" stroke-width="${sw}" stroke-linecap="round" opacity="0">
      <animateTransform attributeName="transform" type="translate" values="0,0;${-(285+len)},0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;${op};${op};0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
    </line>`;
  }).join('');
}

function animZigzag(c, r) {
  const amp = 20+r()*30, spd = (0.9+r()*1.2).toFixed(2);
  const cx = 80+r()*100, rows = 4+Math.floor(r()*3);
  const pts = Array.from({length:rows*2}, (_,i) => {
    const x = cx + (i%2===0?-amp:amp), y = 15 + i*(95/(rows*2));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const p = 'M'+pts.join('L');
  return `<path d="${p}" fill="none" stroke="${c.a1}" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.3"/>
  <circle r="${6+r()*5}" fill="${c.a1}" opacity="0.85">
    <animateMotion dur="${spd}s" repeatCount="indefinite" path="${p}" rotate="auto"/>
  </circle>
  <circle r="3" fill="white" opacity="0.5">
    <animateMotion dur="${spd}s" repeatCount="indefinite" path="${p}" rotate="auto"/>
  </circle>`;
}

function animBubbles(c, r) {
  const n = 3+Math.floor(r()*4);
  return Array.from({length:n}, (_,i) => {
    const x = 60+r()*160, sz = 5+r()*20;
    const dur = (1.8+r()*2).toFixed(2), delay = (r()*2.5).toFixed(2);
    const filled = r()>0.55;
    return `<circle cx="${x.toFixed(1)}" cy="135" r="${sz.toFixed(1)}"
      fill="${filled?c.a1:'none'}" stroke="${c.a1}" stroke-width="${filled?0:1.8}" opacity="0">
      <animate attributeName="cy" values="135;${-sz}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.6;0.4;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');
}

function animOrbit(c, r) {
  const cx = 90+r()*100, cy = 30+r()*50;
  const rx1 = 28+r()*20, ry1 = (rx1*0.18).toFixed(1);
  const spd1 = (2+r()*2).toFixed(2);
  const rx2 = rx1+15+r()*20, ry2 = (rx2*0.18).toFixed(1);
  const spd2 = (spd1*1.6).toFixed(2);
  const path1 = `M${cx+rx1},${cy} A${rx1},${ry1} 0 0,1 ${cx-rx1},${cy} A${rx1},${ry1} 0 0,1 ${cx+rx1},${cy}`;
  const path2 = `M${cx+rx2},${cy} A${rx2},${ry2} 0 0,1 ${cx-rx2},${cy} A${rx2},${ry2} 0 0,1 ${cx+rx2},${cy}`;
  return `<circle cx="${cx}" cy="${cy}" r="${8+r()*10}" fill="${c.a1}" opacity="0.25"/>
  <circle cx="${cx}" cy="${cy}" r="${4+r()*5}" fill="${c.a1}" opacity="0.6"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx1}" ry="${ry1}" fill="none" stroke="${c.a1}" stroke-width="1.5" opacity="0.35"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx2}" ry="${ry2}" fill="none" stroke="${c.a2}" stroke-width="1" opacity="0.25"/>
  <circle r="5" fill="${c.a2}" opacity="0.85">
    <animateMotion dur="${spd1}s" repeatCount="indefinite" path="${path1}"/>
  </circle>
  <circle r="3.5" fill="${c.a1}" opacity="0.7">
    <animateMotion dur="${spd2}s" repeatCount="indefinite" path="${path2}"/>
  </circle>`;
}

function animPulse(c, r) {
  const cx = 80+r()*100, cy = 30+r()*50;
  const n = 3+Math.floor(r()*3);
  const spd = (1+r()*1.5).toFixed(2);
  const rings = Array.from({length:n}, (_,i) => {
    const delay = (i*spd/n).toFixed(2);
    return `<circle cx="${cx}" cy="${cy}" r="8" fill="none" stroke="${c.a1}" stroke-width="2.5" opacity="0">
      <animate attributeName="r" values="8;${40+r()*20}" dur="${spd}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;0" dur="${spd}s" begin="${delay}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');
  return `${rings}<circle cx="${cx}" cy="${cy}" r="7" fill="${c.a1}" opacity="0.7">
    <animate attributeName="r" values="7;9;7" dur="${(spd*0.5).toFixed(2)}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.7;1;0.7" dur="${(spd*0.5).toFixed(2)}s" repeatCount="indefinite"/>
  </circle>`;
}

function animGravity(c, r) {
  const n = 3+Math.floor(r()*3);
  const spd = (1.2+r()*1).toFixed(2);
  return Array.from({length:n}, (_,i) => {
    const x = 50+r()*180, sz = 5+r()*12;
    const delay = (i*0.4).toFixed(2);
    const col = i%2===0?c.a1:c.a2;
    return `<circle cx="${x.toFixed(1)}" cy="${sz}" r="${sz.toFixed(1)}" fill="${col}" opacity="0.7">
      <animate attributeName="cy" values="${sz};${125-sz};${sz}" dur="${spd}s" begin="${delay}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4,0,0.6,1 0.4,0,0.6,1"/>
      <animate attributeName="opacity" values="0.7;0.9;0.7" dur="${spd}s" begin="${delay}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');
}

function animCircuit(c, r) {
  const sx = 50+r()*60, sy = 15+r()*20;
  const pts = [[sx,sy]];
  let cx2 = sx, cy2 = sy;
  const dirs = [[1,0],[0,1],[-1,0],[0,-1],[1,0],[0,1]];
  for (let i = 0; i < 5; i++) {
    const [dx,dy] = dirs[i];
    const step = 30+r()*40;
    cx2 = Math.min(265, Math.max(15, cx2+dx*step));
    cy2 = Math.min(115, Math.max(15, cy2+dy*step));
    pts.push([cx2, cy2]);
  }
  const p = 'M'+pts.map(([a,b])=>`${a.toFixed(0)},${b.toFixed(0)}`).join('L');
  const spd = (1.5+r()*1.5).toFixed(2);
  const nodes = pts.map(([a,b], i) => i===0||i===pts.length-1 ?
    `<circle cx="${a.toFixed(0)}" cy="${b.toFixed(0)}" r="5" fill="${c.a1}" opacity="0.65">
      <animate attributeName="opacity" values="0.65;1;0.65" dur="${(0.8+i*0.2).toFixed(2)}s" repeatCount="indefinite"/>
    </circle>` : `<circle cx="${a.toFixed(0)}" cy="${b.toFixed(0)}" r="3" fill="${c.a2}" opacity="0.5"/>`
  ).join('');
  return `<path d="${p}" fill="none" stroke="${c.a1}" stroke-width="2" opacity="0.4"/>
  ${nodes}
  <circle r="5" fill="${c.a1}" opacity="0.9">
    <animateMotion dur="${spd}s" repeatCount="indefinite" path="${p}"/>
  </circle>`;
}

function animBounce(c, r) {
  const cx = 80+r()*100;
  const sz = 8+r()*10;
  const spd = (0.8+r()*0.8).toFixed(2);
  const ys = [125-sz, 90, 65, 50, 42, 37, 34, 32, 125-sz];
  const bounceVals = ys.map(y=>y.toFixed(1)).join(';');
  const n = 3+Math.floor(r()*3);
  const trail = Array.from({length:n}, (_,i) => {
    const d = (i+1)*0.04;
    return `<circle cx="${cx.toFixed(1)}" cy="60" r="${(sz*0.6).toFixed(1)}" fill="${c.a2}" opacity="${(0.15-i*0.04).toFixed(2)}">
      <animate attributeName="cy" values="${bounceVals}" dur="${spd}s" begin="${-d}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');
  return `${trail}<circle cx="${cx.toFixed(1)}" cy="60" r="${sz.toFixed(1)}" fill="${c.a1}" opacity="0.85">
    <animate attributeName="cy" values="${bounceVals}" dur="${spd}s" repeatCount="indefinite" calcMode="spline"
      keySplines="0.4,0,0.2,1;0.4,0,0.2,1;0.4,0,0.2,1;0.4,0,0.2,1;0.4,0,0.2,1;0.4,0,0.2,1;0.4,0,0.2,1;0.4,0,0.2,1"/>
    <animate attributeName="rx" values="${sz};${sz*1.3};${sz};${sz*1.3};${sz};${sz*1.3};${sz};${sz*1.3};${sz}" dur="${spd}s" repeatCount="indefinite"/>
  </circle>`;
}

function animSpiral(c, r) {
  const cx = 80+r()*100, cy = 30+r()*50;
  const n = 3+Math.floor(r()*3);
  const spd = (1.5+r()*2).toFixed(2);
  return Array.from({length:n}, (_,i) => {
    const rad = 18+i*14+r()*8;
    const dur = (parseFloat(spd)*(1+i*0.3)).toFixed(2);
    const dir = i%2===0 ? 1 : -1;
    return `<circle r="${4+r()*4}" fill="${i%2===0?c.a1:c.a2}" opacity="${(0.5+r()*0.4).toFixed(2)}">
      <animateMotion dur="${dur}s" repeatCount="indefinite"
        path="M${cx+rad},${cy} A${rad},${rad} 0 ${dir>0?'0,1':'0,0'} ${cx-rad},${cy} A${rad},${rad} 0 ${dir>0?'0,1':'0,0'} ${cx+rad},${cy}"/>
    </circle>`;
  }).join('');
}

function animBeam(c, r) {
  const n = 2+Math.floor(r()*3);
  return Array.from({length:n}, (_,i) => {
    const y = 20+r()*90, angle = (r()-0.5)*15;
    const spd = (0.8+r()*1).toFixed(2), delay = (r()*1.5).toFixed(2);
    const sw = (1.5+r()*4).toFixed(1), op = (0.3+r()*0.4).toFixed(2);
    return `<line x1="${300+i*20}" y1="${y.toFixed(1)}" x2="${280+i*20}" y2="${(y+angle).toFixed(1)}"
      stroke="${i%2===0?c.a1:c.a2}" stroke-width="${sw}" stroke-linecap="round" opacity="0"
      transform="rotate(${angle} 140 65)">
      <animateTransform attributeName="transform" type="translate" values="0,0;-310,0" dur="${spd}s" begin="${delay}s" repeatCount="indefinite" additive="sum"/>
      <animate attributeName="opacity" values="0;${op};${op};0" dur="${spd}s" begin="${delay}s" repeatCount="indefinite"/>
    </line>`;
  }).join('');
}

function animBurst(c, r) {
  const cx = 80+r()*100, cy = 25+r()*50;
  const n = 6+Math.floor(r()*5);
  const spd = (0.8+r()*0.8).toFixed(2);
  const dist = 30+r()*35;
  return Array.from({length:n}, (_,i) => {
    const angle = (i/n)*Math.PI*2;
    const ex = (cx+Math.cos(angle)*dist).toFixed(1), ey = (cy+Math.sin(angle)*dist).toFixed(1);
    const sz = (3+r()*5).toFixed(1);
    return `<circle cx="${cx}" cy="${cy}" r="${sz}" fill="${i%2===0?c.a1:c.a2}" opacity="0">
      <animate attributeName="cx" values="${cx};${ex};${ex}" dur="${spd}s" begin="${(r()*0.3).toFixed(2)}s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${cy};${ey};${ey}" dur="${spd}s" begin="${(r()*0.3).toFixed(2)}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.8;0" dur="${spd}s" begin="${(r()*0.3).toFixed(2)}s" repeatCount="indefinite"/>
      <animate attributeName="r" values="${sz};${(parseFloat(sz)*0.4).toFixed(1)}" dur="${spd}s" begin="${(r()*0.3).toFixed(2)}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');
}

function animClimb(c, r) {
  const cx = 80+r()*100;
  const sz = 8+r()*10;
  const spd = (1.2+r()*1.2).toFixed(2);
  const trail = Array.from({length:5}, (_,i) => {
    const op = (0.2-i*0.03).toFixed(2);
    return `<circle cx="${cx.toFixed(1)}" cy="0" r="${(sz*(1-i*0.12)).toFixed(1)}" fill="${c.a1}" opacity="${op}">
      <animate attributeName="cy" values="125;${-sz}" dur="${spd}s" begin="${(i*0.06).toFixed(2)}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');
  return `${trail}<circle cx="${cx.toFixed(1)}" cy="125" r="${sz.toFixed(1)}" fill="${c.a1}" opacity="0.9">
    <animate attributeName="cy" values="125;${-sz}" dur="${spd}s" repeatCount="indefinite"/>
  </circle>
  <ellipse cx="${cx.toFixed(1)}" cy="122" rx="${(sz*1.5).toFixed(1)}" ry="${(sz*0.35).toFixed(1)}" fill="${c.a1}" opacity="0.25">
    <animate attributeName="opacity" values="0.25;0.08;0.25" dur="${spd}s" repeatCount="indefinite"/>
  </ellipse>`;
}

function animCatch(c, r) {
  const n = 3+Math.floor(r()*3);
  const pw = 35+r()*30;
  const spd = (1+r()*1).toFixed(2);
  const items = Array.from({length:n}, (_,i) => {
    const x = 30+r()*220, sz = 4+r()*8, dur = (1.5+r()*1.5).toFixed(2), delay = (r()*2).toFixed(2);
    return `<circle cx="${x.toFixed(1)}" cy="${-sz}" r="${sz.toFixed(1)}" fill="${i%2===0?c.a1:c.a2}" opacity="0.75">
      <animate attributeName="cy" values="${-sz};${125+sz}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');
  const px = 50+r()*130;
  return `${items}
  <rect x="${(px-pw/2).toFixed(1)}" y="118" width="${pw.toFixed(1)}" height="8" fill="${c.a1}" opacity="0.7" rx="4">
    <animate attributeName="x" values="${(px-pw/2).toFixed(1)};${(250-pw/2).toFixed(1)};${(30+pw/2).toFixed(1)};${(px-pw/2).toFixed(1)}" dur="${(spd*2.5).toFixed(2)}s" repeatCount="indefinite"/>
  </rect>`;
}

function animWave(c, r) {
  const amp = 10+r()*20, spd = (1.5+r()*1.5).toFixed(2);
  const cy1 = 70+r()*20, cy2 = cy1+12+r()*10;
  const fish = r()>0.4;
  return `<path fill="${c.a1}" opacity="0.35">
    <animate attributeName="d"
      values="M0,${cy1} Q70,${cy1-amp} 140,${cy1} Q210,${cy1+amp} 280,${cy1} L280,130 L0,130 Z;
              M0,${cy1} Q70,${cy1+amp} 140,${cy1} Q210,${cy1-amp} 280,${cy1} L280,130 L0,130 Z;
              M0,${cy1} Q70,${cy1-amp} 140,${cy1} Q210,${cy1+amp} 280,${cy1} L280,130 L0,130 Z"
      dur="${spd}s" repeatCount="indefinite"/>
  </path>
  <path fill="${c.a1}" opacity="0.5">
    <animate attributeName="d"
      values="M0,${cy2} Q70,${cy2+amp} 140,${cy2} Q210,${cy2-amp} 280,${cy2} L280,130 L0,130 Z;
              M0,${cy2} Q70,${cy2-amp} 140,${cy2} Q210,${cy2+amp} 280,${cy2} L280,130 L0,130 Z;
              M0,${cy2} Q70,${cy2+amp} 140,${cy2} Q210,${cy2-amp} 280,${cy2} L280,130 L0,130 Z"
      dur="${(parseFloat(spd)*0.8).toFixed(2)}s" repeatCount="indefinite"/>
  </path>
  ${fish ? `<g opacity="0.7">
    <animateTransform attributeName="transform" type="translate" values="285,${(cy1-15).toFixed(0)};-20,${cy1.toFixed(0)};285,${(cy1-15).toFixed(0)}" dur="${(parseFloat(spd)*3).toFixed(2)}s" repeatCount="indefinite"/>
    <ellipse cx="0" cy="0" rx="14" ry="7" fill="${c.a1}"/>
    <path d="M-14,0 L-23,-7 L-23,7 Z" fill="${c.a1}"/>
    <circle cx="8" cy="-2" r="2" fill="white" opacity="0.5"/>
  </g>` : ''}`;
}

function animMatch(c, r) {
  const cols = 4+Math.floor(r()*2), rows = 3;
  const sz = 14+r()*6, gap = 3+r()*3;
  const totalW = cols*(sz+gap)-gap, totalH = rows*(sz+gap)-gap;
  const ox = (280-totalW)/2, oy = (130-totalH)/2;
  const spd = (0.4+r()*0.4).toFixed(2);
  const n = cols*rows;
  let cells = '';
  for (let row=0; row<rows; row++) for (let col=0; col<cols; col++) {
    const i = row*cols+col;
    const x = ox+col*(sz+gap), y = oy+row*(sz+gap);
    const delay = (i * parseFloat(spd) * 0.5 / n).toFixed(2);
    const col2 = i%3===0?c.a1:i%3===1?c.a2:c.badge;
    cells += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${sz.toFixed(1)}" height="${sz.toFixed(1)}" fill="${col2}" opacity="0.15" rx="3">
      <animate attributeName="opacity" values="0.15;0.75;0.15" dur="${(parseFloat(spd)*3).toFixed(2)}s" begin="${delay}s" repeatCount="indefinite"/>
    </rect>`;
  }
  return cells;
}

function animRunner(c, r) {
  const sz = 8+r()*10, cy = 50+r()*40;
  const spd = (0.8+r()*0.8).toFixed(2);
  const trailN = 5;
  const trail = Array.from({length:trailN}, (_,i) => {
    const op = (0.3-i*0.05).toFixed(2), w = sz*(1-i*0.15);
    return `<ellipse cx="0" cy="${cy.toFixed(1)}" rx="${(w*0.9).toFixed(1)}" ry="${(w*0.5).toFixed(1)}" fill="${c.a1}" opacity="${op}">
      <animateTransform attributeName="transform" type="translate" values="-20,0;295,0;-20,0" dur="${spd}s" begin="${(i*0.05).toFixed(2)}s" repeatCount="indefinite"/>
    </ellipse>`;
  }).join('');
  return `${trail}<circle cx="-20" cy="${cy.toFixed(1)}" r="${sz.toFixed(1)}" fill="${c.a1}" opacity="0.9">
    <animateTransform attributeName="transform" type="translate" values="-20,0;295,0;-20,0" dur="${spd}s" repeatCount="indefinite"/>
  </circle>`;
}

function animSwing(c, r) {
  const px = 60+r()*160;
  const len = 40+r()*40, sw = 8+r()*12;
  const spd = (1+r()*1.2).toFixed(2);
  const amp = 25+r()*25;
  return `<circle cx="${px.toFixed(1)}" cy="10" r="5" fill="${c.a1}" opacity="0.6"/>
  <g>
    <animateTransform attributeName="transform" type="rotate"
      values="${-amp} ${px.toFixed(1)} 10;${amp} ${px.toFixed(1)} 10;${-amp} ${px.toFixed(1)} 10"
      dur="${spd}s" repeatCount="indefinite" calcMode="spline" keySplines="0.5,0,0.5,1;0.5,0,0.5,1"/>
    <line x1="${px.toFixed(1)}" y1="10" x2="${px.toFixed(1)}" y2="${(10+len).toFixed(1)}"
      stroke="${c.a2}" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
    <circle cx="${px.toFixed(1)}" cy="${(10+len).toFixed(1)}" r="${(sw/2).toFixed(1)}" fill="${c.a1}" opacity="0.85"/>
  </g>`;
}

function animParticles(c, r) {
  const n = 8+Math.floor(r()*8);
  return Array.from({length:n}, (_,i) => {
    const x = 20+r()*240, y = 20+r()*90;
    const sz = 1.5+r()*5, dur = (1.5+r()*2.5).toFixed(2), delay = (r()*3).toFixed(2);
    const dx = (r()-0.5)*40, dy = (r()-0.5)*40;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${sz.toFixed(1)}" fill="${r()>0.5?c.a1:c.a2}" opacity="0">
      <animate attributeName="opacity" values="0;0.65;0.65;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="translate" values="0,0;${dx.toFixed(1)},${dy.toFixed(1)}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');
}

function animGears(c, r) {
  const cx1 = 90+r()*80, cy1 = 30+r()*40;
  const rad1 = 22+r()*15, spd1 = (3+r()*4).toFixed(2);
  const rad2 = 14+r()*10, cx2 = cx1+rad1+rad2+3, cy2 = cy1;
  const spd2 = (parseFloat(spd1)*rad1/rad2).toFixed(2);
  const teeth1 = Array.from({length:8}, (_,i) => {
    const a = (i/8)*Math.PI*2, tx=(cx1+Math.cos(a)*rad1).toFixed(1), ty=(cy1+Math.sin(a)*rad1).toFixed(1);
    return `<rect x="${(parseFloat(tx)-3).toFixed(1)}" y="${(parseFloat(ty)-4).toFixed(1)}" width="6" height="8" fill="${c.a1}" opacity="0.5" rx="1" transform="rotate(${((i/8)*360).toFixed(0)} ${tx} ${ty})"/>`;
  }).join('');
  const teeth2 = Array.from({length:6}, (_,i) => {
    const a = (i/6)*Math.PI*2, tx=(cx2+Math.cos(a)*rad2).toFixed(1), ty=(cy2+Math.sin(a)*rad2).toFixed(1);
    return `<rect x="${(parseFloat(tx)-2.5).toFixed(1)}" y="${(parseFloat(ty)-3.5).toFixed(1)}" width="5" height="7" fill="${c.a2}" opacity="0.45" rx="1" transform="rotate(${((i/6)*360).toFixed(0)} ${tx} ${ty})"/>`;
  }).join('');
  return `<g><animateTransform attributeName="transform" type="rotate" values="0 ${cx1} ${cy1};360 ${cx1} ${cy1}" dur="${spd1}s" repeatCount="indefinite"/>
    <circle cx="${cx1}" cy="${cy1}" r="${rad1}" fill="none" stroke="${c.a1}" stroke-width="2.5" opacity="0.45"/>
    <circle cx="${cx1}" cy="${cy1}" r="${(rad1*0.45).toFixed(1)}" fill="${c.a1}" opacity="0.25"/>
    <circle cx="${cx1}" cy="${cy1}" r="${(rad1*0.2).toFixed(1)}" fill="${c.a1}" opacity="0.6"/>
    ${teeth1}</g>
  <g><animateTransform attributeName="transform" type="rotate" values="0 ${cx2} ${cy2};-360 ${cx2} ${cy2}" dur="${spd2}s" repeatCount="indefinite"/>
    <circle cx="${cx2}" cy="${cy2}" r="${rad2}" fill="none" stroke="${c.a2}" stroke-width="2" opacity="0.4"/>
    <circle cx="${cx2}" cy="${cy2}" r="${(rad2*0.35).toFixed(1)}" fill="${c.a2}" opacity="0.5"/>
    ${teeth2}</g>`;
}

function animCrystal(c, r) {
  const cx = 80+r()*100, cy = 25+r()*50;
  const n = 5+Math.floor(r()*3);
  const spd = (5+r()*5).toFixed(2);
  const arms = Array.from({length:n}, (_,i) => {
    const angle = (i/n)*Math.PI*2;
    const len = 20+r()*25;
    const ex = (cx+Math.cos(angle)*len).toFixed(1), ey = (cy+Math.sin(angle)*len).toFixed(1);
    const mx = (cx+Math.cos(angle)*len*0.6).toFixed(1), my = (cy+Math.sin(angle)*len*0.6).toFixed(1);
    return `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="${c.a1}" stroke-width="2.5" opacity="0.7"/>
    <circle cx="${mx}" cy="${my}" r="3" fill="${c.a1}" opacity="0.5"/>
    <circle cx="${ex}" cy="${ey}" r="2" fill="${c.a2}" opacity="0.65"/>`;
  }).join('');
  return `<g><animateTransform attributeName="transform" type="rotate" values="0 ${cx} ${cy};360 ${cx} ${cy}" dur="${spd}s" repeatCount="indefinite"/>
    ${arms}
    <circle cx="${cx}" cy="${cy}" r="7" fill="${c.a1}" opacity="0.85"/>
    <circle cx="${cx}" cy="${cy}" r="3" fill="white" opacity="0.5"/>
  </g>
  <circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="${c.a1}" stroke-width="1" opacity="0.15">
    <animate attributeName="r" values="30;38;30" dur="${(parseFloat(spd)*0.4).toFixed(2)}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.15;0.35;0.15" dur="${(parseFloat(spd)*0.4).toFixed(2)}s" repeatCount="indefinite"/>
  </circle>`;
}

function animMagnet(c, r) {
  const cx = 80+r()*100, cy = 30+r()*50;
  const n = 6+Math.floor(r()*4);
  const spd = (1.5+r()*1.5).toFixed(2);
  const particles = Array.from({length:n}, (_,i) => {
    const angle = (i/n)*Math.PI*2;
    const dist = 35+r()*30;
    const px = (cx+Math.cos(angle)*dist).toFixed(1), py = (cy+Math.sin(angle)*dist).toFixed(1);
    const sz = (3+r()*5).toFixed(1);
    return `<circle cx="${px}" cy="${py}" r="${sz}" fill="${i%2===0?c.a1:c.a2}" opacity="0.7">
      <animate attributeName="cx" values="${px};${cx};${px}" dur="${spd}s" begin="${(i*0.15).toFixed(2)}s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="${py};${cy};${py}" dur="${spd}s" begin="${(i*0.15).toFixed(2)}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;0.9;0.7" dur="${spd}s" begin="${(i*0.15).toFixed(2)}s" repeatCount="indefinite"/>
    </circle>`;
  }).join('');
  return `${particles}<circle cx="${cx}" cy="${cy}" r="${8+r()*8}" fill="${c.a1}" opacity="0.5">
    <animate attributeName="r" values="${8+r()*8};${10+r()*10};${8+r()*8}" dur="${(parseFloat(spd)*0.5).toFixed(2)}s" repeatCount="indefinite"/>
  </circle>`;
}

function animLava(c, r) {
  const cx = 80+r()*100;
  const spd = (1.5+r()*1.5).toFixed(2);
  const drops = Array.from({length:3+Math.floor(r()*2)}, (_,i) => {
    const x = cx + (r()-0.5)*60, sz = 6+r()*10, delay = (i*parseFloat(spd)*0.6).toFixed(2);
    return `<ellipse cx="${x.toFixed(1)}" cy="-15" rx="${(sz*0.7).toFixed(1)}" ry="${sz.toFixed(1)}" fill="${i%2===0?c.a1:c.a2}" opacity="0.8">
      <animate attributeName="cy" values="-15;-15;${130+sz}" dur="${spd}s" begin="${delay}s" repeatCount="indefinite"
        calcMode="spline" keySplines="0,0,1,0.2;0.4,0,0.6,1"/>
      <animate attributeName="rx" values="${(sz*0.7).toFixed(1)};${(sz*0.9).toFixed(1)};${(sz*0.5).toFixed(1)}" dur="${spd}s" begin="${delay}s" repeatCount="indefinite"/>
    </ellipse>`;
  }).join('');
  return `${drops}
  <ellipse cx="${cx.toFixed(1)}" cy="125" rx="50" ry="10" fill="${c.a1}" opacity="0.2">
    <animate attributeName="rx" values="50;60;50" dur="${spd}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.2;0.35;0.2" dur="${spd}s" repeatCount="indefinite"/>
  </ellipse>`;
}

function animPixelanim(c, r) {
  const gx = 50+r()*80, gy = 20+r()*40;
  const sz = 10+r()*6, gap = 2;
  const cols = 6+Math.floor(r()*4), rows = 4+Math.floor(r()*3);
  let cells = '';
  for (let row=0; row<rows; row++) for (let col=0; col<cols; col++) {
    const i = row*cols+col;
    const px = gx+col*(sz+gap), py = gy+row*(sz+gap);
    const delay = (r()*2).toFixed(2), dur = (0.3+r()*0.5).toFixed(2);
    const col2 = i%4===0?c.a1:i%4===1?c.a2:i%4===2?c.badge:'rgba(255,255,255,0.15)';
    cells += `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${sz.toFixed(1)}" height="${sz.toFixed(1)}" fill="${col2}" opacity="0.2" rx="1">
      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="${(parseFloat(dur)*4).toFixed(2)}s" begin="${delay}s" repeatCount="indefinite"/>
    </rect>`;
  }
  return cells;
}

function animDrift(c, r) {
  const n = 3+Math.floor(r()*4);
  const shapes = ['circle','rect','polygon'];
  return Array.from({length:n}, (_,i) => {
    const x = 30+r()*220, y = 15+r()*90;
    const sz = 6+r()*20, dur = (3+r()*4).toFixed(2), delay = (r()*4).toFixed(2);
    const dx = (r()-0.5)*50, dy = (r()-0.5)*40;
    const op = (0.2+r()*0.35).toFixed(2);
    const col = i%2===0?c.a1:c.a2;
    const shape = shapes[i%3];
    let el = '';
    if (shape==='circle') el = `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${sz.toFixed(1)}" fill="${col}" opacity="${op}">`;
    else if (shape==='rect') el = `<rect x="${(x-sz/2).toFixed(1)}" y="${(y-sz/2).toFixed(1)}" width="${sz.toFixed(1)}" height="${sz.toFixed(1)}" fill="${col}" opacity="${op}" rx="${(sz*0.3).toFixed(1)}">`;
    else {
      const pts = Array.from({length:5}, (_,j) => {
        const a = (j/5)*Math.PI*2, px2=x+Math.cos(a)*sz, py2=y+Math.sin(a)*sz;
        return `${px2.toFixed(1)},${py2.toFixed(1)}`;
      }).join(' ');
      el = `<polygon points="${pts}" fill="${col}" opacity="${op}">`;
    }
    return `${el}
      <animateTransform attributeName="transform" type="translate" values="0,0;${dx.toFixed(1)},${dy.toFixed(1)};0,0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="${op};${(parseFloat(op)*0.4).toFixed(2)};${op}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
    </${shape==='circle'?'circle':shape==='rect'?'rect':'polygon'}>`;
  }).join('');
}

// ── Type dispatch ──
const ANIMS = {
  stack:animStack, dash:animDash, zigzag:animZigzag, bubbles:animBubbles,
  orbit:animOrbit, pulse:animPulse, gravity:animGravity, circuit:animCircuit,
  bounce:animBounce, spiral:animSpiral, beam:animBeam, burst:animBurst,
  climb:animClimb, catch:animCatch, wave:animWave, match:animMatch,
  runner:animRunner, swing:animSwing, particles:animParticles, gears:animGears,
  crystal:animCrystal, magnet:animMagnet, lava:animLava, pixelanim:animPixelanim,
  drift:animDrift,
};

// ── Build SVG ──
function buildSVG(slug, name, desc, cat, theme) {
  const c = COLORS[theme] || COLORS.default;
  const r = mkRand(slug);
  const type = getType(slug, desc);
  const fn = ANIMS[type] || animDrift;
  const catLabel = CATS[cat] || cat.toUpperCase();
  const id = slug.replace(/[^a-z0-9]/gi, '');
  const { l1, l2, fs } = textLayout(name);
  const badgeW = catLabel.length * 6.8 + 18;

  // Text at center-bottom so object-fit:cover never clips it
  const textY = l2 ? 100 : 106;
  const line2Y = textY + fs * 1.3;
  const badgeY = 116;

  const anim = fn(c, r);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 130" width="280" height="130">
<defs>
  <linearGradient id="b${id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${c.bg1}"/>
    <stop offset="100%" stop-color="${c.bg2}"/>
  </linearGradient>
  <radialGradient id="g${id}" cx="50%" cy="45%" r="55%">
    <stop offset="0%" stop-color="${c.a1}" stop-opacity="0.18"/>
    <stop offset="100%" stop-color="${c.a1}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="t${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="40%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0.88)"/>
  </linearGradient>
  <linearGradient id="l${id}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${c.a1}"/>
    <stop offset="65%" stop-color="${c.a2}" stop-opacity="0.5"/>
    <stop offset="100%" stop-color="${c.a1}" stop-opacity="0"/>
  </linearGradient>
  <clipPath id="clip${id}"><rect width="280" height="130"/></clipPath>
</defs>

<rect width="280" height="130" fill="url(#b${id})"/>
<rect width="280" height="130" fill="url(#g${id})"/>

<g clip-path="url(#clip${id})">${anim}</g>

<rect width="280" height="130" fill="url(#t${id})"/>

<text x="140" y="${textY}"
  font-family="Inter,system-ui,sans-serif" font-size="${fs}" font-weight="800"
  fill="white" text-anchor="middle"
  paint-order="stroke" stroke="rgba(0,0,0,0.7)" stroke-width="4" stroke-linejoin="round"
>${xe(l1)}</text>
${l2 ? `<text x="140" y="${line2Y}"
  font-family="Inter,system-ui,sans-serif" font-size="${fs}" font-weight="800"
  fill="white" text-anchor="middle"
  paint-order="stroke" stroke="rgba(0,0,0,0.7)" stroke-width="4" stroke-linejoin="round"
>${xe(l2)}</text>` : ''}

<rect x="${(140-badgeW/2).toFixed(1)}" y="${badgeY}" width="${badgeW.toFixed(1)}" height="13" fill="${c.badge}" opacity="0.92" rx="3"/>
<text x="140" y="${badgeY+9.5}"
  font-family="Inter,system-ui,sans-serif" font-size="7.5" font-weight="700"
  letter-spacing="1.2" fill="white" text-anchor="middle"
>${catLabel}</text>

<rect y="127.5" width="280" height="2.5" fill="url(#l${id})"/>
</svg>`;
}

// ── Write all 217 ──
let done = 0;
const types = {};
for (const [slug, name, desc, cat, theme] of GAMES) {
  const type = getType(slug, desc);
  types[type] = (types[type]||0)+1;
  fs.writeFileSync(path.join(OUT, `${slug}.svg`), buildSVG(slug,name,desc,cat,theme), 'utf8');
  done++;
  process.stdout.write(`\r${done}/217 — ${slug}                         `);
}
console.log(`\n\nDone! 217 animated SVGs written.`);
console.log('Type distribution:');
Object.entries(types).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(`  ${k}: ${v}`));
