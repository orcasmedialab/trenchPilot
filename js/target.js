// js/target.js
import * as THREE from 'three';
import * as Config from './config.js';
import { scene, textureLoader } from './sceneSetup.js';
import { createProjectile } from './projectiles.js'; // Import projectile creation

let bunkerGroup = null;
let entranceMesh = null;
let beaconLightMesh = null;
let targetCollisionBox = new THREE.Box3();
let fireCooldown = 0; // Timer for firing rate

const concreteTex = textureLoader.load(Config.TEXTURE_PATH + 'concrete_texture.jpg'); // Load once
const woodTex = textureLoader.load(Config.TEXTURE_PATH + 'wood_texture.jpg');
const fireOriginOffset = new THREE.Vector3(0, 0.5, -1.5); // Where projectiles originate relative to bunker center

export function createBunker() {
    // Dispose old material if mesh exists
    if (entranceMesh && entranceMesh.material) {
        entranceMesh.material.dispose();
    }
    // Remove old group if exists
    if (bunkerGroup && bunkerGroup.parent) {
        scene.remove(bunkerGroup);
        // Optional: Traverse and dispose geometries if needed later
    }
    entranceMesh = null; // Clear reference

    bunkerGroup = new THREE.Group();
    const rampMat = new THREE.MeshStandardMaterial({ map: concreteTex, side: THREE.DoubleSide, roughness: 0.8 });
    const entranceMatProperties = { color: 0x111111, roughness: 0.5 }; // Store properties
    const bermMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.9 });

    // Ramp
    const rampGeo = new THREE.PlaneGeometry(6, 8); const ramp = new THREE.Mesh(rampGeo, rampMat); ramp.rotation.x = Math.PI / 2 + 0.8; ramp.position.y = 0.1; ramp.position.z = 3; ramp.receiveShadow = true; bunkerGroup.add(ramp);
    // Entrance
    const entranceGeo = new THREE.BoxGeometry(3, 2.5, 2);
    // Create a completely NEW material instance each time createBunker is called
    entranceMesh = new THREE.Mesh(entranceGeo, new THREE.MeshStandardMaterial(entranceMatProperties)); // Use new material
    entranceMesh.position.y = -0.5; entranceMesh.position.z = -0.5; entranceMesh.castShadow = true; bunkerGroup.add(entranceMesh);
    // Berms
    const bermGeo = new THREE.BoxGeometry(1, 0.6, 1); for (let i = 0; i < 8; i++) { const berm = new THREE.Mesh(bermGeo, bermMat); berm.position.set((Math.random() - 0.5) * 6, 0.3, (Math.random() * -4) - 1.5); berm.rotation.y = Math.random() * Math.PI; berm.castShadow = true; berm.receiveShadow = true; bunkerGroup.add(berm); }
    // Beacon
    const beaconGeo = new THREE.SphereGeometry(0.3, 8, 8); const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); beaconLightMesh = new THREE.Mesh(beaconGeo, beaconMat); beaconLightMesh.position.set(0, 1.5, -1.0); bunkerGroup.add(beaconLightMesh);

    // Positioning - "Warm up" Math.random()
    Math.random(); Math.random(); Math.random(); // Discard a few values

    const randomDist = Math.random() * (Config.TARGET_MAX_SPAWN_DIST - Config.TARGET_MIN_SPAWN_DIST) + Config.TARGET_MIN_SPAWN_DIST;
    const randomAngle = Math.random() * Math.PI * 2;
    bunkerGroup.position.set(
        Math.cos(randomAngle) * randomDist,
        0,
        Math.sin(randomAngle) * randomDist
    );
    scene.add(bunkerGroup);

    // Collision Box
    scene.updateMatrixWorld(true); // Ensure matrices are calculated
    targetCollisionBox.setFromObject(entranceMesh, true);
    targetCollisionBox.expandByScalar(0.5); // Make slightly more forgiving
}

export function updateBeacon(elapsedTime) {
    if (beaconLightMesh) {
        beaconLightMesh.visible = Math.sin(elapsedTime * Config.BEACON_BLINK_SPEED) > 0;
    }
}

// New function to handle target logic like firing
export function updateTarget(deltaTime, playerPosition) {
    if (!bunkerGroup) return; // Don't do anything if bunker doesn't exist

    // Update fire cooldown timer
    if (fireCooldown > 0) {
        fireCooldown -= deltaTime;
    }

    // Check distance to player
    const distanceToPlayer = bunkerGroup.position.distanceTo(playerPosition);

    // Check if player is in range and cooldown is ready
    if (distanceToPlayer <= Config.TARGET_FIRE_RANGE && fireCooldown <= 0) {
        // Calculate direction towards player
        const direction = new THREE.Vector3().subVectors(playerPosition, bunkerGroup.position).normalize();

        // Calculate projectile origin point in world space
        const origin = bunkerGroup.position.clone().add(fireOriginOffset); // Adjust origin slightly

        // Create projectile
        createProjectile(origin, direction);

        // Reset cooldown
        fireCooldown = Config.TARGET_FIRE_RATE;
    }
}


export function checkCollision(dronePosition) {
    if (!entranceMesh) return false; // Can't collide if no mesh
    // Simple point-like collision check for the drone
    const dronePointBox = new THREE.Box3(
        dronePosition.clone().subScalar(0.1),
        dronePosition.clone().addScalar(0.1)
    );
    return dronePointBox.intersectsBox(targetCollisionBox);
}

export function onTargetDestroyed() {
    if (entranceMesh) entranceMesh.material.color.set(0xff4500); // Glow effect
    if (beaconLightMesh) beaconLightMesh.visible = false; // Turn off beacon
}

export function resetTarget() {
    // Re-create ensures materials/visibility are reset
    createBunker();
    fireCooldown = Config.TARGET_FIRE_RATE * 0.5; // Start with partial cooldown after reset
}

// Function needed by UI to get target position for waypoint
export function getTargetPosition() {
    if (bunkerGroup) {
        return bunkerGroup.position;
    }
    return null; // Return null if bunker doesn't exist
}
