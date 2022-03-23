
import * as THREE from 'https://cdn.skypack.dev/three';
import {OrbitControls} from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';
import {FirstPersonControls} from 'https://cdn.skypack.dev/three/examples/jsm/controls/FirstPersonControls.js';
import {getCamInfo} from "./cityHandler";

const animationMoveTime = 1;

let cameraType = "City";
let moving = false;
let moveTime = 0;
let cameraAnimation = {};
let onAnimationFinish;

export function loadCamera(type) {
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
    const orbit = new OrbitControls(camera, window.renderer.domElement);
    const fpsControls = new FirstPersonControls(camera, window.renderer.domElement);
    window.camera = camera;
    window.orbit = orbit;
    window.fpsControls = fpsControls;
    setCameraType(type)
}

export function setCameraType(type) {
    cameraType = type;
    if (cameraType === "City") {
        window.fpsControls.enabled = false;
        window.orbit.enabled = true;
        window.orbit.enablePan = false;
        window.orbit.enableZoom = false;
        window.orbit.update()
    } else {
        window.orbit.enabled = false;
        window.fpsControls.enabled = false;
        window.fpsControls.movementSpeed = 10;
        window.fpsControls.lookSpeed = 0.1
    }
    initCameraPosition(type)
}

export function interpolateCamera(pos1, target1, pos2, target2, t) {
    window.camera.position.lerpVectors(pos1, pos2, t);
    window.orbit.target.lerpVectors(target1, target2, t);
    window.orbit.update();
}

export function startCameraAnimation(info, onFinish) {
    const orbit =  window.orbit;
    const camera = window.camera;

    orbit.minPolarAngle = -Number.MAX_VALUE;
    orbit.maxPolarAngle = Number.MAX_VALUE;

    cameraAnimation.pos1 = camera.position.clone();
    cameraAnimation.target1 = orbit.target.clone();
    cameraAnimation.polar1 = orbit.getPolarAngle();

    cameraAnimation.target2 = new THREE.Vector3().fromArray(info.target);
    cameraAnimation.polar2 = info.polar;

    const dist = new THREE.Vector3().subVectors(cameraAnimation.pos1, cameraAnimation.target2);

    if (dist.length() === 0) dist.set(0, 0, 1);

    let azimuth = Math.atan2(dist.z, dist.x);

    const x = cameraAnimation.target2.x + info.r*Math.cos(azimuth)*Math.sin(info.polar);
    const z = cameraAnimation.target2.z + info.r*Math.sin(azimuth)*Math.sin(info.polar);
    const y = cameraAnimation.target2.y + info.r*Math.cos(info.polar);
    
    cameraAnimation.pos2 = new THREE.Vector3(x, y, z);
    window.CA = cameraAnimation;

    onAnimationFinish = onFinish;
    moveTime = 0;
    moving = true;
}

export function isMoving() {
    return moving;
}

export function updateCamera(time, deltaTime, dMouse) {
    const orbit = window.orbit;
    const camera = window.camera;
    if (cameraType === "City") {
        if (moving) {
            moveTime += deltaTime;
            if (moveTime < animationMoveTime) {
                const t = moveTime/animationMoveTime;
    
                camera.position.lerpVectors(cameraAnimation.pos1, cameraAnimation.pos2, t);
                orbit.target.lerpVectors(cameraAnimation.target1, cameraAnimation.target2, t);
                const polar = cameraAnimation.polar1 + t*(cameraAnimation.polar2 - cameraAnimation.polar1);
                orbit.minPolarAngle = polar;
                orbit.maxPolarAngle = polar;
                orbit.update();
    
            } else {
                moving = false;
    
                camera.position.copy(cameraAnimation.pos2);
                orbit.target.copy(cameraAnimation.target2);
                
                orbit.minPolarAngle = cameraAnimation.polar2;
                orbit.maxPolarAngle = cameraAnimation.polar2;
                orbit.update();
    
                onAnimationFinish();
            }
        }
    } else {
        window.fpsControls.update(deltaTime);
        moveCamera(deltaTime, dMouse);
    }
}

export function initCameraPosition(type) {
    if (type === "City") {
        const orbit =  window.orbit;
        const camera = window.camera;
    
        const info = getCamInfo();
    
        orbit.target.fromArray(info.target);
    
        const dist = new THREE.Vector3().subVectors(camera.position, orbit.target);
    
        if (dist.length() === 0) dist.set(0, 0, 1);
    
        let azimuth = Math.atan2(dist.z, dist.x);
    
        const x = info.r*Math.cos(azimuth)*Math.sin(info.polar);
        const z = info.r*Math.sin(azimuth)*Math.sin(info.polar);
        const y = info.r*Math.cos(info.polar);
        
        camera.position.set(x, y, z);
        orbit.minPolarAngle = info.polar;
        orbit.maxPolarAngle = info.polar;
        orbit.update();
    } else {
        const orbit =  window.orbit;
        const camera = window.camera;
    
        const info = getCamInfo();
    
        camera.position.set(0, 10, -40);
        orbit.target.addVectors(camera.position, new THREE.Vector3(0, 0, -20));
        
        orbit.minPolarAngle = 0;
        orbit.maxPolarAngle = Math.PI;
        orbit.update();
    }
} 

const cameraVelocity = 40;
const rotationSpeed = .1*Math.PI/180;
const movingDirections = {'w': 0, 'a': 0, 's': 0, 'd': 0};
export function cameraKeyInput(key, isDown) {
    movingDirections[key] = isDown;
}

const euler = new THREE.Euler(0, 0, 0, 'YXZ');
function moveCamera(deltaTime, dMouse) {
    const dist = cameraVelocity * deltaTime;
    const forward = camera.getWorldDirection(new THREE.Vector3());
    const side = new THREE.Vector3(0, 1, 0).cross(forward);
    forward.multiplyScalar(dist * (movingDirections.w - movingDirections.s));
    side.multiplyScalar(dist * (movingDirections.a - movingDirections.d));

    euler.y -= dMouse.x * rotationSpeed;
    euler.x -= dMouse.y * rotationSpeed;
    euler.x = Math.min(Math.max(euler.x, -1.0472), 1.0472);

    camera.quaternion.setFromEuler(euler);
    camera.position.add(forward).add(side);
    camera.position.y = 10
}



