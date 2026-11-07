// ---------- Moteur : entrées, caméra, bulles, coroutines, transitions, audio ----------
const VW = 384, VH = 240;

const Input = {
  down: {}, pressedAction: false, pressedUp: false, pressedDown: false, anyKey: false,
  init() {
    const map = (k) => {
      switch (k) {
        case 'ArrowUp': case 'w': case 'W': case 'z': case 'Z': return 'up';
        case 'ArrowDown': case 's': case 'S': return 'down';
        case 'ArrowLeft': case 'a': case 'A': case 'q': case 'Q': return 'left';
        case 'ArrowRight': case 'd': case 'D': return 'right';
        case ' ': case 'Enter': case 'e': case 'E': return 'action';
        case 'm': case 'M': return 'mute';
      }
      return null;
    };
    window.addEventListener('keydown', (e) => {
      const k = map(e.key);
      Input.anyKey = true;
      if (!k) return;
      e.preventDefault();
      if (!Input.down[k]) {
        if (k === 'action') Input.pressedAction = true;
        if (k === 'up') Input.pressedUp = true;
        if (k === 'down') Input.pressedDown = true;
        if (k === 'mute') Sound.toggle();
      }
      Input.down[k] = true;
    });
    window.addEventListener('keyup', (e) => { const k = map(e.key); if (k) Input.down[k] = false; });
    window.addEventListener('blur', () => { Input.down = {}; });
  },
  dir() {
    if (Input.down.up) return 'up';
    if (Input.down.down) return 'down';
    if (Input.down.left) return 'left';
    if (Input.down.right) return 'right';
    return null;
  },
  endFrame() { Input.pressedAction = false; Input.pressedUp = false; Input.pressedDown = false; Input.anyKey = false; },
};

// ---------- Sound : petites mélodies chiptune ----------
const Sound = {
  ctx: null, muted: false, timer: null, song: null, step: 0, gain: null,
  ensure() {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    this.gain = this.ctx.createGain(); this.gain.gain.value = 0.18; this.gain.connect(this.ctx.destination);
  },
  toggle() { this.muted = !this.muted; if (this.gain) this.gain.gain.value = this.muted ? 0 : 0.18; },
  note(freq, dur, type = 'triangle', vol = 1, when = 0) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    const t = this.ctx.currentTime + when;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.gain); o.start(t); o.stop(t + dur + 0.05);
  },
  sfx(name) {
    this.ensure(); if (!this.ctx) return;
    if (name === 'blip') this.note(880, 0.06, 'square', 0.3);
    if (name === 'heart') { this.note(660, 0.15, 'triangle', 0.6); this.note(990, 0.25, 'triangle', 0.6, 0.12); }
    if (name === 'select') { this.note(520, 0.08, 'square', 0.3); this.note(780, 0.1, 'square', 0.3, 0.07); }
    if (name === 'splash') { this.note(300, 0.2, 'sine', 0.5); this.note(420, 0.2, 'sine', 0.4, 0.1); }
    if (name === 'door') { this.note(220, 0.15, 'triangle', 0.5); this.note(330, 0.2, 'triangle', 0.5, 0.15); }
  },
  // chansons : tableau de [freq|0, durée en pas]
  play(song) {
    this.ensure();
    if (this.timer) clearInterval(this.timer);
    this.song = song; this.step = 0;
    if (!this.ctx) return;
    const tick = () => {
      if (!this.song) return;
      const s = this.song;
      const [mel, bass] = [s.mel[this.step % s.mel.length], s.bass[this.step % s.bass.length]];
      if (mel) this.note(mel, s.tempo / 1000 * 0.9, s.type || 'triangle', 0.5);
      if (bass) this.note(bass, s.tempo / 1000 * 1.6, 'sine', 0.35);
      this.step++;
    };
    this.timer = setInterval(tick, song.tempo);
  },
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; this.song = null; },
};
const N = { C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784, A5: 880, C3: 130.8, D3: 146.8, E3: 164.8, F3: 174.6, G3: 196, A3: 220, B3: 246.9 };
const Songs = {
  church: { tempo: 520, type: 'triangle', mel: [N.C4, N.E4, N.G4, N.E4, N.F4, N.A4, N.G4, 0, N.E4, N.G4, N.C5, N.G4, N.A4, N.F4, N.E4, 0], bass: [N.C3, 0, 0, 0, N.F3, 0, 0, 0, N.C3, 0, 0, 0, N.G3, 0, 0, 0] },
  restaurant: { tempo: 300, type: 'triangle', mel: [N.E4, N.G4, N.B4, N.D5, N.C5, N.B4, N.G4, 0, N.D4, N.F4, N.A4, N.C5, N.B4, N.A4, N.F4, 0], bass: [N.C3, 0, N.G3, 0, N.A3, 0, N.E3, 0, N.F3, 0, N.C3, 0, N.G3, 0, N.G3, 0] },
  town: { tempo: 260, type: 'square', mel: [N.G4, 0, N.A4, N.B4, N.D5, 0, N.B4, 0, N.A4, 0, N.G4, N.E4, N.G4, 0, 0, 0, N.E4, 0, N.G4, N.A4, N.C5, 0, N.A4, 0, N.G4, 0, N.E4, N.D4, N.E4, 0, 0, 0], bass: [N.G3, 0, 0, 0, N.D3, 0, 0, 0, N.C3, 0, 0, 0, N.G3, 0, 0, 0] },
  chalet: { tempo: 340, type: 'triangle', mel: [N.C5, 0, N.B4, N.A4, N.G4, 0, N.E4, 0, N.F4, N.G4, N.A4, 0, N.G4, 0, 0, 0, N.E4, 0, N.G4, N.C5, N.D5, 0, N.C5, 0, N.B4, 0, N.G4, N.A4, N.G4, 0, 0, 0], bass: [N.C3, 0, 0, 0, N.A3, 0, 0, 0, N.F3, 0, 0, 0, N.G3, 0, 0, 0] },
};

