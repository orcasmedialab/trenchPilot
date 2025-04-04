// js/player.js
import * as THREE from 'three';
import * as Config from './config.js';
import * as GameState from './gameState.js';
import { scene } from './sceneSetup.js'; // Needed for potential effects later?

export const drone = new THREE.Object3D();
export const keyboard = {}; // State of keyboard keys

const initialDronePosition = new THREE.Vector3(0, 10, 0);
const euler = new THREE.Euler(0, 0, 0, 'YXZ'); // Pitch, Yaw, Roll order
const PI_2 = Math.PI / 2;
let currentRoll = 0; // Variable to track current roll angle

export const droneVelocity = new THREE.Vector3(); // Public for speed calculation
export const previousPosition = new THREE.Vector3(); // Public for speed calculation

export function setupPlayer() {
    drone.position.copy(initialDronePosition);
    previousPosition.copy(initialDronePosition); // Initialize for first frame speed calc
    setupPlayerControls();
}

export function resetPlayer() {
    drone.position.copy(initialDronePosition);
    drone.rotation.set(0, 0, 0);
    euler.set(0, 0, 0, 'YXZ'); // Reset pitch, yaw, roll
    drone.quaternion.setFromEuler(euler);
    previousPosition.copy(drone.position);
    droneVelocity.set(0, 0, 0);
    currentRoll = 0; // Reset roll state
}

function setupPlayerControls() {
    document.addEventListener('keydown', (event) => { keyboard[event.key.toLowerCase()] = true; });
    document.addEventListener('keyup', (event) => { keyboard[event.key.toLowerCase()] = false; });
    // Mouse listener setup is handled in ui.js (pointer lock)
}

export function handlePlayerRotation(movementX, movementY) {
    euler.setFromQuaternion(drone.quaternion);
    euler.y -= movementX * Config.MOUSE_SENSITIVITY;
    euler.x -= movementY * Config.MOUSE_SENSITIVITY;
    euler.x = Math.max(-PI_2 + 0.1, Math.min(PI_2 - 0.1, euler.x)); // Clamp pitch
    // Roll is handled in handlePlayerMovement now, based on strafe input
    // We only apply yaw (euler.y) and pitch (euler.x) from mouse here
    // Roll (euler.z) will be interpolated based on movement keys
    drone.quaternion.setFromEuler(euler); // Apply pitch/yaw immediately
}

export function handlePlayerMovement(deltaTime) {
    let isMoving = false;
    let movementCost = 0.0; // Factor for battery drain based on input

    // Scale speeds by delta time for frame rate independence
    const effectiveMoveSpeed = Config.MOVE_SPEED * deltaTime * 60;
    const effectiveVerticalBase = Config.VERTICAL_SPEED_BASE * deltaTime * 60;
    const effectiveVerticalLift = Config.VERTICAL_LIFT_POWER * deltaTime * 60;

    // Calculate direction vectors based on current rotation
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(drone.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(drone.quaternion);

    // Determine target roll based on strafe input
    let targetRoll = 0;
    if (keyboard['a']) { // Strafing left
        drone.position.addScaledVector(right, -effectiveMoveSpeed * 0.8);
        isMoving = true;
        movementCost += 0.8;
        targetRoll = Config.MAX_ROLL_ANGLE; // Roll right when strafing left
    }
    if (keyboard['d']) { // Strafing right
        drone.position.addScaledVector(right, effectiveMoveSpeed * 0.8);
        isMoving = true;
        movementCost += 0.8;
        targetRoll = -Config.MAX_ROLL_ANGLE; // Roll left when strafing right
    }

    // Apply forward/backward/vertical movement
    if (keyboard['w']) { drone.position.addScaledVector(forward, effectiveMoveSpeed); isMoving = true; movementCost += 1.0; }
    if (keyboard['s']) { drone.position.addScaledVector(forward, -effectiveMoveSpeed * 0.7); isMoving = true; movementCost += 0.7; }
    if (keyboard['e'] || keyboard[' ']) { drone.position.y += effectiveVerticalLift; isMoving = true; movementCost += 1.5; }
    if (keyboard['f']) { drone.position.y -= effectiveVerticalBase; isMoving = true; movementCost += 1.0; }

    // Interpolate current roll towards target roll
    currentRoll = THREE.MathUtils.lerp(currentRoll, targetRoll, deltaTime * Config.ROLL_INTERPOLATION_SPEED);

    // Apply the interpolated roll to the drone's rotation
    // We need to re-apply the quaternion including the new roll
    // Get current pitch/yaw from the drone's quaternion (set by handlePlayerRotation)
    euler.setFromQuaternion(drone.quaternion, 'YXZ');
    // Set the roll component
    euler.z = currentRoll;
    // Apply the combined rotation
    drone.quaternion.setFromEuler(euler);

    // Enforce minimum altitude
    if (drone.position.y < Config.MIN_ALTITUDE) {
        drone.position.y = Config.MIN_ALTITUDE;
    }

    // Battery drain calculation
    let drainAmount = Config.BASE_DRAIN_RATE * deltaTime;
    if (isMoving) {
        drainAmount += Config.MOVEMENT_DRAIN_MULTIPLIER * movementCost * deltaTime;
    }
    GameState.decreaseBattery(drainAmount);

    // Update velocity for HUD (calculation done in main loop)
    if (deltaTime > 0) {
        droneVelocity.subVectors(drone.position, previousPosition).divideScalar(deltaTime);
    } else {
    droneVelocity.set(0,0,0);
    }
    previousPosition.copy(drone.position); // Store for next frame

    // Check for ground damage
    if (drone.position.y < Config.GROUND_DAMAGE_THRESHOLD) {
        GameState.decreaseHealth(Config.GROUND_DAMAGE_RATE * deltaTime);
        // Optional: Add visual/audio feedback for ground collision here
    }
}
