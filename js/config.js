// js/config.js
export const TEXTURE_PATH = 'textures/';

// Controls & Movement
export const MOUSE_SENSITIVITY = 0.002;
export const MOVE_SPEED = 0.6; // Base horizontal speed multiplier
export const VERTICAL_SPEED_BASE = 0.15; // Base downward speed multiplier
export const VERTICAL_LIFT_POWER = 0.4; // Upward speed multiplier
export const MIN_ALTITUDE = 0.5;
export const GROUND_DAMAGE_THRESHOLD = 0.6; // Altitude below which ground damage occurs
export const GROUND_DAMAGE_RATE = 150.0; // Kill in < 1 sec (100 health / 150 rate = 0.66s)

// Player Health
export const MAX_HEALTH = 100.0;

// Battery
export const MAX_BATTERY = 100.0;
export const BASE_DRAIN_RATE = 0.5; // Units per second (passive)
export const MOVEMENT_DRAIN_MULTIPLIER = 0.8; // Extra drain factor when moving

// Environment
export const FOG_COLOR = 0x778899;
export const FOG_NEAR = 50;
export const FOG_FAR = 500;
export const GROUND_SIZE = 2000;
export const NUM_OBSTACLES = 150;
export const OBSTACLE_SPREAD_FACTOR = 1200; // How far obstacles spread

// Target
export const TARGET_MIN_SPAWN_DIST = 150;
export const TARGET_MAX_SPAWN_DIST = 650; // Max = MIN + Random(500)
export const BEACON_BLINK_SPEED = 4; // Higher is faster
export const TARGET_FIRE_RANGE = 75.0; // Increased range slightly
export const TARGET_FIRE_RATE = 0.2; // Even faster fire rate (20 shots/sec)
export const ENEMY_PROJECTILE_SPEED = 50.0; // 10x faster projectile speed
export const ENEMY_PROJECTILE_LIFESPAN = 1.0; // Drastically reduced lifespan due to extreme speed
export const ENEMY_PROJECTILE_DAMAGE = 15.0; // 4x damage
