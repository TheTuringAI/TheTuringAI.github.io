// ---------- Personnages et scènes ----------
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

class Character {
  constructor(name, look, tx, ty, dir = 'down') {
    this.name = name; this.look = look;
    this.tx = tx; this.ty = ty; this.px = tx * TILE; this.py = ty * TILE;
    this.dir = dir; this.moving = false; this.target = null; this.speed = 56;
    this.animT = 0; this.frame = 0; this.sitting = false; this.visible = true;
    this.bubble = null; this.ai = null; this.path = null; this.onArrive = null; this.scene = null;
    this.lines = null; this.carry = null;
  }
  get tileX() { return this.tx; }
  face(dir) { this.dir = dir; }
  faceTowards(o) {
    const dx = o.tx - this.tx, dy = o.ty - this.ty;
    if (Math.abs(dx) > Math.abs(dy)) this.dir = dx > 0 ? 'right' : 'left'; else this.dir = dy > 0 ? 'down' : 'up';
  }
  setTile(tx, ty) { this.tx = tx; this.ty = ty; this.px = tx * TILE; this.py = ty * TILE; this.moving = false; this.target = null; this.path = null; }
  tryMove(dir, ignoreChars = false) {
    this.dir = dir;
    if (this.moving) return false;
    const [dx, dy] = DIRS[dir];
    const nx = this.tx + dx, ny = this.ty + dy;
    if (this.scene.blocked(nx, ny, this, ignoreChars)) {
      // le joueur peut échanger sa place avec un personnage qui le suit
      const other = this.scene.chars.find((c) => c !== this && c.visible && c.ai && c.ai.follows === this && !c.moving && c.tx === nx && c.ty === ny);
      if (!other || this.scene.blocked(nx, ny, other, true)) return false;
      other.moving = true; other.target = { tx: this.tx, ty: this.ty }; other.dir = DIRS_INV[dir];
    }
    this.moving = true; this.target = { tx: nx, ty: ny };
    return true;
  }
  walkTo(tx, ty, game, opts = {}) {
    // BFS sur la grille, ignore les autres personnages
    return new Promise((resolve) => {
      const path = this.scene.findPath(this.tx, this.ty, tx, ty, opts.adjacent);
      if (!path || path.length === 0) { resolve(false); return; }
      this.path = path; this.onArrive = () => resolve(true);
    });
  }
  update(dt, game) {
    if (this.moving && this.target) {
      const step = this.speed * dt / 1000;
      const gx = this.target.tx * TILE, gy = this.target.ty * TILE;
      const dx = gx - this.px, dy = gy - this.py;
      const dist = Math.hypot(dx, dy);
      if (dist <= step) { this.px = gx; this.py = gy; this.tx = this.target.tx; this.ty = this.target.ty; this.moving = false; this.target = null; }
      else { this.px += dx / dist * step; this.py += dy / dist * step; }
      this.animT += dt;
      this.frame = 1 + (Math.floor(this.animT / 140) % 2);
    } else { this.frame = 0; this.animT = 0; }
    if (!this.moving && this.path) {
      if (this.path.length === 0) { this.path = null; const cb = this.onArrive; this.onArrive = null; if (cb) cb(); }
      else {
        const nxt = this.path[0];
        const dx = nxt[0] - this.tx, dy = nxt[1] - this.ty;
        const dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
        if (this.tryMove(dir, true)) this.path.shift();
        else { this.path.shift(); }
      }
    }
    if (this.ai && !this.moving && !this.path) this.ai(dt, game, this);
  }
  draw(g, game) {
    const sp = getCharSprite(this.look, this.dir, this.frame, this.sitting);
    g.drawImage(sp, Math.round(this.px), Math.round(this.py) - 8);
    if (this.sitting && this.scene) {
      const t = this.scene.tileAt(this.tx, this.ty);
      if (t && t.cover) { const tc = getTile(t.tile, this.tx, this.ty, game.time, t.base || this.scene.base); g.drawImage(tc, 0, t.cover[0], 16, t.cover[1] - t.cover[0], Math.round(this.px), Math.round(this.py) + t.cover[0], 16, t.cover[1] - t.cover[0]); }
    }
    if (this.carry) g.drawImage(getProp(this.carry, 9, 8, 0), Math.round(this.px) + (this.dir === 'left' ? -3 : 10), Math.round(this.py) + 4);
  }
}

