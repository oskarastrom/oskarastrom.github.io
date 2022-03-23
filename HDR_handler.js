import * as THREE from 'three';

const c1 = new THREE.Color(1, 0.6, 0.3);
const c2 = new THREE.Color(0.5, 0.8, 1.0);
const t1 = 0.42;
const t2 = 0.45;
function getColor(h) {
    let color;
    if (h < t1) {
        color = c1;
    } else if (h < t2) {
        color = new THREE.Color().lerpColors(c1,c2, (h-t1)/(t2-t1));
    } else {
        color = c2;
    }
    return [color.r, color.g, color.b];
}

export function generateHDR(renderer, scene) {

    //Create Texture
    const nbrRows = 16;
    const color = new Uint8Array(nbrRows * 4);
    for (let i = 0; i < nbrRows; i++) {
        const c = getColor(i/nbrRows);
        color[4*i] = Math.floor(c[0]*255);
        color[4*i + 1] = Math.floor(c[1]*255);
        color[4*i + 2] = Math.floor(c[2]*255);
        color[4*i + 3] = 255;
    }
    
    const texture = new THREE.DataTexture( color, 1, nbrRows, THREE.RGBAFormat );
    texture.needsUpdate = true;

    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    pmremGenerator.compileEquirectangularShader();
    const envMap = pmremGenerator.fromEquirectangular( texture ).texture;

    texture.dispose();
    pmremGenerator.dispose();

    return envMap;
}