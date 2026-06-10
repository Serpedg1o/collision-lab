// ============================================================
// Collision Lab — Configuration
// ============================================================

export const BALL_RADIUS = 0.5;
export const BALL_MASS = 7.0;          // тяжёлые металлические шары

export const PLAYER_MOVE_FORCE = 0.08;
export const PLAYER_ACCELERATION = 1.0;
export const PLAYER_MAX_SPEED = 3.0;
export const PLAYER_BRAKE_FORCE = 0.99;

export const BOOST_MULTIPLIER = 2.0;
export const BOOST_MAX_SPEED = 8.0;

export const GROUND_FRICTION = 0.0;
export const BALL_RESTITUTION = 0.9;  // упругость — ключевой параметр выщелкивания

// Трение между шарами — низкое чтобы скользили друг с друга
export const BALL_FRICTION = 0.05;

// --- Jump ---
export const JUMP_FORCE = 15.0;
export const GRAVITY_SCALE = 4.0;

// --- Camera ---
export const CAMERA_DISTANCE = 10.0;
export const CAMERA_HEIGHT = 5.0;
export const CAMERA_LERP = 0.08;

// --- Scene ---
export const GROUND_SIZE = 200.0;
export const RESET_POSITION = { x: 0, y: 0.51, z: 0 } as const;

export const PHYSICS_TIMESTEP = 1 / 60;

// --- Static balls ---
export const STATIC_BALL_POSITIONS: { x: number; y: number; z: number }[] = [
  { x:  4, y: 0.51, z:  0 },
  { x: -4, y: 0.51, z:  0 },
  { x:  0, y: 0.51, z:  4 },
  { x:  0, y: 0.51, z: -4 },
  { x:  6, y: 0.51, z:  6 },
]