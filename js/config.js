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
    // Player - cyan body, hot magenta accent (reserved for player only)
    PLAYER_BODY: 0x00ccff,
    PLAYER_WING: 0x0066aa,
    PLAYER_HULL: 0x002244,
    PLAYER_COCKPIT: 0xff00ff,
    PLAYER_ENGINE: 0x00ffff,
    PLAYER_GLOW: 0x00aaff,
    PLAYER_BULLET: 0x00ffee,
    PLAYER_BULLET_CORE: 0xffffff,

    // Outlines for that 16-bit "sprite" look
    OUTLINE: 0x000011,

    // Enemies - distinct hues, no magenta (reserved for player)
    ENEMY_FIGHTER: 0xff3322,
    ENEMY_FIGHTER_DARK: 0x661100,
    ENEMY_FIGHTER_CORE: 0xffaa00,
    ENEMY_CRUISER: 0x2266ff,
    ENEMY_CRUISER_DARK: 0x001144,
    ENEMY_CRUISER_CORE: 0x66ccff,
    ENEMY_TURRET: 0xff8800,
    ENEMY_TURRET_DARK: 0x442200,
    ENEMY_TURRET_CORE: 0xffdd44,
    ENEMY_BOMBER: 0xffaa00,
    ENEMY_BOMBER_DARK: 0x553300,
    ENEMY_BOMBER_CORE: 0xffffaa,
    ENEMY_DART: 0xdd00aa,
    ENEMY_DART_DARK: 0x440033,
    ENEMY_DART_CORE: 0xffffff,
    ENEMY_BULLET: 0xff4466,
    ENEMY_BULLET_CORE: 0xffcccc,

    // Bosses - deep violet with magenta glow
    BOSS_BODY: 0x3a0080,
    BOSS_BODY_DARK: 0x110022,
    BOSS_ACCENT: 0xff00aa,
    BOSS_PORT: 0xff2244,

    // Powerups
    POWERUP_WEAPON: 0x00ff88,
    POWERUP_UPGRADE: 0xffdd00,
    POWERUP_LIFE: 0xff4488,

    // Explosions - age-based ramp
    EXPLOSION_WHITE: 0xffffff,
    EXPLOSION_CORE: 0xffffaa,
    EXPLOSION_MID: 0xffaa00,
    EXPLOSION_OUTER: 0xff3300,
    EXPLOSION_DEBRIS: 0x332222,

    // Background
    STAR_BRIGHT: 0xffffff,
    STAR_MID: 0xaaaaff,
    STAR_DIM: 0x334466,
    NEBULA_BLUE: 0x2244aa,
    NEBULA_MAGENTA: 0x882266,
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
