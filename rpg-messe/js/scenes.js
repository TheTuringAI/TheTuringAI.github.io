// ---------- Les quatre scènes et le scénario ----------
TileDraw.windowNight = (g, x, y) => {
  TileDraw.wallWood(g, x, y);
  g.fillStyle = Pal.outline; g.fillRect(2, 1, 12, 13);
  g.fillStyle = '#2a2b4a'; g.fillRect(3, 2, 10, 11);
  g.fillStyle = '#fff'; g.fillRect(4 + Math.floor(hash(x, y, 1) * 6), 3 + Math.floor(hash(x, y, 2) * 4), 1, 1); g.fillRect(9, 8, 1, 1);
  g.fillStyle = '#ffe6a8'; g.fillRect(10, 3, 2, 2);
  g.fillStyle = Pal.outline; g.fillRect(7, 2, 1, 11); g.fillRect(3, 7, 10, 1);
  g.fillStyle = Pal.redL; g.fillRect(2, 0, 12, 1); g.fillRect(2, 14, 12, 1);
};

function buildMap(w, h, fill) {
  const rows = Array.from({ length: h }, () => Array(w).fill(fill));
  return {
    rows,
    set(x, y, c) { if (rows[y] && x >= 0 && x < w) rows[y][x] = c; return this; },
    rect(x, y, rw, rh, c) { for (let j = y; j < y + rh; j++) for (let i = x; i < x + rw; i++) this.set(i, j, c); return this; },
    out() { return rows.map((r) => r.join('')); },
  };
}
const S = (tile, solid, base, cover) => ({ tile, solid: !!solid, base, cover });

function tileAhead(ch) { const [dx, dy] = DIRS[ch.dir]; return [ch.tx + dx, ch.ty + dy]; }