// IA : flâner dans une zone
function wanderAI(area, chatter) {
  let timer = 500 + Math.random() * 2000, chatT = 4000 + Math.random() * 8000;
  return (dt, game, ch) => {
    timer -= dt; chatT -= dt;
    if (chatter && chatT <= 0 && !ch.bubble) { chatT = 8000 + Math.random() * 12000; ch.bubble = { type: 'speech', text: chatter[Math.floor(Math.random() * chatter.length)], shown: 0, speed: 40, done: true }; game.wait(2600).then(() => { if (ch.bubble && ch.bubble.done && !ch.talking) ch.bubble = null; }); }
    if (timer > 0) return;
    timer = 600 + Math.random() * 2500;
    const dirs = Object.keys(DIRS);
    const d = dirs[Math.floor(Math.random() * 4)];
    const [dx, dy] = DIRS[d];
    const nx = ch.tx + dx, ny = ch.ty + dy;
    if (nx < area.x || ny < area.y || nx >= area.x + area.w || ny >= area.y + area.h) { ch.dir = d; return; }
    if (ch.bubble && !ch.bubble.done) return;
    ch.tryMove(d);
  };
}

// IA : suivre le joueur
function followAI(target) {
  const fn = (dt, game, ch) => {
    const d = Math.abs(ch.tx - target.tx) + Math.abs(ch.ty - target.ty);
    if (d <= 1) { if (!target.moving && d === 1) ch.faceTowards(target); return; }
    const path = ch.scene.findPath(ch.tx, ch.ty, target.tx, target.ty, true);
    if (path && path.length) {
      const nxt = path[0];
      const dx = nxt[0] - ch.tx, dy = nxt[1] - ch.ty;
      const dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
      ch.tryMove(dir);
    }
  };
  fn.follows = target;
  return fn;
}

const DIRS_INV = { up: 'down', down: 'up', left: 'right', right: 'left' };

class Scene {
  constructor(def) {
    this.rows = def.map; this.legend = def.legend;
    this.h = this.rows.length; this.w = this.rows[0].length;
    this.rows.forEach((r, i) => { if (r.length !== this.w) console.error(`Carte ${def.name} : ligne ${i} a ${r.length} colonnes au lieu de ${this.w}`); });
    this.chars = []; this.props = def.props || []; this.interactables = def.interactables || [];
    this.player = null; this.name = def.name; this.base = def.base || null; this.bg = def.bg || null;
    this.update = def.update || null; this.drawOver = def.drawOver || null; this.drawUI = def.drawUI || null;
    this.extraSolid = new Set();
    this.onTalk = def.onTalk || null;
  }
  tileAt(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null; return this.legend[this.rows[y][x]] || null; }
  blocked(x, y, who, ignoreChars) {
    const t = this.tileAt(x, y);
    if (!t || t.solid) return true;
    if (this.extraSolid.has(x + ',' + y)) return true;
    for (const pr of this.props) if (pr.solid && x >= pr.x && x < pr.x + pr.tw && y >= pr.y && y < pr.y + pr.th) return true;
    if (!ignoreChars) for (const ch of this.chars) if (ch !== who && ch.visible && ((ch.tx === x && ch.ty === y) || (ch.target && ch.target.tx === x && ch.target.ty === y))) return true;
    return false;
  }
  charAt(x, y) { return this.chars.find((ch) => ch.visible && ch.tx === x && ch.ty === y) || null; }
  findPath(sx, sy, tx, ty, adjacent) {
    const key = (x, y) => y * this.w + x;
    const prev = new Map(); prev.set(key(sx, sy), null);
    const q = [[sx, sy]];
    const goal = (x, y) => adjacent ? (Math.abs(x - tx) + Math.abs(y - ty) === 1) : (x === tx && y === ty);
    let found = null;
    while (q.length) {
      const [x, y] = q.shift();
      if (goal(x, y)) { found = [x, y]; break; }
      for (const d of Object.values(DIRS)) {
        const nx = x + d[0], ny = y + d[1];
        if (prev.has(key(nx, ny))) continue;
        if (this.blocked(nx, ny, null, true) && !(nx === tx && ny === ty && !adjacent)) continue;
        prev.set(key(nx, ny), [x, y]); q.push([nx, ny]);
      }
    }
    if (!found) return null;
    const path = []; let cur = found;
    while (cur && !(cur[0] === sx && cur[1] === sy)) { path.unshift(cur); cur = prev.get(key(cur[0], cur[1])); }
    return path;
  }
  add(ch) { ch.scene = this; this.chars.push(ch); return ch; }
  drawMap(g, game) {
    const x0 = Math.max(0, Math.floor(game.cam.x / TILE)), y0 = Math.max(0, Math.floor(game.cam.y / TILE));
    const x1 = Math.min(this.w, x0 + Math.ceil(VW / TILE) + 1), y1 = Math.min(this.h, y0 + Math.ceil(VH / TILE) + 1);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const t = this.legend[this.rows[y][x]];
      if (!t) continue;
      g.drawImage(getTile(t.tile, x, y, game.time, t.base || this.base), x * TILE, y * TILE);
    }
  }
  drawProp(g, pr, game) {
    const c = getProp(pr.kind, pr.w, pr.h, game.time, pr.extra);
    g.drawImage(c, pr.x * TILE + (pr.ox || 0), (pr.y + pr.th) * TILE - pr.h + (pr.oy || 0));
  }
}
