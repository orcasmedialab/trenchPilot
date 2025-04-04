// js/environment.js
import * as THREE from 'three';
import * as Config from './config.js';
import { scene, textureLoader } from './sceneSetup.js';

const groundMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load(Config.TEXTURE_PATH + 'dirt_texture.jpg', (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(100, 100);
    }),
    roughness: 0.9,
    metalness: 0.1
});
const groundGeometry = new THREE.PlaneGeometry(Config.GROUND_SIZE, Config.GROUND_SIZE);
const ground = new THREE.Mesh(groundGeometry, groundMaterial);

const obstacleMats = [
    new THREE.MeshStandardMaterial({ map: textureLoader.load(Config.TEXTURE_PATH + 'concrete_texture.jpg', (tex) => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2, 2); }), roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ map: textureLoader.load(Config.TEXTURE_PATH + 'wood_texture.jpg', (tex) => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 1); }), roughness: 0.7 }),
    new THREE.MeshStandardMaterial({ map: textureLoader.load(Config.TEXTURE_PATH + 'metal_texture.jpg', (tex) => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 1); }), roughness: 0.6, metalness: 0.4 }),
];
const obstacleGeos = [
    new THREE.BoxGeometry(1, 1, 4), new THREE.BoxGeometry(1.5, 0.5, 1.5),
    new THREE.CylinderGeometry(0.3, 0.3, 5, 8), new THREE.BoxGeometry(3, 2, 0.5),
];
let obstacles = [];

export function createGround() {
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

export function createObstacles() {
    // Clear existing obstacles
    obstacles.forEach(obs => {
        scene.remove(obs);
        // Optional: Dispose geometry/material if needed
        // if (obs.geometry) obs.geometry.dispose();
        // if (obs.material) obs.material.dispose();
    });
    obstacles = []; // Reset array

    // "Warm up" Math.random() before the loop
    Math.random(); Math.random(); Math.random(); Math.random(); Math.random();

    for (let i = 0; i < Config.NUM_OBSTACLES; i++) {
        const geo = obstacleGeos[Math.floor(Math.random() * obstacleGeos.length)];
        const mat = obstacleMats[Math.floor(Math.random() * obstacleMats.length)].clone();
        const obstacle = new THREE.Mesh(geo, mat);
        const size = Math.random() * 1.5 + 0.5;
        obstacle.scale.set(size, size, size);
        obstacle.position.set(
            (Math.random() - 0.5) * Config.OBSTACLE_SPREAD_FACTOR,
            (geo.parameters.height || 0.6) * size / 2 + 0.01, // Ensure sits on ground
            (Math.random() - 0.5) * Config.OBSTACLE_SPREAD_FACTOR
        );
        obstacle.rotation.y = Math.random() * Math.PI * 2;
        if (geo instanceof THREE.CylinderGeometry) {
            obstacle.rotation.x = Math.PI / 2;
            obstacle.rotation.z = Math.random() * Math.PI;
        }
        obstacle.castShadow = true;
        obstacle.receiveShadow = true;
        scene.add(obstacle);
        obstacles.push(obstacle);
    }
}
