// Game configuration constants
export const CONFIG = {
    // Game world dimensions (in world units)
    GAME_WIDTH: 24,
    GAME_HEIGHT: 36,

    // Display
    CANVAS_WIDTH: 480,
    CANVAS_HEIGHT: 720,

    // Player
    PLAYER_SPEED: 20,
    PLAYER_SIZE: 1.0,
    MAX_LIVES: 3,
    INVINCIBILITY_TIME: 2.5,
    RESPAWN_TIME: 1.5,

    // Bullets
    PLAYER_BULLET_SPEED: 40,
    ENEMY_BULLET_SPEED: 14,
    PLAYER_FIRE_RATE: 0.12, // seconds between shots
    LASER_DPS: 120, // damage per second

    // Enemies
    ENEMY_SPAWN_MARGIN: 2,

    // Power-ups
    POWERUP_FALL_SPEED: 6,
    POWERUP_SIZE: 0.8,
    POWERUP_DROP_CHANCE: 0.25,

    // Particles
    MAX_PARTICLES: 500,
    EXPLOSION_PARTICLE_COUNT: 20,
    BIG_EXPLOSION_PARTICLE_COUNT: 60,

    // Scoring
    SCORE_FIGHTER: 100,
    SCORE_CRUISER: 250,
    SCORE_TURRET: 150,
    SCORE_BOSS: 5000,
    SCORE_POWERUP: 50,

    // Stage
    STAGE_TRANSITION_TIME: 4,
    BOSS_WARNING_TIME: 3,
};

export const WEAPON_TYPES = {
    SINGLE: 0,
    SPREAD: 1,
    SIDE: 2,
    REAR: 3,
    LASER: 4,
    HOMING: 5,
};

export const WEAPON_NAMES = ['SINGLE', 'SPREAD', 'SIDE', 'REAR', 'LASER', 'HOMING'];

export const COLORS = {
    // Player
    PLAYER_BODY: 0x00bbff,
    PLAYER_WING: 0x0088cc,
    PLAYER_ENGINE: 0x00ffff,
    PLAYER_BULLET: 0x00ffee,

    // Enemies
    ENEMY_FIGHTER: 0xff2266,
    ENEMY_CRUISER: 0xcc44ff,
    ENEMY_TURRET: 0xff8800,
    ENEMY_BULLET: 0xff3366,

    // Bosses
    BOSS_BODY: 0x8833ff,
    BOSS_ACCENT: 0xff00aa,

    // Effects
    POWERUP_WEAPON: 0x00ff88,
    POWERUP_UPGRADE: 0xffdd00,
    POWERUP_LIFE: 0xff4488,
    EXPLOSION_CORE: 0xffffaa,
    EXPLOSION_MID: 0xffaa00,
    EXPLOSION_OUTER: 0xff3300,

    // Background
    STAR_BRIGHT: 0xffffff,
    STAR_MID: 0x8888cc,
    STAR_DIM: 0x444466,
};

export const GAME_STATE = {
    TITLE: 'title',
    PLAYING: 'playing',
    STAGE_INTRO: 'stage_intro',
    BOSS_WARNING: 'boss_warning',
    BOSS_FIGHT: 'boss_fight',
    STAGE_CLEAR: 'stage_clear',
    GAME_OVER: 'game_over',
    VICTORY: 'victory',
    PAUSED: 'paused',
};

export const STAGE_NAMES = [
    'ASTEROID BELT',
    'ENEMY FLEET',
    'ALIEN PLANET',
    'UNDERGROUND BASE',
    'FINAL MOTHERSHIP',
];
