import { TTFLoader } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/loaders/TTFLoader.js';
import { Font } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/geometries/TextGeometry.js';
import * as THREE from 'three';


const loader = new TTFLoader();
const color = 0xFF5522;

let font;


export function loadFonts(onLoad) {
    loader.load( 'fonts/gomarice_gogono_cocoa_mochi.ttf', function ( json ) {
        font = new Font( json );
        onLoad();
    });
}

export function createText(text, size, height) {

    const geometry = new TextGeometry( text, {

        font: font,
        size: size,
        height: size/5,
        curveSegments: 4,

        bevelThickness: size/25,
        bevelSize: size/50,
        bevelEnabled: true

    } );

    geometry.computeBoundingBox();
    geometry.computeVertexNormals();
    const centerOffset = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    geometry.translate(centerOffset, height, 0);

    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial( { 
        color: color, 
        flatShading: true 
    } ) );

    return mesh;

}