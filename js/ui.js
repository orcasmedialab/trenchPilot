// js/ui.js
import * as THREE from 'three'; // Explicitly import THREE
import * as GameState from './gameState.js';
import { handlePlayerRotation } from './player.js'; // For mouse movement
import { clock } from './sceneSetup.js'; // To stop/start clock

// DOM Element References
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const objectiveInfo = document.getElementById('objectiveInfo');
const resetButton = document.getElementById('resetButton');
const batteryElement = document.getElementById('hud-battery');
const speedElement = document.getElementById('hud-speed');
const altitudeElement = document.getElementById('hud-altitude');
const healthElement = document.getElementById('hud-health'); // Renamed from damageElement
const levelElement = document.getElementById('hud-level'); // New element
const waypointElement = document.getElementById('waypoint'); // Restore // Waypoint element

let onResetCallback = null; // Function to call when reset is clicked

// Helper vectors for waypoint calculation
const targetScreenPos = new THREE.Vector3(); // Restore
const cameraForward = new THREE.Vector3(); // Restore
const directionToTarget = new THREE.Vector3(); // Restore

export function setupUI(resetCallback) {
    onResetCallback = resetCallback;
    setupPointerLock();
    setupButtonListeners();
    showStartScreen(); // Initial state
}

export function showStartScreen() {
    blocker.style.display = 'flex';
    resetButton.style.display = 'none';
    instructions.innerHTML = "Click to Play<br>(Use Mouse to look, WASD to move, E/Space to ascend, F to descend)";
    // Use a static message initially, level will be updated when game starts
    objectiveInfo.textContent = "Objective: Destroy Bunker";
    waypointElement.style.display = 'none'; // Restore // Hide waypoint initially
}

// New function for level complete screen
export function showLevelCompleteScreen(nextLevel) {
    GameState.setGameActive(false); // Ensure game is paused
    if (clock.running) clock.stop();

    blocker.style.display = 'flex';
    resetButton.style.display = 'none'; // Hide reset button
    instructions.innerHTML = `Level ${nextLevel - 1} Complete!<br>Click to Start Level ${nextLevel}`;
    objectiveInfo.textContent = "Prepare for Next Level";
    waypointElement.style.display = 'none'; // Restore // Hide waypoint

    // Attempt to exit pointer lock if it was active
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
    if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock();
}


export function showGameOverScreen(message) {
    GameState.setGameActive(false);
    if (clock.running) clock.stop();

    blocker.style.display = 'flex';
    resetButton.style.display = 'block'; // Show reset button
    instructions.innerHTML = message;
    objectiveInfo.textContent = "Mission Status";
    waypointElement.style.display = 'none'; // Restore // Hide waypoint

    // Attempt to exit pointer lock
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
    if (document.exitPointerLock) document.exitPointerLock();
}

// Need access to Target module to reset it when starting next level
import { resetTarget } from './target.js'; // Restore this import

function setupPointerLock() {
    blocker.addEventListener('click', () => {
        // Request lock if game isn't over OR if showing level complete screen
        const isGameOver = resetButton.style.display === 'block';
        const isLevelComplete = instructions.innerHTML.includes("Level Complete");

        if (!isGameOver) { // Allow click on start screen or level complete screen
             document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock; // Ensure vendor prefixes
             if (document.body.requestPointerLock) {
                 document.body.requestPointerLock();
             } else {
                 console.error("Pointer Lock API not supported or failed to initialize.");
                 instructions.textContent = 'Error: Pointer Lock not supported by browser.';
             }
             // Removed duplicate else block that was here
        }
    });

    document.addEventListener('pointerlockchange', onPointerLockChange, false);
    document.addEventListener('mozpointerlockchange', onPointerLockChange, false); // Firefox prefix
    document.addEventListener('pointerlockerror', onPointerLockError, false);
    document.addEventListener('mozpointerlockerror', onPointerLockError, false); // Firefox prefix
}

