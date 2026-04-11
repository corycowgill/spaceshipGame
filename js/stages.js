import { ENEMY_TYPE } from './enemies.js';

// Wave definition: { type, count, formation, delay (before next wave), x, y, speed, extras }

const STAGE_1_WAVES = [
    // Asteroid Belt - Gentle introduction (fighters only first 3 waves)
    { type: ENEMY_TYPE.FIGHTER, count: 3, formation: 'line', delay: 3.5, speed: 3.5 },
    { type: ENEMY_TYPE.FIGHTER, count: 3, formation: 'v', delay: 3.5, speed: 4 },
    { type: ENEMY_TYPE.FIGHTER, count: 4, formation: 'sine', delay: 4, speed: 4, extras: { amplitude: 2.5 } },
    // Now introduce darts
    { type: ENEMY_TYPE.DART, count: 3, formation: 'line', delay: 3, speed: 7 },
    { type: ENEMY_TYPE.FIGHTER, count: 5, formation: 'v', delay: 3, speed: 5 },
    // Breather gap then introduce turrets
    { type: ENEMY_TYPE.TURRET, count: 2, formation: 'turret', delay: 4.5, speed: 2 },
    { type: ENEMY_TYPE.FIGHTER, count: 4, formation: 'arc_left', delay: 3, speed: 6 },
    { type: ENEMY_TYPE.FIGHTER, count: 4, formation: 'arc_right', delay: 3, speed: 6 },
    // Breather then mini-challenge
    { type: ENEMY_TYPE.DART, count: 5, formation: 'dive', delay: 4, speed: 10 },
    { type: ENEMY_TYPE.CRUISER, count: 1, formation: 'line', delay: 4, x: 0, speed: 3 },
    { type: ENEMY_TYPE.FIGHTER, count: 5, formation: 'sine', delay: 0, speed: 5, extras: { amplitude: 4 } },
];

const STAGE_2_WAVES = [
    // Enemy Fleet - More aggressive
    { type: ENEMY_TYPE.FIGHTER, count: 5, formation: 'line', delay: 2, speed: 6 },
    { type: ENEMY_TYPE.FIGHTER, count: 5, formation: 'arc_left', delay: 1, speed: 8 },
    { type: ENEMY_TYPE.FIGHTER, count: 5, formation: 'arc_right', delay: 3, speed: 8 },
    { type: ENEMY_TYPE.CRUISER, count: 2, formation: 'line', delay: 3, speed: 3 },
    { type: ENEMY_TYPE.BOMBER, count: 3, formation: 'v', delay: 3, speed: 4 },
    { type: ENEMY_TYPE.DART, count: 8, formation: 'charge', delay: 3, speed: 22 },
    { type: ENEMY_TYPE.FIGHTER, count: 6, formation: 'sine', delay: 2, speed: 5, extras: { amplitude: 5, frequency: 3 } },
    { type: ENEMY_TYPE.TURRET, count: 3, formation: 'turret', delay: 3, x: 0, speed: 2 },
    { type: ENEMY_TYPE.CRUISER, count: 2, formation: 'line', delay: 2, speed: 3, extras: { hp: 12 } },
    { type: ENEMY_TYPE.FIGHTER, count: 8, formation: 'spiral', delay: 3, speed: 4 },
    { type: ENEMY_TYPE.BOMBER, count: 4, formation: 'line', delay: 3, speed: 4 },
    { type: ENEMY_TYPE.DART, count: 6, formation: 'dive', delay: 0, speed: 15 },
];

const STAGE_3_WAVES = [
    // Alien Planet Surface - Mixed enemies, harder patterns
    { type: ENEMY_TYPE.FIGHTER, count: 6, formation: 'v', delay: 2, speed: 6 },
    { type: ENEMY_TYPE.BOMBER, count: 3, formation: 'line', delay: 2, speed: 5 },
    { type: ENEMY_TYPE.TURRET, count: 4, formation: 'turret', delay: 3, speed: 2, extras: { fireRate: 1.5 } },
    { type: ENEMY_TYPE.CRUISER, count: 3, formation: 'line', delay: 3, speed: 3 },
    { type: ENEMY_TYPE.DART, count: 10, formation: 'charge', delay: 2, speed: 25 },
    { type: ENEMY_TYPE.FIGHTER, count: 8, formation: 'circle', delay: 3, speed: 3, extras: { radius: 5, centerY: 6 } },
    { type: ENEMY_TYPE.BOMBER, count: 4, formation: 'v', delay: 3, speed: 5 },
    { type: ENEMY_TYPE.CRUISER, count: 2, formation: 'line', delay: 2, speed: 4, extras: { hp: 15 } },
    { type: ENEMY_TYPE.FIGHTER, count: 6, formation: 'arc_left', delay: 1, speed: 9 },
    { type: ENEMY_TYPE.FIGHTER, count: 6, formation: 'arc_right', delay: 3, speed: 9 },
    { type: ENEMY_TYPE.TURRET, count: 3, formation: 'turret', delay: 2, speed: 2, extras: { fireRate: 1.2, hp: 8 } },
    { type: ENEMY_TYPE.FIGHTER, count: 10, formation: 'spiral', delay: 3, speed: 5 },
    { type: ENEMY_TYPE.CRUISER, count: 3, formation: 'v', delay: 0, speed: 3, extras: { hp: 12 } },
];

