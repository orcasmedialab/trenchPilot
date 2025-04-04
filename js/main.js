// js/main.js
import * as THREE from 'three';
import * as SceneSetup from './sceneSetup.js';
import * as Lighting from './lighting.js';
import * as Environment from './environment.js';
import * as Player from './player.js';
import * as Target from './target.js';
import * as Projectiles from './projectiles.js'; // Import Projectiles
import * as UI from './ui.js';
import * as GameState from './gameState.js';
import * as Config from './config.js'; // Import Config for detonation radius

// --- Game State Variables ---
let isExploding = false; // Is the explosion animation playing?
let explosionTimer = 0; // Timer for explosion duration
let detonationResult = null; // 'win' or 'lose' after detonation

// --- Initialization ---
function init() {
    console.log("Initializing game...");
    SceneSetup.setupScene();
    Lighting.setupLighting();
    Environment.createGround();
    Environment.createObstacles();
    Target.createBunker(); // Creates initial target
    Player.setupPlayer();
    UI.setupUI(resetGame, handleDetonation); // Pass resetGame AND handleDetonation callbacks

    resetGame(); // Set initial game state (shows start screen)
    animate();   // Start the game loop
}

// --- Reset Logic ---
function resetGame() {
    console.log("Main reset triggered.");
    GameState.resetState(); // Resets level, health, battery
    Player.resetPlayer();
    Target.resetTarget(); // Recreates bunker, resets materials/beacon, cooldown
    Projectiles.removeAllProjectiles(); // Clear any leftover projectiles
    isExploding = false; // Reset explosion state
    explosionTimer = 0;
    detonationResult = null;
    UI.showStartScreen(); // Set the UI to the initial state
}

// --- Player Hit Callback ---
function onPlayerHit(damageAmount) {
    GameState.decreaseHealth(damageAmount);
    // Optional: Add visual/audio feedback for getting hit
}

// --- Game Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Handle explosion animation phase
    if (isExploding) {
        explosionTimer -= SceneSetup.clock.getDelta(); // Use clock delta for timer
        if (explosionTimer <= 0) {
            isExploding = false;
            // UI screen is shown *before* the timer starts for 'lose',
            // and *after* the timer finishes for 'win'.
            if (detonationResult === 'win') {
                 UI.showLevelCompleteScreen(GameState.getLevel()); // Show prompt after delay
            }
            // No need to show game over screen again here for 'lose'
            detonationResult = null; // Reset result marker
        }
        // Keep rendering during explosion, but don't update game logic
        SceneSetup.renderer.render(SceneSetup.scene, SceneSetup.camera);
        return; // Skip normal game loop updates
    }

    // Normal game loop
    const deltaTime = SceneSetup.clock.getDelta();
    const elapsedTime = SceneSetup.clock.elapsedTime;

    if (GameState.isGameActive()) {
        // Player Updates
        Player.handlePlayerMovement(deltaTime); // Handles movement, roll, battery drain, ground damage

        // Camera Update (match player drone)
        SceneSetup.camera.position.copy(Player.drone.position);
        SceneSetup.camera.quaternion.copy(Player.drone.quaternion);

        // Target Updates
        const targetPos = Target.getTargetPosition(); // Get target position once
        if (targetPos) {
            Target.updateBeacon(elapsedTime);
            Target.updateTarget(deltaTime, Player.drone.position); // Bunker firing logic

            // Check distance for detonation prompt
            const distanceToTarget = Player.drone.position.distanceTo(targetPos);
            UI.showDetonatePrompt(distanceToTarget <= Config.DETONATION_RADIUS);
        } else {
            UI.showDetonatePrompt(false); // Hide if no target
        }


        // Projectile Updates
        Projectiles.updateProjectiles(deltaTime, Player.drone, onPlayerHit); // Pass player object and hit callback

        // HUD Updates
        const battery = GameState.getBattery();
        const health = GameState.getDamage(); // getDamage now returns health
        const level = GameState.getLevel();
        const groundSpeed = Math.sqrt(Player.droneVelocity.x**2 + Player.droneVelocity.z**2);
        const altitude = Player.drone.position.y;
        UI.updateHUD(battery, groundSpeed, altitude, health, level); // Pass health and level

        // Check Win/Loss Conditions
        if (health <= 0) {
            UI.showGameOverScreen("Drone Destroyed!");
        } else if (battery <= 0) {
            UI.showGameOverScreen("Battery Depleted!");
        } else {
            // Collision check removed - replaced by manual detonation
            /*
            if (Target.checkCollision(Player.drone.position)) { ... }
            */
        }
    } else {
        // Ensure detonate prompt is hidden when game is not active
        UI.showDetonatePrompt(false);
    } // End if(GameState.isGameActive())

    // Render the scene
    SceneSetup.renderer.render(SceneSetup.scene, SceneSetup.camera);
}

// --- Detonation Handler ---
function handleDetonation() {
    if (!GameState.isGameActive() || isExploding) return; // Only detonate if game active and not already exploding

    const targetPos = Target.getTargetPosition();
    if (!targetPos) return; // No target to detonate near

    const distanceToTarget = Player.drone.position.distanceTo(targetPos);

    // Common actions before checking success/failure
    Projectiles.removeAllProjectiles(); // Clear projectiles
    GameState.setGameActive(false); // Pause game logic (prevents player input/updates)
    UI.showDetonatePrompt(false); // Hide prompt
    isExploding = true; // Start explosion timer phase
    explosionTimer = Config.EXPLOSION_DURATION;

    if (distanceToTarget <= Config.DETONATION_RADIUS) {
        // SUCCESS!
        console.log("Detonation successful!");
        Target.triggerExplosionEffect(); // Make bunker disappear only on success
        detonationResult = 'win';
        // Prepare state for next level
        GameState.increaseLevel();
        Player.resetPlayer(); // Reset position/rotation immediately
        GameState.resetBattery(); // Full battery for next level
        GameState.resetHealth(); // Full health for next level
        // Level complete UI shown after explosion timer finishes
    } else {
        // FAILURE!
        console.log("Detonation failed - too far!");
        detonationResult = 'lose';
        // Show game over screen immediately
        UI.showGameOverScreen("Drone Destroyed!");
        // Explosion timer still runs (drone explodes), but UI is already game over
    }
}


// --- Start ---
init();
