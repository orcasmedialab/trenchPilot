// js/gameState.js
import * as Config from './config.js';

let gameActive = false;
let currentBattery = Config.MAX_BATTERY;
let currentHealth = Config.MAX_HEALTH;
let currentLevel = 1;
// let currentDamage = 0; // Placeholder - Replaced by health

export function isGameActive() {
    return gameActive;
}

export function setGameActive(state) {
    gameActive = state;
}

export function getBattery() {
    return currentBattery;
}

export function resetBattery() {
    currentBattery = Config.MAX_BATTERY;
}

export function decreaseBattery(amount) {
    currentBattery = Math.max(0, currentBattery - amount);
}

export function getDamage() {
    return currentHealth;
}

export function decreaseHealth(amount) {
    currentHealth = Math.max(0, currentHealth - amount);
}

export function resetHealth() {
    currentHealth = Config.MAX_HEALTH;
}

export function getLevel() {
    return currentLevel;
}

export function increaseLevel() {
    currentLevel++;
}

export function resetLevel() {
    currentLevel = 1;
}


export function resetState() {
    gameActive = false;
    resetBattery();
    resetHealth();
    resetLevel();
    // currentDamage = 0; // Removed
}
