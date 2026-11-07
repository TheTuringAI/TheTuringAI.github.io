# Un dimanche à la messe — petit RPG romantique (16 bits)

RPG web en vue de dessus (style Pokémon), entièrement en HTML5 Canvas, sans dépendance.

## Lancer le jeu

Servir le dossier avec n'importe quel serveur statique, par exemple :

    python3 -m http.server 8080

puis ouvrir http://localhost:8080/ (ouvrir index.html directement fonctionne aussi dans la plupart des navigateurs).

## Contrôles

- Flèches / ZQSD / WASD : se déplacer
- Espace / Entrée / E : parler, continuer, choisir
- M : couper / remettre la musique

## Déroulé

1. La messe : le prêtre parle (~30 s, on ne peut pas bouger), Tom pense, puis les paroissiens vaquent et Élise va au coin café.
2. Le restaurant : premier rendez-vous avec choix de dialogue.
3. Le quartier, la nuit : fontaine, glacier, chat, vitrines... puis le banc au bord de la rivière.
4. Le chalet enneigé : bonhomme de neige, lac gelé, puis l'intérieur (cheminée, chocolat chaud).

Pour tester une scène directement : `?scene=eglise|restaurant|quartier|chalet|interieur`.

## Fichiers

- `js/art.js` — tuiles, décors et sprites dessinés en code
- `js/engine.js` — entrées, caméra, bulles, transitions, musique chiptune
- `js/entities.js` — personnages, IA, scène, pathfinding
- `js/scenes.js` — les cartes et l'histoire
- `js/main.js` — boucle de jeu