function onPointerLockChange() {
    const isPointerLocked = document.pointerLockElement === document.body || document.mozPointerLockElement === document.body;

    if (isPointerLocked) {
        // Locked
        const isGameOver = resetButton.style.display === 'block';
        const wasLevelComplete = instructions.innerHTML.includes("Level Complete");

        if (!isGameOver) { // Only activate game if not game over
            blocker.style.display = 'none';

            // Update objective text when starting/resuming
            objectiveInfo.textContent = `Objective: Destroy Bunker (Level ${GameState.getLevel()})`;

            if (wasLevelComplete) {
                // If we just completed a level, reset the target now
                resetTarget(); // Restore this call
                // Objective text already updated above
            }

            GameState.setGameActive(true);
            if (!clock.running) clock.start(); // Start/resume clock
        }
         document.addEventListener('mousemove', onMouseMove, false); // Always listen when locked
    } else {
        // Unlocked
        const isGameOver = resetButton.style.display === 'block'; // Check again in case state changed
        const isLevelComplete = instructions.innerHTML.includes("Level Complete");

        document.removeEventListener('mousemove', onMouseMove, false);
        // Only pause and show blocker if game *was* active and it's not game over or level complete screen
        if (GameState.isGameActive() && !isGameOver && !isLevelComplete) {
            GameState.setGameActive(false);
            if (clock.running) clock.stop();
            blocker.style.display = 'flex'; // Show blocker
            instructions.innerHTML = "Click to Resume<br>(Paused)"; // Show paused message
        }
    }
}

function onPointerLockError() {
    console.error('Pointer Lock Error');
    instructions.textContent = 'Pointer Lock failed. Click the screen again?';
    // Ensure game state is inactive if lock fails
    GameState.setGameActive(false);
    if (clock.running) clock.stop();
    blocker.style.display = 'flex';
}

function onMouseMove(event) {
    // We directly call the player's rotation handler
    const movementX = event.movementX || event.mozMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || 0;
    handlePlayerRotation(movementX, movementY);
}

function setupButtonListeners() {
    resetButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent blocker click
        if (onResetCallback) {
            onResetCallback(); // Call the main reset logic
        }
    });
}

// Need access to camera and target position for waypoint
import { camera } from './sceneSetup.js'; // Restore
import { getTargetPosition } from './target.js'; // Restore // Need a function to get target pos

// Restore Waypoint Function
function updateWaypoint() {
    const targetPos = getTargetPosition();
    if (!targetPos || !GameState.isGameActive()) {
        waypointElement.style.display = 'none'; // Restore
        return;
    }

    // Project target world position to screen space (optional, could just use angle)
    // targetScreenPos.copy(targetPos).project(camera);

    // Get camera's forward direction (in world space, ignoring pitch)
    camera.getWorldDirection(cameraForward);
    cameraForward.y = 0; // Project onto XZ plane
    cameraForward.normalize();

    // Get direction from camera to target (in world space, ignoring pitch)
    directionToTarget.subVectors(targetPos, camera.position);
    directionToTarget.y = 0; // Project onto XZ plane
    directionToTarget.normalize();

    // Calculate angle between camera forward and target direction
    // Use atan2 for signed angle
    const angle = Math.atan2(
        cameraForward.x * directionToTarget.z - cameraForward.z * directionToTarget.x, // Cross product's Y component
        cameraForward.x * directionToTarget.x + cameraForward.z * directionToTarget.z  // Dot product
    );

    // Convert angle to degrees and add offset for chevron's initial rotation
    const angleDeg = angle * (180 / Math.PI) - 135; // Subtract 45 degrees because chevron points up at -45deg
    waypointElement.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`; // Restore
    waypointElement.style.display = 'block'; // Restore // Show waypoint
}
// End Waypoint Function


export function updateHUD(battery, speed, altitude, health, level) { // Added health, level
    batteryElement.textContent = `BAT: ${battery.toFixed(1)}%`;
    speedElement.textContent = `SPD: ${speed.toFixed(1)} m/s`;
    altitudeElement.textContent = `ALT: ${altitude.toFixed(1)} m`;
    healthElement.textContent = `HP: ${health.toFixed(0)}%`; // Changed from DMG, use health
    levelElement.textContent = `LVL: ${level}`; // Update level

    // Update Waypoint
    updateWaypoint(); // Restore call

    // Update battery color
    if (battery < 10) batteryElement.style.color = 'rgba(255, 0, 0, 0.8)'; // Red
    else if (battery < 25) batteryElement.style.color = 'rgba(255, 165, 0, 0.8)'; // Orange
    else batteryElement.style.color = 'rgba(0, 255, 0, 0.8)'; // Green

    // Update health color (similar logic)
    if (health < 15) healthElement.style.color = 'rgba(255, 0, 0, 0.9)'; // Bright Red
    else if (health < 40) healthElement.style.color = 'rgba(255, 165, 0, 0.9)'; // Bright Orange
    else healthElement.style.color = 'rgba(100, 255, 100, 0.9)'; // Bright Green (was using CSS default red-ish)
}
