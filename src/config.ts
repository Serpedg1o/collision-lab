// ============================================================
// Physics Lab — Movement + Jump Configuration
// ============================================================

export const BALL_RADIUS = 0.5;
export const BALL_MASS = 1.0;

export const PLAYER_MOVE_FORCE = 0.8;
export const PLAYER_ACCELERATION = 1.0;
export const PLAYER_MAX_SPEED = 12.0;
export const PLAYER_BRAKE_FORCE = 0.99;

export const BOOST_MULTIPLIER = 2.0;
export const BOOST_MAX_SPEED = 20.0;

export const GROUND_FRICTION = 0.0;
export const BALL_RESTITUTION = 0.0;

// --- Jump ---
// Вертикальный импульс. Чем выше — тем выше прыжок.
// Для перепрыгивания шара того же диаметра нужно ~1 диаметр высоты = ~5.0–6.0
export const JUMP_FORCE = 15;

// Гравитация. Высокая = тяжёлый шар, быстро падает.
export const GRAVITY_SCALE = 3.0;

// --- Camera ---
export const CAMERA_DISTANCE = 10.0;
export const CAMERA_HEIGHT = 5.0;
export const CAMERA_LERP = 0.08;

// --- Scene ---
export const GROUND_SIZE = 200.0;
export const RESET_POSITION = { x: 0, y: 0.51, z: 0 } as const;

export const PHYSICS_TIMESTEP = 1 / 60;