// ============================================================
// 1. L'ÉGLISE
// ============================================================
function makeChurch(game) {
  const map = [
    '#GG##GG###GGGG###GG##GG#',
    '#...f....kAMMZk....f...#',
    '#..........lr..........#',
    '#..........lr..........#',
    '#..........lr..........#',
    '#..<===>...lr...<===>..#',
    '#..........lr..........#',
    '#..<===>...lr...<===>..#',
    '#..........lr..........#',
    '#..<===>...lr...<===>..#',
    '#..........lr..........#',
    '#..<===>...lr...<===>..#',
    '#..........lr..........#',
    '#..........lr.....CuKC.#',
    '#..........lr..........#',
    '#..........lr......hth.#',
    '###########DD###########',
  ];
  const legend = {
    '#': S('wallStone', 1), 'G': S('stainedGlass', 1), '.': S('floorChurch'), 'l': S('carpetL'), 'r': S('carpetR'),
    'f': S('flowerPot', 1), 'k': S('candles', 1, 'carpet'), 'A': S('altarL', 1), 'M': S('altarM', 1), 'Z': S('altarR', 1),
    '<': S('pewL', 1, null, [9, 14]), '=': S('pew', 1, null, [9, 14]), '>': S('pewR', 1, null, [9, 14]), 'C': S('counter', 1), 'u': S('cups', 1), 'K': S('coffeeMachine', 1),
    'h': S('chair', 1, null, [8, 13]), 't': S('tableRound', 1), 'D': S('door', 1, 'wallStone'),
  };
  const sc = new Scene({ name: 'eglise', map, legend, base: 'floorChurch' });
  const tom = sc.add(new Character('Tom', Looks.tom, 6, 9, 'up')); tom.sitting = true; tom.speed = 64;
  const elise = sc.add(new Character('Élise', Looks.elise, 18, 7, 'up')); elise.sitting = true;
  const priest = sc.add(new Character('Père Antoine', Looks.priest, 11, 3, 'down'));
  const npcs = [
    ['Mamie Rose', Looks.mamie, 4, 5, ['Quelle belle homélie...', 'Mes genoux, oh là là.', 'Ce petit Tom est bien sage.']],
    ['Papi Jean', Looks.papi, 5, 5, ['Zzz... hein ? Amen.', 'Le café est meilleur qu\'avant.', 'Il fera beau cet après-midi.']],
    ['Madame Léa', Looks.dame, 17, 5, ['Ils sont mignons, ces jeunes.', 'J\'ai oublié d\'éteindre le four !', 'Un petit café ?']],
    ['Un enfant', Looks.enfant, 18, 5, ['J\'ai faim !', 'Maman, on rentre quand ?', 'Je peux avoir un gâteau ?']],
    ['Monsieur Paul', Looks.monsieur, 4, 11, ['Bonjour, bonjour.', 'Belle matinée, non ?', 'Le chœur chantait bien.']],
    ['Inès', Looks.jeune, 19, 11, ['Tom ! Va donc lui parler.', 'Elle te regarde, tu sais.', 'Haha, tu rougis.']],
  ].map(([n, l, x, y, lines]) => { const c = sc.add(new Character(n, l, x, y, 'up')); c.sitting = true; c.lines = lines; return c; });
  sc.player = tom;
  let eliseSeated = false, massOver = false;
  sc.onTalk = async (ch) => {
    if (ch === priest) { await game.say(priest, massOver ? 'Allez, jeune homme. Elle est au coin café. Courage !' : 'Chut... La messe n\'est pas finie.'); return; }
    if (ch === elise) {
      if (!eliseSeated) { await game.say(elise, 'Oh ! Pardon, je... je vais me chercher un café.'); return; }
      await eliseDialogue();
      return;
    }
    if (ch.lines) {
      ch.talking = true; ch.faceTowards(tom);
      await game.say(ch, ch.lines[Math.floor(Math.random() * ch.lines.length)]);
      ch.talking = false;
    }
  };
  async function eliseDialogue() {
    elise.faceTowards(tom);
    await game.say(tom, 'Euh... Bonjour ! Je... je t\'ai vue à la messe. Enfin, je te vois tous les dimanches.');
    await game.say(elise, 'Oh ! Bonjour. Moi aussi, je t\'avais remarqué. Tu es toujours au troisième banc, à gauche.');
    await game.think(tom, 'Elle m\'avait remarqué ?!');
    tom.look = { ...Looks.tom, blush: true };
    await game.say(tom, 'Je m\'appelle Tom. Et toi ?');
    await game.say(elise, 'Élise. Tu veux un café ? Il est franchement mauvais, mais la compagnie est bonne.');
    await game.say(tom, 'Avec plaisir... Et, euh... ça te dirait qu\'on dîne ensemble, un de ces soirs ?');
    await game.say(elise, '...', { auto: 900 });
    await game.say(elise, 'Oui. J\'aimerais beaucoup.');
    game.hearts(elise); game.hearts(tom);
    await game.wait(1200);
    await game.transition('Le samedi suivant...', () => game.setScene(makeRestaurant(game)));
  }
  // --- scénario : la messe ---
  sc.script = async () => {
    game.control = false;
    Sound.play(Songs.church);
    await game.fadeTo(0, 900);
    const sermon = [
      'Mes chers paroissiens, soyez les bienvenus en cette douce matinée.',
      'Aujourd\'hui, j\'aimerais vous parler de la lumière que l\'on trouve chez les autres.',
      'Il suffit parfois d\'un regard, d\'un sourire, pour éclairer une journée entière.',
      'N\'ayez pas peur d\'aller vers ceux qui vous semblent lointains.',
      'Car c\'est dans la rencontre que naît la chaleur du cœur.',
      'Prenez soin les uns des autres. Ouvrez vos cœurs, tout simplement.',
      'Allez en paix. Et n\'oubliez pas : il y a du café au fond, près de la porte !',
    ];
    const thoughts = async () => {
      await game.wait(2500);
      await game.think(tom, 'Encore elle... la fille aux cheveux noirs. Elle est là tous les dimanches.', { auto: 3200 });
      await game.wait(3500);
      await game.think(tom, 'Je devrais aller lui parler aujourd\'hui. Peut-être. Si j\'ose...', { auto: 3200 });
      await game.wait(3500);
      await game.think(tom, 'Le père Antoine a raison. Un regard, un sourire...', { auto: 3000 });
      await game.wait(3200);
      await game.think(tom, 'Elle... elle vient de me sourire ? Mon cœur bat trop vite.', { auto: 3200 });
    };
    thoughts();
    for (const line of sermon) await game.say(priest, line, { auto: 2600, speed: 55 });
    massOver = true;
    // tout le monde se lève
    for (const c of [tom, elise, ...npcs]) { c.sitting = false; c.setTile(c.tx, c.ty + 1); c.dir = 'down'; }
    priest.ai = wanderAI({ x: 1, y: 2, w: 22, h: 3 });
    for (const c of npcs) c.ai = wanderAI({ x: 1, y: 2, w: 22, h: 14 }, c.lines);
    game.showHint('La messe est finie. Tu peux bouger : va parler à la fille aux cheveux noirs !', 7000);
    game.control = true;
    // Élise va au coin café
    elise.speed = 50;
    await game.wait(600);
    await elise.walkTo(21, 14, game);
    elise.dir = 'down';
    await game.wait(300);
    elise.setTile(21, 15); elise.sitting = true; elise.dir = 'left';
    eliseSeated = true;
    sc.extraSolid.add('21,15');
    elise.bubble = { type: 'thought', text: 'Il va venir ?', shown: 0, speed: 30, done: true };
    await game.wait(4000); if (elise.bubble && elise.bubble.text === 'Il va venir ?') elise.bubble = null;
  };
  // lumière douce des vitraux
  sc.drawOver = (g) => {
    g.fillStyle = 'rgba(255, 220, 160, 0.10)'; g.fillRect(0, 0, sc.w * TILE, sc.h * TILE);
  };
  return sc;
}

