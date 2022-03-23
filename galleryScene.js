import * as THREE from 'three';
import { directionalLight, loadGalleryMesh } from './meshMaker.js';
const galleryScene = new THREE.Scene();
window.galleryScene = galleryScene;
let gallery;


export function loadGallery() {
    loadGalleryMesh();
}
export function setGallery(g) {
    galleryScene.add(g)
    gallery = g;

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, .5);
    galleryScene.add(ambientLight);
    
    const mainLight = directionalLight([-240, 100, 0], [-2.576, 0.59757, 1.8212877], 0xFFFFBB, .7, true);
    galleryScene.add(mainLight);
    mainLight.add(
        new THREE.Mesh(
            new THREE.SphereGeometry(5), 
            new THREE.MeshBasicMaterial({
                color:0xffff88
            })
        )
    );
    //galleryScene.add(new THREE.CameraHelper(mainLight.shadow.camera))
    
    const backLight = directionalLight([240, 100, 0], [-0.5655, 0.59757, -1.3203], 0xBBBBFF, .6, false);
    galleryScene.add(backLight);
}
