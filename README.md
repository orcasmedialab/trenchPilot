# Trench Pilot - Drone Game Prototype

This project is a 3D drone piloting game prototype built using JavaScript and the Three.js library.

## Game Concept

Players control a drone navigating a 3D environment filled with obstacles. The primary goal is to locate and destroy a target bunker while managing the drone's battery life and health.

## Current Features

*   **Drone Control:**
    *   Mouse controls looking/steering.
    *   Keyboard controls movement:
        *   `W`/`S`: Forward/Backward
        *   `A`/`D`: Strafe Left/Right
        *   `E` / `Space`: Ascend
        *   `F`: Descend
*   **Environment:**
    *   Procedurally generated ground plane.
    *   Randomly placed obstacles.
    *   Atmospheric fog.
*   **Objective:**
    *   Locate and collide with the target bunker to complete the level.
    *   The bunker's location is randomized each level.
*   **Gameplay Mechanics:**
    *   **Levels:** The game progresses through levels, starting at Level 1. Destroying the bunker advances to the next level.
    *   **Battery:** The drone has limited battery, draining passively and faster during movement. Game over if the battery reaches zero.
    *   **Health:** The drone has health points. Taking damage reduces health. Game over if health reaches zero.
    *   **Damage Sources:**
        *   **Enemy Fire:** The target bunker fires rapid, high-speed, high-damage projectiles (red tracers) when the player is within range.
        *   **Ground Collision:** Flying too close to the ground causes significant damage over time.
    *   **HUD:** Displays critical information:
        *   Battery percentage (color-coded)
        *   Current Speed
        *   Current Altitude
        *   Health percentage (color-coded)
        *   Current Level
    *   **Waypoint:** A green chevron indicator at the top of the screen points towards the target bunker's horizontal direction.
*   **Game Flow:**
    *   Starts with an instruction screen ("Click to Play").
    *   Clicking locks the pointer and starts the game.
    *   Destroying the bunker pauses the game, resets player state (position, health, battery), and prompts the player to click to start the next level.
    *   Running out of battery or health results in a "Game Over" screen with a "Play Again?" button.

## Technical Details

*   **Engine:** Three.js (via ES Module import)
*   **Language:** JavaScript (ES Modules)
*   **Structure:** The code is organized into modules for different functionalities:
    *   `main.js`: Core game loop and initialization.
    *   `sceneSetup.js`: Three.js scene, camera, renderer setup.
    *   `lighting.js`: Scene lighting.
    *   `environment.js`: Ground and obstacle generation.
    *   `player.js`: Drone object, controls, movement logic.
    *   `target.js`: Bunker creation, firing logic, collision.
    *   `projectiles.js`: Projectile creation, movement, collision.
    *   `gameState.js`: Manages battery, health, level, active state.
    *   `ui.js`: Handles HUD updates, blocker screens, pointer lock, waypoint.
    *   `config.js`: Central configuration values (speeds, rates, damage, etc.).
*   **Assets:** Basic textures for ground and obstacles are located in the `textures/` directory.