// ============================================================
// 2. LE RESTAURANT
// ============================================================
function makeRestaurant(game) {
  const map = [
    '################',
    '#wnwwnwwnwwnwww#',
    '#BBBB.........p#',
    '#..............#',
    '#.hTh.....hTh..#',
    '#..............#',
    '#.....hTh......#',
    '#..............#',
    '#.hTh......hTh.#',
    '#p............p#',
    '#######DD#######',
  ];
  const legend = {
    '#': S('wallWood', 1), 'w': S('wallWoodBase', 1), 'n': S('windowNight', 1), '.': S('floorWood'), 'p': S('plant', 1, 'floorWood'),
    'B': S('barCounter', 1), 'T': S('tableDate', 1), 'h': S('chair', 1, 'floorWood', [8, 13]), 'D': S('door', 1, 'wallWood'),
  };
  const sc = new Scene({ name: 'restaurant', bg: '#2a1810', map, legend, base: 'floorWood' });
  const tom = sc.add(new Character('Tom', { ...Looks.tom, top: '#c0455a', collar: '#fff' }, 6, 6, 'right')); tom.sitting = true; tom.speed = 64;
  const elise = sc.add(new Character('Élise', { ...Looks.elise, top: '#b7a4ff' }, 8, 6, 'left')); elise.sitting = true;
  const waiter = sc.add(new Character('Serveur', Looks.serveur, 5, 3, 'down')); waiter.speed = 60;
  const d1 = sc.add(new Character('Client', Looks.monsieur, 10, 4, 'right')); d1.sitting = true;
  const d2 = sc.add(new Character('Cliente', Looks.dame, 12, 4, 'left')); d2.sitting = true;
  sc.player = tom;
  sc.drawOver = (g) => { g.fillStyle = 'rgba(255, 170, 90, 0.12)'; g.fillRect(0, 0, sc.w * TILE, sc.h * TILE); };
  sc.script = async () => {
    game.control = false;
    Sound.play(Songs.restaurant);
    await game.fadeTo(0, 900);
    await game.wait(600);
    await waiter.walkTo(7, 5, game); waiter.dir = 'down';
    await game.say(waiter, 'Bonsoir ! Voici vos plats. Bon appétit, les tourtereaux.');
    waiter.walkTo(5, 3, game).then(() => { waiter.dir = 'down'; waiter.ai = wanderAI({ x: 5, y: 3, w: 9, h: 1 }); });
    await game.say(elise, 'Les tourtereaux... Il n\'y va pas par quatre chemins.');
    const c1 = await game.choose(tom, 'Que répondre ?', ['Il n\'a pas tort, non ?', 'Hum... désolé pour lui.']);
    if (c1 === 0) { elise.look = { ...elise.look, blush: true }; await game.say(elise, 'Haha ! Tu es plus courageux que tu n\'en as l\'air.'); game.hearts(elise, 3); }
    else await game.say(elise, 'Ne t\'excuse pas, c\'est mignon.');
    await game.say(elise, 'Dis-moi, Tom... pourquoi tu viens à la messe chaque dimanche ?');
    const c2 = await game.choose(tom, 'Pourquoi, au fond ?', ['Pour la musique de l\'orgue.', 'Pour toi, depuis quelque temps.']);
    if (c2 === 0) { await game.say(elise, 'Menteur ! Tu chantes faux, je t\'ai entendu. Ce n\'est pas pour la musique.'); await game.say(tom, '...D\'accord. Un peu pour toi aussi.'); }
    else { await game.say(elise, '...', { auto: 900 }); elise.look = { ...elise.look, blush: true }; await game.say(elise, 'Tu vas me faire rougir.'); }
    game.hearts(elise, 4);
    await game.say(elise, 'Moi, j\'y vais pour le calme. Et pour le café affreux, bien sûr.');
    await game.say(tom, 'Je crois que c\'est le meilleur dîner de ma vie.');
    await game.say(elise, 'Il n\'est même pas fini ! ... Mais oui. Moi aussi.');
    await game.say(elise, 'On va marcher un peu ? La nuit est douce.');
    tom.sitting = false; elise.sitting = false;
    tom.setTile(6, 7); elise.setTile(8, 7);
    await Promise.all([tom.walkTo(7, 9, game), elise.walkTo(8, 9, game)]);
    tom.dir = 'down'; elise.dir = 'down';
    Sound.sfx('door');
    await game.transition('Dehors, dans la nuit douce...', () => game.setScene(makeTown(game)));
  };
  return sc;
}