const STAGE_4_WAVES = [
    // Underground Base - Dense, mechanical
    { type: ENEMY_TYPE.TURRET, count: 5, formation: 'turret', delay: 3, speed: 2, extras: { fireRate: 1.2 } },
    { type: ENEMY_TYPE.FIGHTER, count: 8, formation: 'v', delay: 2, speed: 7 },
    { type: ENEMY_TYPE.CRUISER, count: 3, formation: 'line', delay: 3, speed: 3, extras: { hp: 15 } },
    { type: ENEMY_TYPE.BOMBER, count: 5, formation: 'v', delay: 2, speed: 5 },
    { type: ENEMY_TYPE.DART, count: 12, formation: 'charge', delay: 3, speed: 28 },
    { type: ENEMY_TYPE.FIGHTER, count: 6, formation: 'sine', delay: 2, speed: 6, extras: { amplitude: 6, frequency: 4 } },
    { type: ENEMY_TYPE.TURRET, count: 4, formation: 'turret', delay: 2, speed: 2, extras: { fireRate: 1.0, hp: 10 } },
    { type: ENEMY_TYPE.CRUISER, count: 4, formation: 'v', delay: 3, speed: 4, extras: { hp: 15 } },
    { type: ENEMY_TYPE.FIGHTER, count: 10, formation: 'circle', delay: 2, speed: 4, extras: { radius: 6 } },
    { type: ENEMY_TYPE.BOMBER, count: 4, formation: 'line', delay: 2, speed: 5 },
    { type: ENEMY_TYPE.FIGHTER, count: 8, formation: 'arc_left', delay: 1, speed: 10 },
    { type: ENEMY_TYPE.FIGHTER, count: 8, formation: 'arc_right', delay: 3, speed: 10 },
    { type: ENEMY_TYPE.CRUISER, count: 2, formation: 'line', delay: 2, speed: 3, extras: { hp: 20, fireRate: 1.0 } },
    { type: ENEMY_TYPE.DART, count: 8, formation: 'dive', delay: 0, speed: 18 },
];

const STAGE_5_WAVES = [
    // Final Mothership - Everything at once
    { type: ENEMY_TYPE.FIGHTER, count: 10, formation: 'v', delay: 2, speed: 8 },
    { type: ENEMY_TYPE.CRUISER, count: 4, formation: 'line', delay: 2, speed: 4, extras: { hp: 18 } },
    { type: ENEMY_TYPE.BOMBER, count: 5, formation: 'v', delay: 2, speed: 6 },
    { type: ENEMY_TYPE.TURRET, count: 5, formation: 'turret', delay: 3, speed: 2, extras: { fireRate: 0.8, hp: 12 } },
    { type: ENEMY_TYPE.DART, count: 15, formation: 'charge', delay: 2, speed: 30 },
    { type: ENEMY_TYPE.FIGHTER, count: 10, formation: 'spiral', delay: 2, speed: 6 },
    { type: ENEMY_TYPE.CRUISER, count: 3, formation: 'v', delay: 2, speed: 4, extras: { hp: 20 } },
    { type: ENEMY_TYPE.BOMBER, count: 6, formation: 'line', delay: 2, speed: 6 },
    { type: ENEMY_TYPE.FIGHTER, count: 8, formation: 'circle', delay: 2, speed: 5, extras: { radius: 7 } },
    { type: ENEMY_TYPE.TURRET, count: 4, formation: 'turret', delay: 2, speed: 2, extras: { fireRate: 0.7, hp: 15 } },
    { type: ENEMY_TYPE.CRUISER, count: 4, formation: 'line', delay: 2, speed: 4, extras: { hp: 25 } },
    { type: ENEMY_TYPE.DART, count: 10, formation: 'dive', delay: 2, speed: 20 },
    { type: ENEMY_TYPE.FIGHTER, count: 12, formation: 'sine', delay: 2, speed: 7, extras: { amplitude: 7 } },
    { type: ENEMY_TYPE.BOMBER, count: 6, formation: 'v', delay: 2, speed: 6 },
    { type: ENEMY_TYPE.CRUISER, count: 5, formation: 'v', delay: 0, speed: 5, extras: { hp: 20 } },
];

export const STAGES = [
    STAGE_1_WAVES,
    STAGE_2_WAVES,
    STAGE_3_WAVES,
    STAGE_4_WAVES,
    STAGE_5_WAVES,
];
