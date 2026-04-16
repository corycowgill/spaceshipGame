# VOID STRIKER

A vertical-scrolling space shooter in the style of Axelay and Space Megaforce, built entirely with procedural graphics in Three.js. No sprites, no textures, no assets — every ship, explosion, and star is generated from code.

## Play

Serve the directory with any static HTTP server:

```bash
npx serve .
# or
python3 -m http.server
```

Open in a browser. Works on desktop (keyboard), mobile (touch), and with Xbox/PlayStation controllers.

## Controls

| Action | Keyboard | Gamepad | Touch |
|--------|----------|---------|-------|
| Move | Arrow keys / WASD | Left stick / D-pad | Left half drag |
| Fire | Space / Z (auto-fire) | A / X / RB / RT | Right half hold |
| Bomb | X / C | B / Y / LB | — |
| Focus (slow) | Shift | LT | — |
| Pause | P / Esc | Start/Menu | — |

## Features

**5 Stages** — Asteroid Belt, Enemy Fleet, Alien Planet, Underground Base, Final Mothership. Each with unique enemy compositions, a color-themed starfield, and a multi-phase boss.

**6 Weapons** — Single, Spread, Side Cannons, Rear Shot, Laser Beam, Homing Missiles. Each upgradeable to level 3 via power-up pickups.

**5 Enemy Types** — Fighters, Cruisers, Turrets (with aiming barrels), Bombers, and Darts (kamikaze burst on death). Eight formation patterns: line, V, sine wave, arc, circle, spiral, dive, charge.

**5 Bosses** — Each with 3-4 attack phases, distinct bullet patterns, and visual telegraphs (weapon ports glow red before firing). Phase transitions clear all bullets and give the player breathing room.

**Combo System** — Chain kills within 1.8 seconds to build a multiplier (x2 through x8). Displayed on the HUD with floating score popups at every kill. Resets on death or 2 seconds idle.

**Graze Bonus** — Enemy bullets passing within 0.5 units of the player (without hitting) award bonus points scaled by the combo multiplier, with a sparkle effect and audio ping.

**Bomb System** — Screen-clearing panic button that destroys all bullets, damages every enemy, and grants brief invincibility. Start with 2, earn 1 per stage clear, max 3.

**Focus Mode** — Hold Shift/LT to reduce speed to 40% for precise bullet dodging, with a HUD indicator.

**Forgiving Death** — Dying drops weapon level by 1 instead of resetting to default. One continue allowed per run (costs half your score). Extra lives at score milestones (50k, 150k, 300k, 500k).

**Cross-Platform** — Keyboard, touch (virtual joystick + fire button), and gamepad (Xbox standard mapping) all supported. iOS Safari compatible with importmap polyfill and gesture prevention.

## Technical Architecture

```
index.html          Entry point, Three.js importmap, iOS meta tags
js/
  main.js           Game loop, state machine, collision, events (857 lines)
  config.js         All constants, colors, game states
  input.js          Keyboard + touch joystick + Gamepad API polling
  audio.js          Web Audio API — synthesized music + 10 SFX
  starfield.js      3-layer parallax stars + nebula clouds + twinkle
  player.js         Ship mesh (8 layers), momentum physics, focus mode
  bullets.js        Pooled bullet system — core+glow layers, laser beam
  enemies.js        5 types with outlines/inner detail/cores, 8 patterns
  bosses.js         5 bosses, timer queue attacks, phase transitions
  powerups.js       Per-type icons, rainbow ring, magnet attraction
  particles.js      Pooled particles, shockwave rings, screen flash
  overlay.js        Canvas HUD — score, combo, bombs, popups, touch UI
  stages.js         Wave definitions for all 5 stages
```

**5,271 lines of JavaScript. Zero dependencies beyond Three.js (loaded from CDN).**

Every visual is procedural:
- Ships are `THREE.ShapeGeometry` polygons with 4-5 stacked layers (outline, body, inner hull, accent core, glow halo)
- Bullets use a bright white core mesh + wider additive-blend glow mesh
- Explosions are a pooled `THREE.Points` system with age-based color ramps (white → yellow → orange → red) plus expanding `RingGeometry` shockwaves
- Stars use `THREE.BufferGeometry` points with per-vertex HSL color and sine-wave twinkle
- Background nebulae are large `CircleGeometry` meshes with low-opacity additive blending

