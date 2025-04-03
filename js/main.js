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

// --- Initialization ---
function init() {
    console.log("Initializing game...");
    SceneSetup.setupScene();
    Lighting.setupLighting();
    Environment.createGround();
    Environment.createObstacles();
    Target.createBunker(); // Creates initial target
    Player.setupPlayer();
    UI.setupUI(resetGame); // Pass resetGame function to UI module

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
    const deltaTime = SceneSetup.clock.getDelta();
    const elapsedTime = SceneSetup.clock.elapsedTime;

    if (GameState.isGameActive()) {
        // Player Updates
        Player.handlePlayerMovement(deltaTime); // Handles movement AND battery drain

        // Camera Update (match player drone)
        SceneSetup.camera.position.copy(Player.drone.position);
        SceneSetup.camera.quaternion.copy(Player.drone.quaternion);

        // Target Updates
        Target.updateBeacon(elapsedTime);
        Target.updateTarget(deltaTime, Player.drone.position); // Bunker firing logic

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
            // Check for target collision (Win condition for the level)
            if (Target.checkCollision(Player.drone.position)) {
                Target.onTargetDestroyed(); // Visual feedback (e.g., change color)
                GameState.setGameActive(false); // Pause game immediately
                if (SceneSetup.clock.running) SceneSetup.clock.stop(); // Stop clock
                Projectiles.removeAllProjectiles(); // Clear projectiles

                // Prepare for next level but wait for player click
                GameState.increaseLevel();
                Player.resetPlayer(); // Reset position/rotation
                GameState.resetBattery(); // Full battery for next level
                GameState.resetHealth(); // Full health for next level

                UI.showLevelCompleteScreen(GameState.getLevel()); // Show prompt
                // Target.resetTarget() will be called when player clicks to start next level
            }
        }
    } // End if(GameState.isGameActive())

    // Render the scene
    SceneSetup.renderer.render(SceneSetup.scene, SceneSetup.camera);
}

// --- Start ---
init();
