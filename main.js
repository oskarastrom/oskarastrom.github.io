

import * as THREE from 'three';
import { hoverCity, updateCity, clickCity, retreatViewMode, loadCity } from './cityHandler.js'
import { isMoving, loadCamera, cameraKeyInput, updateCamera } from './cameraHandler.js';
import { loadGallery } from './galleryScene.js';

//Scene setup
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});
window.renderer = renderer;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

var havePointerLock = document.pointerLockElement ||
    document.mozPointerLockElement ||
    document.webkitPointerLockElement;
console.log(havePointerLock)

let sceneMode = "City";

loadCamera(sceneMode);

//Controls
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const dMouse = new THREE.Vector2();
export function getMouse() { return mouse; }
export function getDeltaMouse() { return dMouse; }

loadCity(renderer);
loadGallery();


let time = 0;
let lastTime = new Date().getTime();
function animate() {
    let realTime = new Date().getTime();
    let deltaTime = (realTime - lastTime) / 1000;
    time += deltaTime;
    lastTime = realTime;

    raycast();

    updateCity(time, deltaTime);
    updateCamera(time, deltaTime, dMouse)

    dMouse.set(0, 0);
    renderer.render((sceneMode === "City") ? window.cityScene : window.galleryScene, camera);
    requestAnimationFrame(animate);
}
function raycast() {
    if (isMoving() || !window.city) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(window.city.children, true);
    hoverCity(intersects);
    
}
function onMouseMove(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = - (event.clientY / window.innerHeight) * 2 + 1;
    dMouse.x = event.movementX;
    dMouse.y = event.movementY;
    mouse.x = x;
    mouse.y = y;
}
let dragged = false;
function onOrbitChanged(event) {
    dragged = true;
}
function onMouseDown(event) {
    if (sceneMode == "City") {
        if (event.button == 2) {
            retreatViewMode()
        }
        dragged = false;
    } else if (sceneMode == "Gallery") {
        setCursorLocked(true)
    }
}
function onMouseUp(event) {
    if (sceneMode == "City") {
        if (!dragged) clickCity();
    }
}
function onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (sceneMode == "City") {
        if (key === "escape") {
            retreatViewMode();
        }
    } else if (sceneMode == "Gallery") {
        if (['w', 'a', 's', 'd'].includes(key)) {
            cameraKeyInput(key, 1);
        }
    }
}
function onKeyUp(event) {
    const key = event.key.toLowerCase();
    if (sceneMode == "Gallery") {
        if (['w', 'a', 's', 'd'].includes(key)) {
            cameraKeyInput(key, 0);
        }
    }
}
function onResize(event) {
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight)
    window.camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix()

}
export function setCursorLocked(locked) {
    if (locked) {
        renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock ||
                                                 renderer.domElement.mozRequestPointerLock ||
                                                 renderer.domElement.webkitRequestPointerLock;
        renderer.domElement.requestPointerLock();
    } else {
        document.exitPointerLock = document.exitPointerLock ||
                                    document.mozExitPointerLock ||
                                    document.webkitExitPointerLock;
        document.exitPointerLock();
    }
}
orbit.addEventListener('change', onOrbitChanged, false);
window.addEventListener('pointerdown', onMouseDown, false);
window.addEventListener('pointerup', onMouseUp, false);
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('keydown', onKeyDown, false);
window.addEventListener('keyup', onKeyUp, false);
window.addEventListener('resize', onResize, false);
animate();

