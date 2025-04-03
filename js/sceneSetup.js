// js/sceneSetup.js
import * as THREE from 'three';
import * as Config from './config.js';

export const scene = new THREE.Scene();
export const clock = new THREE.Clock();
export const textureLoader = new THREE.TextureLoader();
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
export const renderer = new THREE.WebGLRenderer({ antialias: true });

export function setupScene() {
    scene.fog = new THREE.Fog(Config.FOG_COLOR, Config.FOG_NEAR, Config.FOG_FAR);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87CEEB);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    setupResizeListener();
}

function setupResizeListener() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
}