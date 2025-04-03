// js/projectiles.js
import * as THREE from 'three';
import * as Config from './config.js';
import { scene } from './sceneSetup.js'; // Need scene to add/remove meshes

const activeProjectiles = [];
// Ensure geometry is a thin, elongated cylinder (rod)
const projectileGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3.0, 6); // radiusTop, radiusBottom, height (elongated 3x), radialSegments
// Ensure material color is red
const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red tracer color

// This rotation is not needed if we use setFromUnitVectors correctly
// const alignRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);

class Projectile {
    constructor(origin, direction) {
        this.mesh = new THREE.Mesh(projectileGeometry, projectileMaterial);
        this.mesh.position.copy(origin);
        this.direction = direction.normalize(); // Ensure direction is normalized

        // Point the cylinder (whose axis is Y) along the direction vector
        this.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.direction);

        this.speed = Config.ENEMY_PROJECTILE_SPEED;
        this.lifeTimer = Config.ENEMY_PROJECTILE_LIFESPAN;
        this.damage = Config.ENEMY_PROJECTILE_DAMAGE;

        scene.add(this.mesh); // Add mesh to the scene
    }

    update(deltaTime) {
        const velocity = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        // Move projectile
        this.mesh.position.add(velocity);

        // No need to update rotation every frame if direction is constant
        // If projectiles could change direction, we'd update quaternion here:
        // this.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.direction);

        // Decrease lifespan
        this.lifeTimer -= deltaTime;
        // Return false if lifespan expired
        return this.lifeTimer > 0;
    }

    destroy() {
        scene.remove(this.mesh); // Remove mesh from the scene
        // Optional: Dispose geometry/material if performance becomes an issue
    }
}

export function createProjectile(origin, direction) {
    const projectile = new Projectile(origin, direction);
    activeProjectiles.push(projectile);
}

// playerObject should have a .position property (Vector3)
// playerHitCallback should be a function that accepts damage amount
export function updateProjectiles(deltaTime, playerObject, playerHitCallback) {
    const playerPosition = playerObject.position; // Get player position once
    const playerHitboxRadius = 1.0; // Define player hitbox size (adjust if needed)
    const projectileRadius = projectileGeometry.parameters.height / 2; // Use half-height for collision check

    for (let i = activeProjectiles.length - 1; i >= 0; i--) {
        const proj = activeProjectiles[i];
        const alive = proj.update(deltaTime);

        // Simple distance check for collision with player
        const distanceToPlayer = proj.mesh.position.distanceTo(playerPosition);
        // Use projectile's half-length for collision radius check
        const hitPlayer = distanceToPlayer < (projectileRadius + playerHitboxRadius);

        if (!alive || hitPlayer) {
            if (hitPlayer) {
                playerHitCallback(proj.damage); // Notify main game of hit
            }
            proj.destroy(); // Remove mesh from scene
            activeProjectiles.splice(i, 1); // Remove from array
        }
    }
}

export function removeAllProjectiles() {
    activeProjectiles.forEach(proj => proj.destroy());
    activeProjectiles.length = 0; // Clear the array
}