The game runs in a `THREE.OrthographicCamera` looking down at the XY plane, with all gameplay on a 24×36 unit grid rendered to a 480×720 canvas that scales to fit the viewport.

## How It Was Built

This game was built entirely through a conversation with [Claude Code](https://claude.ai/code), Anthropic's AI coding agent, in a single session. Here's how the development unfolded:

### Commit 1 — Initial implementation
The entire game was scaffolded from a natural-language game design document describing "VOID STRIKER — a vertical scrolling space shooter in the style of Axelay / Space Megaforce." Claude Code generated all 14 source files (~3,600 lines) in one pass: the Three.js renderer, orthographic camera, game state machine, player ship, 6 weapon types, 5 enemy types with 8 formation patterns, 5 multi-phase bosses, parallax starfield, particle system, HUD overlay, Web Audio synthesizer with per-stage chiptune music, and 5 stages of wave definitions.

### Commit 2 — Ad blocker fix
The game wouldn't load for users with ad blockers. `hud.js` and `background.js` were being blocked by EasyList filter rules that target common ad-script filenames. Renamed to `overlay.js` and `starfield.js`.

### Commit 3 — Null reference fixes
Use-after-destroy race conditions: powerups destroyed by collection were still being updated the next frame (mesh was null), and enemy hit-flash `setTimeout` callbacks fired after the enemy was already destroyed. Fixed with active-flag guards and replaced `setTimeout` with frame-based flash timers.

### Commit 4 — Visual overhaul
An AI "art director" agent reviewed all procedural assets and delivered 18 specific critiques. The core finding: everything was a single flat polygon with no layering. The fix touched every visual file:
- Every ship got a dark outline layer, inner hull detail, and additive glow cores
- Bullets became core+glow dual meshes with additive blending
- Explosions gained shockwave rings, age-based color ramps, debris particles, and screen flash
- The starfield got nebula clouds, per-star color variation, and twinkle animation
- Power-ups got per-type icon shapes and rainbow-cycling outer rings
- The color palette was reworked to reserve hot magenta exclusively for the player

This commit also added full iOS Safari support (touch joystick, gesture prevention, importmap polyfill).

### Commit 5 — Loading screen fix
The game was stuck on "LOADING..." because `main.js` registered a `window.addEventListener('load', ...)` listener, but since the module was loaded via dynamic `import()` from a deferred `<script type="module">`, the load event had already fired by the time the code ran. Fixed by checking `document.readyState` before registering the listener, and added global error handlers that surface failures visually.

### Commit 6 — Xbox controller support
Added Gamepad API support with per-frame polling, 0.15 dead zone on analog sticks, and standard Xbox mapping (A/X/RB/RT = fire, D-pad = move, Start = pause). The title screen dynamically switches control hints when a gamepad is detected.

### Commit 7 — Gameplay overhaul
An AI "game designer" agent reviewed the mechanics and identified 13 issues. The biggest: no bomb/panic button (critical for shmups), devastating death penalty (weapon reset = soft game-over), no combo system (no incentive for aggressive play), and stiff instant-velocity movement. All 13 were implemented:
- Bomb system (screen clear + damage + invincibility)
- Combo multiplier chain (x1–x8)
- Graze bonus for near-misses
- Smooth momentum-based movement with focus/slow mode
- Gentler death penalty (drop 1 level instead of full reset)
- Weapon rebalancing (SPREAD damage fixed, REAR given "power shot" identity)
- Dart kamikaze explosion, boss phase transition feedback with bullet clear
- Boss `setTimeout` replaced with pause-safe timer queue
- Stage 1 pacing gentled for new players

### Commit 8 — Feel and polish
Added floating score popups, power-up magnet attraction, score milestone extra lives, slow-motion on death, a one-continue system on game over, Stage 5 rework with unique tactical compositions (escort formations, twin pincers, circle traps), stronger boss attack telegraphs, tutorial hints during Stage 1, and dedicated audio for bombs, grazes, and phase transitions.

### Process

No code was written by hand. Every line was generated, reviewed, debugged, and iterated on by Claude Code based on high-level directions ("create this game", "improve the visuals", "improve the gameplay") and specific bug reports. The AI handled architecture decisions, Three.js API usage, game design trade-offs, cross-platform compatibility, and performance considerations (object pooling, buffer geometry, additive blending).

Total: **8 commits, ~5,300 lines of code, zero hand-written lines.**