// ============================================================
// 3. LE QUARTIER, LA NUIT
// ============================================================
function makeTown(game) {
  const W = 32, H = 20;
  const m = buildMap(W, H, 'g');
  m.rect(0, 0, W, 1, 'R').rect(0, 1, W, 1, 'L');
  for (let x = 0; x < W; x++) if (x % 3 === 0) m.set(x, 1, 'b');
  m.rect(0, 2, W, 1, 'b').rect(5, 2, 3, 1, 'a').rect(17, 2, 3, 1, 'a').rect(26, 2, 3, 1, 'a');
  m.rect(0, 3, W, 1, 'B').set(2, 3, 'D').set(11, 3, 'D').set(23, 3, 'D').rect(5, 3, 3, 1, 'S').rect(17, 3, 3, 1, 'S').rect(26, 3, 3, 1, 'S');
  m.rect(0, 4, W, 1, 's').rect(0, 5, W, 3, 'r').rect(0, 6, W, 1, 'm').rect(0, 8, W, 1, 's');
  m.rect(11, 9, 2, 8, 'p').rect(12, 10, 7, 5, 'p').rect(8, 15, 14, 1, 'p');
  m.set(15, 16, 'n').set(16, 16, 'n');
  [[3, 12], [8, 13], [21, 10], [26, 14], [6, 9], [29, 12], [1, 16], [24, 16]].forEach(([x, y]) => m.set(x, y, 'F'));
  m.rect(0, 17, W, 1, 'E').rect(0, 18, W, 2, 'W');
  const legend = {
    'g': S('grass'), 'F': S('flowers'), 'R': S('roofEdge', 1), 'L': S('brickLit', 1), 'b': S('brick', 1), 'a': S('awning', 1), 'B': S('brickBase', 1), 'D': S('brickDoor', 1), 'S': S('brickShop', 1),
    's': S('sidewalk'), 'r': S('road'), 'm': S('roadLine'), 'p': S('cobble'), 'n': S('bench', 1, 'cobble', [9, 13]), 'E': S('riverEdge', 1), 'W': S('water', 1),
  };
  const props = [
    { kind: 'fountain', x: 14, y: 11, tw: 3, th: 3, w: 48, h: 48, solid: true },
    { kind: 'kiosk', x: 4, y: 10, tw: 3, th: 2, w: 48, h: 40, solid: true },
    ...[[2, 10], [2, 14], [29, 9], [28, 15], [9, 16], [22, 16], [19, 10], [7, 14]].map(([x, y]) => ({ kind: 'tree', x, y, tw: 1, th: 1, w: 16, h: 32, solid: true })),
    ...[[10, 9], [13, 9], [20, 13], [5, 16], [27, 12]].map(([x, y]) => ({ kind: 'lamp', x, y, tw: 1, th: 1, w: 16, h: 40, solid: true, light: true })),
  ];
  const sc = new Scene({ name: 'quartier', map: m.out(), legend, props });
  const tom = sc.add(new Character('Tom', { ...Looks.tom, top: '#c0455a', collar: '#fff' }, 11, 4, 'down')); tom.speed = 64;
  const elise = sc.add(new Character('Élise', { ...Looks.elise, top: '#b7a4ff', blush: true }, 12, 4, 'down')); elise.speed = 72;
  const vendor = sc.add(new Character('Glacier', Looks.glacier, 7, 11, 'down'));
  const cat = sc.add(new Character('Chat', Looks.enfant, 24, 12, 'down'));
  cat.draw = (g) => g.drawImage(getProp('cat', 16, 16, game.time), Math.round(cat.px), Math.round(cat.py));
  sc.player = tom;
  const visited = new Set();
  let ending = false;
  const near = (x, y, w = 1, h = 1) => { const [ax, ay] = tileAhead(tom); return ax >= x && ax < x + w && ay >= y && ay < y + h; };
  async function pause(fn) { game.control = false; await fn(); game.control = true; }
  sc.onTalk = async (ch) => {
    if (ch === elise) {
      elise.faceTowards(tom);
      const lines = ['C\'est joli, le quartier la nuit. Tout est calme.', 'Tu veux voir la fontaine ? On dit qu\'elle exauce les vœux.', 'J\'aime bien marcher avec toi.', 'Il y a un banc au bord de la rivière, là-bas. On ira s\'asseoir ?'];
      await game.say(elise, lines[Math.floor(Math.random() * lines.length)]);
    }
    if (ch === vendor) await iceCream();
    if (ch === cat) {
      await game.say(cat, 'Miaou.');
      if (!visited.has('chat')) { visited.add('chat'); await game.say(elise, 'Il te ressemble un peu. Il a l\'air timide, mais il vient quand même se faire caresser.'); await game.say(tom, 'Hé !'); }
    }
  };
  async function iceCream() {
    if (visited.has('glace')) { await game.say(vendor, 'Revenez quand vous voulez, les amoureux !'); return; }
    visited.add('glace');
    vendor.faceTowards(tom);
    await game.say(vendor, 'Deux boules pour les amoureux ? Allez, c\'est la maison qui offre !');
    await game.say(elise, 'Vanille-fraise, s\'il vous plaît !');
    await game.say(tom, 'Pareil pour moi... merci beaucoup.');
    await game.say(vendor, 'Ahh, l\'amour. Bonne soirée, vous deux.');
    game.hearts(elise, 3);
  }
  sc.interactables = [
    { test: () => near(14, 11, 3, 3), run: async () => {
      if (visited.has('fontaine')) { await game.say(elise, 'Chut, ne dis pas ton vœu, sinon il ne se réalisera pas !'); return; }
      visited.add('fontaine');
      await game.say(elise, 'Lance une pièce et fais un vœu !');
      Sound.sfx('splash'); for (let i = 0; i < 10; i++) game.particles.push({ kind: 'splash', x: 15 * 16 + 8, y: 12 * 16 + 4, vx: (Math.random() - 0.5) * 40, vy: -30 - Math.random() * 30, life: 700, t: 0 });
      await game.think(tom, 'Que cette soirée ne se termine jamais...');
      await game.say(elise, 'Alors ? C\'était quoi ?');
      await game.say(tom, 'Si je le dis, ça ne marchera pas.');
      await game.say(elise, 'Hmm. J\'espère que c\'est le même que le mien.');
      game.hearts(elise, 3);
    } },
    { test: () => near(4, 10, 3, 2), run: iceCream },
    { test: () => near(5, 3, 3, 1) && tom.dir === 'up', run: async () => { await game.say(tom, 'La boulangerie est fermée, mais ça sent encore le pain chaud.'); await game.say(elise, 'On reviendra dimanche prendre des croissants ?'); } },
    { test: () => near(17, 3, 3, 1) && tom.dir === 'up', run: async () => { await game.say(elise, 'Le fleuriste... Regarde les pivoines. Ce sont mes préférées.'); await game.think(tom, 'Pivoines. Je retiens.'); } },
    { test: () => near(26, 3, 3, 1) && tom.dir === 'up', run: async () => { await game.say(tom, 'Une librairie. On s\'y retrouvera un jour de pluie.'); } },
    { test: () => near(11, 3) && tom.dir === 'up', run: async () => { await game.say(elise, 'On y était il y a cinq minutes ! Tu veux déjà un dessert ?'); } },
    { test: () => props.some((p) => p.kind === 'lamp' && near(p.x, p.y)), run: async () => { await game.say(tom, 'Les lampadaires scintillent doucement.'); } },
    { test: () => near(15, 16, 2, 1) && !ending, run: async () => {
      ending = true;
      await game.say(elise, 'On s\'assoit un peu ?');
      await elise.walkTo(16, 15, game);
      tom.setTile(15, 16); tom.sitting = true; tom.dir = 'down';
      elise.setTile(16, 16); elise.sitting = true; elise.dir = 'down';
      await game.wait(800);
      await game.say(elise, 'Regarde les étoiles... On les voit à peine en ville, d\'habitude.');
      await game.say(tom, 'Je préfère te regarder, toi.');
      await game.say(elise, 'Tom !', { speed: 30 });
      elise.look = { ...elise.look, blush: true }; game.hearts(elise, 5); game.hearts(tom, 3);
      await game.say(elise, 'Tu sais... j\'ai l\'impression que cet hiver sera différent des autres.');
      await game.say(tom, 'Moi aussi. J\'ai hâte.');
      await game.wait(900);
      await game.transition('Quelques mois plus tard.\nLeur premier hiver ensemble...', () => game.setScene(makeChaletOutside(game)));
    } },
  ];
  // ambiance nocturne avec halos de lumière
  const [lightCv, lg] = mkCanvas(VW, VH);
  sc.drawOver = (g) => {
    lg.globalCompositeOperation = 'source-over';
    lg.clearRect(0, 0, VW, VH);
    lg.fillStyle = 'rgba(22, 20, 70, 0.42)'; lg.fillRect(0, 0, VW, VH);
    lg.globalCompositeOperation = 'destination-out';
    const glow = (wx, wy, r) => {
      const gr = lg.createRadialGradient(wx - game.cam.x, wy - game.cam.y, 2, wx - game.cam.x, wy - game.cam.y, r);
      gr.addColorStop(0, 'rgba(0,0,0,0.9)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      lg.fillStyle = gr; lg.fillRect(wx - game.cam.x - r, wy - game.cam.y - r, r * 2, r * 2);
    };
    for (const p of props) if (p.light) glow(p.x * 16 + 8, p.y * 16 - 20, 44);
    for (let x = 0; x < W; x++) if (m.rows[1][x] === 'L') glow(x * 16 + 8, 24, 20);
    glow(6 * 16, 11 * 16, 30);
    g.drawImage(lightCv, game.cam.x, game.cam.y);
    // étoiles au-dessus des toits ? (non visibles) — lucioles dans le parc
    for (let i = 0; i < 12; i++) {
      const fx = 40 + (i * 97) % (W * 16 - 80), fy = 150 + (i * 53) % 110 + Math.sin(game.time / 900 + i) * 4;
      const a = 0.4 + 0.4 * Math.sin(game.time / 500 + i * 2);
      g.fillStyle = `rgba(255, 240, 150, ${a.toFixed(2)})`; g.fillRect(Math.round(fx), Math.round(fy), 1, 1);
    }
  };
  sc.script = async () => {
    game.control = false;
    Sound.play(Songs.town);
    elise.ai = followAI(tom);
    await game.fadeTo(0, 900);
    await game.think(tom, 'Le quartier est si calme la nuit... Explorons un peu.', { auto: 2800 });
    game.showHint('Balade-toi avec Élise : fontaine, glacier, chat, vitrines... Quand tu veux finir la soirée, va au banc au bord de la rivière.', 9000);
    game.control = true;
  };
  return sc;
}

// ============================================================
// 4. LE CHALET — extérieur
// ============================================================
let chaletState = { snowman: 1, arrived: false, cocoa: false, ended: false, viewed: false };

function makeChaletOutside(game, fromDoor) {
  const W = 28, H = 20;
  const m = buildMap(W, H, 'S');
  m.rect(0, 0, W, 2, 'M').rect(0, 2, W, 2, 'm');
  m.rect(13, 9, 1, 9, 'P').rect(13, 17, 1, 2, 'P');
  m.rect(19, 12, 5, 1, 'J').rect(19, 13, 5, 2, 'I');
  m.rect(1, 9, 6, 1, 'f').rect(21, 9, 6, 1, 'f');
  m.rect(0, 0, 1, H, 'x').rect(W - 1, 0, 1, H, 'x').rect(0, H - 1, W, 1, 'x');
  const legend = { 'S': S('snow'), 'M': S('mountainTop', 1), 'm': S('mountain', 1), 'P': S('snowPath'), 'J': S('iceEdge'), 'I': S('ice'), 'f': S('fence', 1), 'x': S('snow', 1) };
  const props = [
    { kind: 'chalet', x: 10, y: 4, tw: 7, th: 5, w: 112, h: 80, solid: true },
    ...[[2, 5], [4, 6], [7, 5], [20, 5], [23, 6], [25, 4], [2, 12], [4, 15], [8, 17], [25, 11], [26, 16], [21, 17], [17, 16], [9, 12]].map(([x, y]) => ({ kind: 'pineSnow', x, y, tw: 1, th: 1, w: 16, h: 32, solid: true })),
    { kind: 'snowman', x: 6, y: 12, tw: 1, th: 1, w: 16, h: 24, solid: true, extra: chaletState.snowman, id: 'snowman' },
  ];
  const sc = new Scene({ name: 'chalet-ext', map: m.out(), legend, props });
  const tom = sc.add(new Character('Tom', { ...Looks.tom, top: '#3f86c4', scarf: '#c0455a' }, 13, 9, 'down')); tom.speed = 64;
  const elise = sc.add(new Character('Élise', { ...Looks.elise, top: '#c0455a', scarf: '#fff7f0', blush: true }, 14, 9, 'down')); elise.speed = 72;
  sc.player = tom;
  const near = (x, y, w = 1, h = 1) => { const [ax, ay] = tileAhead(tom); return ax >= x && ax < x + w && ay >= y && ay < y + h; };
  const snowmanProp = props.find((p) => p.id === 'snowman');
  sc.onTalk = async (ch) => {
    if (ch === elise) {
      elise.faceTowards(tom);
      const lines = ['Il fait froid, mais je suis bien.', 'On fait un bonhomme de neige ? J\'ai vu un tas de neige près de la barrière.', 'Le lac est gelé, on pourrait glisser dessus !', 'Rentrons au chaud quand tu veux. Il y a du chocolat chaud.'];
      await game.say(elise, lines[Math.floor(Math.random() * lines.length)]);
    }
  };
  sc.interactables = [
    { test: () => near(13, 8) && tom.dir === 'up', run: async () => {
      Sound.sfx('door');
      await game.transition(null, () => game.setScene(makeChaletInside(game)));
    } },
    { test: () => near(6, 12, 1, 2), run: async () => {
      if (chaletState.snowman === 1) { await game.say(elise, 'Un tas de neige ! Allez, on roule une grosse boule...'); chaletState.snowman = 2; snowmanProp.extra = 2; await game.wait(500); await game.say(tom, 'Et une deuxième pour la tête !'); }
      else if (chaletState.snowman === 2) { await game.say(elise, 'Attends... Il lui manque quelque chose.'); chaletState.snowman = 3; snowmanProp.extra = 3; await game.wait(400); await game.say(elise, 'Voilà ! Un chapeau, une carotte et mon écharpe. Il est parfait.'); await game.say(tom, 'Il te ressemble. Il a l\'air d\'avoir froid et d\'être content quand même.'); game.hearts(elise, 3); }
      else { await game.say(tom, 'Notre bonhomme de neige. Il monte la garde.'); }
    } },
    { test: () => near(19, 12, 5, 3), run: async () => {
      if (!chaletState.slid) { chaletState.slid = true; await game.say(elise, 'La glace est solide ! Regarde...'); game.control = false; const sx = elise.tx, sy = elise.ty; elise.ai = null; await elise.walkTo(21, 13, game); elise.dir = 'left'; await game.wait(300); elise.setTile(23, 13); await game.wait(300); elise.setTile(20, 13); await game.wait(400); await game.say(elise, 'Wouuuh ! Viens, trouillard !'); await game.say(tom, 'Je... je préfère te regarder tomber, d\'ici. Avec amour.'); await game.say(elise, 'Tom !'); await elise.walkTo(tom.tx, tom.ty, game, { adjacent: true }); elise.ai = followAI(tom); void sx; void sy; }
      else await game.say(tom, 'Le lac gelé scintille sous le soleil.');
    } },
    { test: () => tom.dir === 'up' && tom.ty === 4, run: async () => {
      await game.say(tom, 'Toute la vallée est là, sous la neige. On n\'entend rien du tout.');
      if (!chaletState.viewed) { chaletState.viewed = true; await game.say(elise, 'C\'est le plus bel endroit où je sois jamais allée.'); await game.say(elise, 'Enfin... c\'est surtout parce que tu es là.'); game.hearts(elise, 4); }
    } },
    { test: () => props.some((p) => p.kind === 'pineSnow' && near(p.x, p.y)), run: async () => {
      if (!chaletState.shook) { chaletState.shook = true; await game.say(tom, 'Ce sapin est magnifique... oups.'); for (let i = 0; i < 14; i++) game.particles.push({ kind: 'splash', x: tom.px + Math.random() * 16, y: tom.py - 8 - Math.random() * 10, vx: (Math.random() - 0.5) * 10, vy: 20 + Math.random() * 20, life: 900, t: 0 }); await game.say(elise, 'Hahaha ! Tu as de la neige plein les cheveux !'); }
      else await game.say(tom, 'Un sapin couvert de neige. Je ne le secoue plus, promis.');
    } },
  ];
  sc.drawOver = (g) => { g.fillStyle = 'rgba(200, 220, 255, 0.10)'; g.fillRect(0, 0, W * TILE, H * TILE); };
  sc.script = async () => {
    game.control = false;
    Sound.play(Songs.chalet);
    game.weather = 'snow';
    elise.ai = followAI(tom);
    if (fromDoor) { tom.setTile(13, 9); elise.setTile(14, 9); tom.dir = 'down'; elise.dir = 'down'; }
    await game.fadeTo(0, 1000);
    if (!chaletState.arrived) {
      chaletState.arrived = true;
      tom.setTile(13, 10); elise.setTile(14, 10); tom.dir = 'up'; elise.dir = 'up';
      await game.say(elise, 'Nous voilà ! Un petit chalet rien que pour nous, au milieu de la neige.');
      await game.say(tom, 'Il neige... c\'est encore plus beau que sur les photos.');
      await game.say(elise, 'On explore un peu, ou on rentre au chaud tout de suite ?');
      game.showHint('Explore autour du chalet (bonhomme de neige, lac gelé, sapins, vue) ou entre par la porte. À l\'intérieur, le feu de cheminée t\'attend.', 9000);
    }
    game.control = true;
  };
  return sc;
}

// ============================================================
// 4b. LE CHALET — intérieur
// ============================================================
function makeChaletInside(game) {
  const map = [
    'wwwwwwwwwwwwww',
    'wwnwkFfGkwnwww',
    'wT...RRR...KVw',
    'wU...RRR.....w',
    'w....Lor.....w',
    'w............w',
    'w..hAh.....p.w',
    'w............w',
    'w.....M......w',
    'wwwwwwDwwwwwww',
  ];
  const legend = {
    'w': S('wallWood', 1), 'n': S('windowSnow', 1), 'k': S('shelf', 1, 'wallWood'), 'F': S('fireplaceL', 1), 'f': S('fireplace', 1), 'G': S('fireplaceR', 1),
    '.': S('floorWood'), 'R': S('rug'), 'T': S('bedTop', 1), 'U': S('bedBottom', 1), 'K': S('kitchen', 1, 'floorWood'), 'V': S('stove', 1, 'floorWood'),
    'L': S('sofaL', 1, 'floorWood', [8, 13]), 'o': S('sofa', 1, 'floorWood', [8, 13]), 'r': S('sofaR', 1, 'floorWood', [8, 13]), 'h': S('chair', 1, 'floorWood'), 'A': S('tableWood', 1, 'floorWood'),
    'p': S('plant', 1, 'floorWood'), 'M': S('mat', 0, 'floorWood'), 'D': S('door', 1, 'wallWood'),
  };
  const sc = new Scene({ name: 'chalet-int', map, legend, base: 'floorWood' });
  const tom = sc.add(new Character('Tom', { ...Looks.tom, top: '#3f86c4', scarf: '#c0455a' }, 6, 8, 'up')); tom.speed = 64;
  const elise = sc.add(new Character('Élise', { ...Looks.elise, top: '#c0455a', scarf: '#fff7f0', blush: true }, 6, 7, 'up')); elise.speed = 72;
  sc.player = tom;
  const near = (x, y, w = 1, h = 1) => { const [ax, ay] = tileAhead(tom); return ax >= x && ax < x + w && ay >= y && ay < y + h; };
  sc.onTalk = async (ch) => {
    if (ch === elise) {
      elise.faceTowards(tom);
      const lines = chaletState.ended ? ['Je suis si bien, ici, avec toi.', 'Encore un chocolat chaud ?'] : ['Qu\'il fait bon ici ! Va voir la cheminée.', 'Il y a du chocolat chaud dans la cuisine, à droite.', 'Regarde par la fenêtre, on voit les sommets.'];
      await game.say(elise, lines[Math.floor(Math.random() * lines.length)]);
    }
  };
  sc.interactables = [
    { test: () => near(6, 9) && tom.dir === 'down', run: async () => { Sound.sfx('door'); await game.transition(null, () => game.setScene(makeChaletOutside(game, true))); } },
    { test: () => (near(2, 1) || near(10, 1)) && tom.dir === 'up', run: async () => { await game.say(tom, 'Les sommets sont tout blancs. La neige tombe sans bruit.'); } },
    { test: () => near(1, 2, 1, 2), run: async () => { await game.say(elise, 'Un gros édredon ! On sera bien au chaud ce soir.'); } },
    { test: () => (near(4, 1) || near(8, 1)) && tom.dir === 'up', run: async () => { await game.say(tom, 'Des livres, des jeux de société... Parfait pour une soirée au chaud.'); } },
    { test: () => near(11, 2, 2, 1) && tom.dir === 'up', run: async () => {
      if (!chaletState.cocoa) { chaletState.cocoa = true; await game.say(tom, 'Un peu de lait, du chocolat, une pincée de cannelle...'); tom.carry = 'mug'; await game.say(elise, 'Ça sent délicieusement bon ! Allons boire ça près du feu.'); game.showHint('Va vers la cheminée pour vous installer près du feu.', 5000); }
      else await game.say(tom, 'Il reste du chocolat pour plus tard.');
    } },
    { test: () => near(4, 6), run: async () => { await game.say(tom, 'Deux tasses sur la table, l\'une à côté de l\'autre.'); } },
    { test: () => near(5, 4, 3, 1) && tom.dir === 'up', run: async () => { await game.say(tom, 'Un canapé moelleux face à la cheminée.'); } },
    { test: () => near(5, 1, 3, 1) && tom.dir === 'up', run: async () => {
      if (chaletState.ended) { await game.say(tom, 'Le feu crépite doucement.'); return; }
      chaletState.ended = true;
      game.control = false; elise.ai = null;
      await game.say(tom, 'Le feu crépite... Viens, on s\'installe ?');
      if (!tom.carry) { await game.say(elise, 'Attends, je ramène le chocolat chaud !'); await elise.walkTo(11, 3, game); elise.dir = 'up'; await game.wait(700); elise.carry = 'mug'; }
      else { elise.carry = 'mug'; }
      await Promise.all([tom.walkTo(5, 5, game), elise.walkTo(7, 5, game)]);
      tom.setTile(5, 4); tom.sitting = true; tom.dir = 'down';
      elise.setTile(7, 4); elise.sitting = true; elise.dir = 'down';
      sc.extraSolid.add('6,4');
      await game.wait(900);
      await game.say(elise, 'Tu te souviens de la messe ? Tu bégayais tellement.');
      await game.say(tom, 'Tu m\'as regardé et j\'ai oublié comment on parle.');
      await game.say(elise, 'Et maintenant ?');
      await game.say(tom, 'Maintenant... je sais exactement quoi dire.');
      await game.say(tom, 'Je t\'aime, Élise.');
      await game.say(elise, '...', { auto: 1000 });
      game.hearts(elise, 8); game.hearts(tom, 6);
      await game.say(elise, 'Moi aussi, Tom. Depuis le troisième banc à gauche.');
      await game.wait(600);
      sc.showEnd = true; Sound.sfx('heart');
      await game.wait(5000);
      sc.showEnd = false;
      game.showHint('Fin ♥ — Tu peux continuer à explorer le chalet et la montagne.', 7000);
      tom.sitting = false; elise.sitting = false; tom.setTile(5, 5); elise.setTile(7, 5); sc.extraSolid.delete('6,4');
      elise.ai = followAI(tom);
      game.control = true;
    } },
  ];
  sc.drawOver = (g) => {
    // lueur du feu
    const f = 0.10 + 0.03 * Math.sin(game.time / 180);
    const gr = g.createRadialGradient(6 * 16 + 8, 24, 4, 6 * 16 + 8, 24, 90);
    gr.addColorStop(0, `rgba(255,170,80,${(f + 0.18).toFixed(2)})`); gr.addColorStop(1, 'rgba(255,170,80,0)');
    g.fillStyle = gr; g.fillRect(0, 0, sc.w * TILE, sc.h * TILE);
    g.fillStyle = `rgba(255, 180, 100, ${f.toFixed(2)})`; g.fillRect(0, 0, sc.w * TILE, sc.h * TILE);
  };
  sc.drawUI = (g) => {
    if (!sc.showEnd) return;
    g.fillStyle = 'rgba(20,12,30,0.45)'; g.fillRect(0, 60, VW, 60);
    g.font = '22px "Pixelify Sans", monospace'; g.fillStyle = '#ffd9e2'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('Fin', VW / 2, 84);
    g.drawImage(getProp('heart', 7, 7, 0), VW / 2 + 22, 78);
    g.font = FONT; g.fillStyle = '#fff7f0'; g.fillText('Merci d\'avoir joué.', VW / 2, 106);
    g.textAlign = 'left';
  };
  sc.script = async () => {
    game.control = false;
    game.weather = null; game.particles = game.particles.filter((p) => p.kind !== 'snow');
    elise.ai = followAI(tom);
    await game.fadeTo(0, 800);
    if (!chaletState.inside) { chaletState.inside = true; await game.say(elise, 'Oh, qu\'il fait bon ! Et regarde cette cheminée...'); }
    game.control = true;
  };
  return sc;
}