// ---------- Texte ----------
const FONT = '8px "Pixelify Sans", monospace';
function wrapText(g, text, maxW) {
  g.font = FONT;
  const words = text.split(' ');
  const lines = []; let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (g.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// ---------- Jeu ----------
class Game {
  constructor(canvas) {
    this.canvas = canvas; this.g = canvas.getContext('2d');
    this.scale = 1; this.resize(); window.addEventListener('resize', () => this.resize());
    this.timers = []; this.conds = [];
    this.scene = null; this.time = 0;
    this.fade = 1; this.fadeTarget = 1; this.fadeSpeed = 0; this.fadeText = null;
    this.cam = { x: 0, y: 0 };
    this.particles = []; this.weather = null;
    this.hint = null; this.hintT = 0;
    this.control = false;
    this.title = true;
  }
  resize() {
    const s = Math.max(1, Math.floor(Math.min(window.innerWidth / VW, (window.innerHeight - 30) / VH)));
    this.scale = s; this.canvas.width = VW * s; this.canvas.height = VH * s;
    this.g.imageSmoothingEnabled = false;
  }
  // --- coroutines ---
  wait(ms) { return new Promise((r) => this.timers.push({ t: ms, r })); }
  waitFor(fn) { return new Promise((r) => this.conds.push({ fn, r })); }
  waitAction() { return this.waitFor(() => Input.pressedAction); }
  showHint(text, ms = 5000) { this.hint = text; this.hintT = ms; }
  // --- bulles ---
  async bubble(ch, text, type, opts = {}) {
    ch.bubble = { type, text, shown: 0, speed: opts.speed || 45, options: opts.options || null, sel: 0, done: false, color: opts.color };
    const b = ch.bubble;
    if (type === 'speech' && !opts.silent) Sound.sfx('blip');
    await this.waitFor(() => { if (Input.pressedAction && !opts.auto) b.shown = text.length; return b.shown >= text.length; });
    b.done = true;
    if (opts.options) {
      await this.waitFor(() => {
        if (Input.pressedUp) { b.sel = (b.sel + opts.options.length - 1) % opts.options.length; Sound.sfx('blip'); }
        if (Input.pressedDown) { b.sel = (b.sel + 1) % opts.options.length; Sound.sfx('blip'); }
        return Input.pressedAction;
      });
      Sound.sfx('select');
      if (!opts.keep) ch.bubble = null;
      return b.sel;
    }
    if (opts.auto) await this.wait(typeof opts.auto === 'number' ? opts.auto : 1200 + text.length * 35);
    else { await this.wait(50); await this.waitAction(); }
    if (!opts.keep) ch.bubble = null;
    return 0;
  }
  say(ch, text, opts) { return this.bubble(ch, text, 'speech', opts); }
  think(ch, text, opts) { return this.bubble(ch, text, 'thought', opts); }
  choose(ch, text, options) { return this.bubble(ch, text, 'speech', { options }); }
  // --- transitions ---
  fadeTo(v, ms) { this.fadeTarget = v; this.fadeSpeed = (v - this.fade) / ms; return this.waitFor(() => this.fade === this.fadeTarget); }
  async transition(text, setup) {
    this.control = false;
    await this.fadeTo(1, 700);
    this.fadeText = text; await this.wait(text ? 2400 : 300);
    if (setup) setup();
    this.fadeText = null;
    await this.wait(300);
    await this.fadeTo(0, 700);
  }
  hearts(ch, n = 6) {
    Sound.sfx('heart');
    for (let i = 0; i < n; i++) this.particles.push({ kind: 'heart', x: ch.px + 4 + (Math.random() * 10 - 5), y: ch.py - 10 - Math.random() * 6, vx: (Math.random() - 0.5) * 12, vy: -18 - Math.random() * 14, life: 1600 + Math.random() * 600, t: 0 });
  }
  // --- boucle ---
  update(dt) {
    this.time += dt;
    for (const tm of [...this.timers]) { tm.t -= dt; if (tm.t <= 0) { this.timers.splice(this.timers.indexOf(tm), 1); tm.r(); } }
    for (const c of [...this.conds]) { if (c.fn()) { this.conds.splice(this.conds.indexOf(c), 1); c.r(); } }
    if (this.fade !== this.fadeTarget) {
      this.fade += this.fadeSpeed * dt;
      if ((this.fadeSpeed > 0 && this.fade >= this.fadeTarget) || (this.fadeSpeed < 0 && this.fade <= this.fadeTarget)) this.fade = this.fadeTarget;
    }
    if (this.hintT > 0) { this.hintT -= dt; if (this.hintT <= 0) this.hint = null; }
    const sc = this.scene;
    if (sc) {
      for (const ch of sc.chars) {
        ch.update(dt, this);
        if (ch.bubble && ch.bubble.shown < ch.bubble.text.length) ch.bubble.shown += dt / 1000 * ch.bubble.speed;
      }
      if (sc.update) sc.update(dt, this);
      // caméra
      const p = sc.player || sc.chars[0];
      const mw = sc.w * TILE, mh = sc.h * TILE;
      let cx = Math.round(p.px + 8 - VW / 2), cy = Math.round(p.py + 4 - VH / 2);
      if (mw <= VW) cx = Math.round((mw - VW) / 2); else cx = Math.max(0, Math.min(mw - VW, cx));
      if (mh <= VH) cy = Math.round((mh - VH) / 2); else cy = Math.max(0, Math.min(mh - VH, cy));
      this.cam.x = cx; this.cam.y = cy;
    }
    // particules
    for (const p of [...this.particles]) {
      p.t += dt;
      if (p.kind === 'heart') { p.x += p.vx * dt / 1000; p.y += p.vy * dt / 1000; p.vy *= 0.985; }
      if (p.kind === 'snow') { p.y += p.vy * dt / 1000; p.x += Math.sin(p.t / 600 + p.seed) * 0.15; if (p.y > this.cam.y + VH + 4) { p.y = this.cam.y - 6; p.x = this.cam.x + Math.random() * VW; } }
      if (p.kind === 'star') { }
      if (p.kind === 'splash') { p.x += p.vx * dt / 1000; p.y += p.vy * dt / 1000; p.vy += 60 * dt / 1000; }
      if (p.life && p.t > p.life) this.particles.splice(this.particles.indexOf(p), 1);
    }
    if (this.weather === 'snow' && this.particles.filter((p) => p.kind === 'snow').length < 70) {
      this.particles.push({ kind: 'snow', x: this.cam.x + Math.random() * VW, y: this.cam.y + Math.random() * VH, vy: 14 + Math.random() * 16, t: Math.random() * 1000, seed: Math.random() * 10, size: Math.random() < 0.3 ? 2 : 1 });
    }
  }
  draw() {
    const g = this.g, s = this.scale;
    g.setTransform(s, 0, 0, s, 0, 0);
    g.imageSmoothingEnabled = false;
    g.fillStyle = (this.scene && this.scene.bg) || '#120d18'; g.fillRect(0, 0, VW, VH);
    const sc = this.scene;
    if (sc) {
      g.save(); g.translate(-this.cam.x, -this.cam.y);
      sc.drawMap(g, this);
      // entités triées par y
      const ents = [];
      for (const ch of sc.chars) if (ch.visible) ents.push({ y: ch.py + 16 + (ch.sitting ? -6 : 0), draw: (gg) => ch.draw(gg, this) });
      for (const pr of sc.props) ents.push({ y: (pr.y + pr.th) * TILE + (pr.sortOff || 0), draw: (gg) => sc.drawProp(gg, pr, this) });
      ents.sort((a, b) => a.y - b.y);
      for (const e of ents) e.draw(g);
      if (sc.drawOver) sc.drawOver(g, this);
      // particules
      for (const p of this.particles) {
        if (p.kind === 'heart') { g.globalAlpha = Math.max(0, 1 - p.t / p.life); g.drawImage(getProp('heart', 7, 7, 0), Math.round(p.x), Math.round(p.y)); g.globalAlpha = 1; }
        if (p.kind === 'snow') { g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size); }
        if (p.kind === 'splash') { g.fillStyle = Pal.waterL; g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
      }
      // bulles
      for (const ch of sc.chars) if (ch.bubble && ch.visible) this.drawBubble(g, ch);
      g.restore();
      if (sc.drawUI) sc.drawUI(g, this);
    }
    // indice
    if (this.hint) {
      g.font = FONT; const lines = wrapText(g, this.hint, VW - 40);
      const h = lines.length * 10 + 8, w = Math.max(...lines.map((l) => g.measureText(l).width)) + 14;
      const x = Math.round((VW - w) / 2), y = VH - h - 6;
      g.fillStyle = 'rgba(30,20,40,0.85)'; g.fillRect(x, y, w, h); g.fillStyle = '#ffd56a'; g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1);
      g.fillStyle = '#fff7f0'; g.textBaseline = 'top'; g.textAlign = 'left';
      lines.forEach((l, i) => g.fillText(l, x + 7, y + 4 + i * 10));
    }
    // fondu
    if (this.fade > 0) {
      g.fillStyle = `rgba(14,9,20,${this.fade})`; g.fillRect(0, 0, VW, VH);
      if (this.fadeText && this.fade > 0.95) {
        g.font = '10px "Pixelify Sans", monospace'; g.fillStyle = '#fff7f0'; g.textAlign = 'center'; g.textBaseline = 'middle';
        const lines = this.fadeText.split('\n');
        lines.forEach((l, i) => g.fillText(l, VW / 2, VH / 2 + (i - (lines.length - 1) / 2) * 14));
        g.textAlign = 'left';
      }
    }
    if (this.title) this.drawTitle(g);
  }
  drawTitle(g) {
    g.fillStyle = 'rgba(20,12,30,0.75)'; g.fillRect(0, 0, VW, VH);
    g.fillStyle = '#ffd9e2'; g.font = '18px "Pixelify Sans", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('Un dimanche à la messe', VW / 2, 70);
    g.fillStyle = '#ffd56a'; g.font = '9px "Pixelify Sans", monospace';
    g.fillText('une petite histoire douce', VW / 2, 92);
    g.drawImage(getProp('heart', 7, 7, 0), VW / 2 - 4, 104);
    g.fillStyle = '#fff7f0'; g.font = FONT;
    g.fillText('Flèches / ZQSD : se déplacer', VW / 2, 150);
    g.fillText('Espace / E : parler, continuer', VW / 2, 162);
    g.fillText('M : couper la musique', VW / 2, 174);
    if (Math.floor(this.time / 500) % 2) { g.fillStyle = '#ff8fb1'; g.fillText('— Appuie sur Espace pour commencer —', VW / 2, 205); }
    g.textAlign = 'left';
  }
  drawBubble(g, ch) {
    const b = ch.bubble;
    g.font = FONT;
    const maxW = 150;
    const lines = wrapText(g, b.text, maxW);
    const shownText = b.text.slice(0, Math.floor(b.shown));
    const shownLines = wrapText(g, shownText, maxW);
    let w = Math.max(...lines.map((l) => g.measureText(l).width));
    const optLines = b.options && b.done ? b.options : [];
    for (const o of optLines) w = Math.max(w, g.measureText('> ' + o).width);
    w = Math.ceil(w) + 10;
    const lh = 10;
    const h = (lines.length + optLines.length) * lh + 6 + (optLines.length ? 3 : 0);
    const ax = ch.px + 8, ay = ch.py - 7 + (ch.sitting ? 3 : 0);
    let x = Math.round(ax - w / 2), y = Math.round(ay - 7 - h);
    const camX = window.game.cam.x, camY = window.game.cam.y;
    x = Math.max(camX + 2, Math.min(camX + VW - w - 2, x));
    let below = false;
    if (y < camY + 2) { y = ch.py + 20; below = true; }
    const bg = b.type === 'thought' ? '#fdf6ff' : (b.color || '#fff7f0');
    const edge = Pal.outline;
    // boîte arrondie
    g.fillStyle = edge; g.fillRect(x + 1, y, w - 2, h); g.fillRect(x, y + 1, w, h - 2);
    g.fillStyle = bg; g.fillRect(x + 1, y + 1, w - 2, h - 2); g.fillStyle = edge; g.fillRect(x + 1, y + 1, 1, 1); g.fillRect(x + w - 2, y + 1, 1, 1); g.fillRect(x + 1, y + h - 2, 1, 1); g.fillRect(x + w - 2, y + h - 2, 1, 1);
    if (b.type === 'thought') {
      // petites bulles de pensée
      g.fillStyle = edge; const dir = below ? -1 : 1;
      const bx = Math.round(ax) - 2;
      const b1y = below ? y - 4 : y + h + 1, b2y = below ? y - 8 : y + h + 5;
      g.fillRect(bx, b1y, 4, 3); g.fillRect(bx - 1, b1y + 1, 6, 1); g.fillStyle = bg; g.fillRect(bx + 1, b1y + 1, 2, 1);
      g.fillStyle = edge; g.fillRect(bx + 3 * dir, b2y, 2, 2); g.fillStyle = bg; g.fillRect(bx + 3 * dir, b2y, 1, 1);
      // bosses décoratives
      g.fillStyle = edge; for (let i = x + 4; i < x + w - 4; i += 6) { g.fillRect(i, y - 1, 3, 1); g.fillRect(i, y + h, 3, 1); }
      g.fillStyle = bg; for (let i = x + 4; i < x + w - 4; i += 6) { g.fillRect(i, y, 3, 1); g.fillRect(i, y + h - 1, 3, 1); }
    } else {
      const tx = Math.round(ax) - 2;
      if (!below) { g.fillStyle = edge; g.fillRect(tx - 1, y + h, 6, 1); g.fillRect(tx, y + h + 1, 4, 1); g.fillRect(tx + 1, y + h + 2, 2, 1); g.fillRect(tx + 2, y + h + 3, 1, 1); g.fillStyle = bg; g.fillRect(tx, y + h - 1, 4, 1); g.fillRect(tx + 1, y + h, 2, 1); }
      else { g.fillStyle = edge; g.fillRect(tx - 1, y - 1, 6, 1); g.fillRect(tx, y - 2, 4, 1); g.fillRect(tx + 1, y - 3, 2, 1); g.fillRect(tx + 2, y - 4, 1, 1); g.fillStyle = bg; g.fillRect(tx, y, 4, 1); g.fillRect(tx + 1, y - 1, 2, 1); }
    }
    g.fillStyle = b.type === 'thought' ? '#6a5a7a' : '#2d2233'; g.textBaseline = 'top'; g.textAlign = 'left';
    if (b.type === 'thought') g.font = 'italic ' + FONT;
    shownLines.forEach((l, i) => g.fillText(l, x + 5, y + 3 + i * lh));
    g.font = FONT;
    optLines.forEach((o, i) => {
      const sel = i === b.sel;
      g.fillStyle = sel ? '#c0455a' : '#8a7a9a';
      g.fillText((sel ? '> ' : '  ') + o, x + 5, y + 6 + (lines.length + i) * lh);
    });
    if (b.done && !b.options && Math.floor(window.game.time / 400) % 2) { g.fillStyle = '#c0455a'; g.fillRect(x + w - 6, y + h - 5, 3, 1); g.fillRect(x + w - 5, y + h - 4, 1, 1); }
  }
}
