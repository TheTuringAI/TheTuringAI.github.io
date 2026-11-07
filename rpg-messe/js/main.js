// ---------- Boucle principale ----------
(function () {
  const canvas = document.getElementById('game');
  const game = new Game(canvas);
  window.game = game;
  Input.init();

  game.setScene = (sc) => {
    game.scene = sc; game.particles = game.particles.filter((p) => p.kind === 'snow' && sc.name === 'chalet-ext');
    if (sc.name !== 'chalet-ext') game.weather = null;
    game.hint = null;
    if (sc.script) sc.script();
  };

  let started = false;
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last); last = now;
    if (game.title) {
      game.time += dt;
      if (Input.pressedAction) {
        game.title = false; Sound.ensure(); started = true;
        const dbg = new URLSearchParams(location.search).get('scene');
        const makers = { eglise: makeChurch, restaurant: makeRestaurant, quartier: makeTown, chalet: makeChaletOutside, interieur: makeChaletInside };
        game.setScene((makers[dbg] || makeChurch)(game));
      }
    } else {
      game.update(dt);
      handleInput();
    }
    game.draw();
    Input.endFrame();
    requestAnimationFrame(frame);
  }

  let busy = false;
  async function handleInput() {
    const sc = game.scene; if (!sc || !game.control || busy) return;
    const p = sc.player;
    if (Input.pressedAction && !p.moving) {
      const [ax, ay] = tileAhead(p);
      const ch = sc.charAt(ax, ay);
      busy = true; const wasControl = game.control; game.control = false;
      try {
        if (ch && sc.onTalk) await sc.onTalk(ch);
        else {
          const it = sc.interactables.find((i) => i.test());
          if (it) await it.run();
        }
      } finally { busy = false; if (game.scene === sc && wasControl) game.control = true; }
      return;
    }
    const d = Input.dir();
    if (d && !p.moving) p.tryMove(d);
  }

  // préparer la scène de titre : on affiche l'église en fond
  game.scene = makeChurch(game); game.scene.script = null; game.fade = 0; game.fadeTarget = 0;
  requestAnimationFrame(frame);
})();
