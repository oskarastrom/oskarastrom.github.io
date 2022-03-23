import * as THREE from 'three';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/loaders/FBXLoader.js';
import { setCity } from './cityHandler.js';
import { setGallery } from './galleryScene.js';


const fbxLoader = new FBXLoader();
const textureLoader = new THREE.TextureLoader();
export function loadCityMesh() {
    fbxLoader.load( 'models/Website Town.fbx', 
        (o) => {
            setCity(o);
            o.traverse( function ( child ) {
                child.castShadow = true;
                child.receiveShadow = true;
                if( child.material ) {
                    if (child.material.color) {
                        child.material = new THREE.MeshPhysicalMaterial( { color:  child.material.color } );
                    } else {
                        for (let i = 0; i < child.material.length; i++) {
                            child.material[i] = new THREE.MeshPhysicalMaterial( { color:  child.material[i].color } );
                        }
                    }
                 }
            } );
        }
    );
}
export function loadGalleryMesh() {
    fbxLoader.load( 'models/Gallery.fbx', 
        (o) =>{
            setGallery(o);
            o.traverse( function ( child ) {
                child.castShadow = true;
                child.receiveShadow = true;
                if( child.material ) {
                    if (child.material.color) {
                        child.material = new THREE.MeshPhysicalMaterial( { color:  child.material.color } );
                    } else {
                        for (let i = 0; i < child.material.length; i++) {
                            child.material[i] = new THREE.MeshPhysicalMaterial( { color:  child.material[i].color } );
                        }
                    }
                 }
                 if (child.name.length === 4 && child.name.startsWith("c")) {
                    const nbr = parseInt(child.name.slice(1, 4));
                    if (!isNaN(nbr)) {
                        createCanvas(nbr, child);
                    }
                 }
            } );
        }
    );
}
const artworks = [
    {
        name: "",
        rotation: 0
    },
    {
        name: "Ocean",
        rotation: Math.PI/2
    },
    {
        name: "Tropical Island",
        rotation: Math.PI/2
    },
    {
        name: "Grassy River",
        rotation: 0
    },
    {
        name: "Will o' Wisp 2",
        rotation: 0
    },
    {
        name: "Stylized Cottage",
        rotation: 0
    },
    {
        name: "Donut New",
        rotation: 0
    },
    {
        name: "Bowling Pin",
        rotation: 0
    },
];
function createCanvas(nbr, parent) {
    if (nbr < artworks.length) {
        const name = artworks[nbr].name;
        const fullname = 'artworks/' + name + ".png";
        textureLoader.load(fullname, (texture) => {
            if (texture.image === undefined) {
                console.warn(fullname);
            }
            const aspectRatio = texture.image.naturalWidth/texture.image.naturalHeight;

            let h = 1; 
            let w = aspectRatio*h;

            const s = 0.01;
            const d1 = 0.03;
            const d2 = 0.05;
            const t1 = 0.05; 
            const t2 = 0.05;

            const halfWidths = [w/2, w/2, w/2 + t2, w/2 + t2 + t1, w/2 + t2 + t1];
            const halfHeights = [h/2, h/2, h/2 + t2, h/2 + t2 + t1, h/2 + t2 + t1];
            const z = [0, s + d1, s + d1 + d2, s + d1 + d2, 0];

            const geometry = new THREE.BufferGeometry();

            const vertices = [];
            for (let i = 0; i < z.length; i++) {
                vertices.push(
                    new THREE.Vector3(halfWidths[i], halfHeights[i], z[i]),
                    new THREE.Vector3(halfWidths[i], -halfHeights[i], z[i]),
                    new THREE.Vector3(-halfWidths[i], -halfHeights[i], z[i]),
                    new THREE.Vector3(-halfWidths[i], halfHeights[i], z[i]),
                );
            }
            const uv_map = [];
            for (let i = 0; i < z.length; i++) {
                uv_map.push(
                    new THREE.Vector3(0, 1, 0),
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(1, 0, 0),
                    new THREE.Vector3(1, 1, 0),
                );
            }
            
            const faces = [];
            faces.push(
                3, 1, 0,
                3, 2, 1,
            );
            for (let i = 0; i < z.length - 1; i++) {
                const ndx = 4*i;
                faces.push(
                    ndx + 5, ndx + 4, ndx + 0,
                    ndx + 1, ndx + 5, ndx + 0,
                    ndx + 6, ndx + 5, ndx + 1,
                    ndx + 2, ndx + 6, ndx + 1,
                    ndx + 7, ndx + 6, ndx + 2,
                    ndx + 3, ndx + 7, ndx + 2,
                    ndx + 4, ndx + 7, ndx + 3,
                    ndx + 0, ndx + 4, ndx + 3,
                );
            }

            const positions = [];
            for (let i = 0; i < faces.length; i++) {
                const j = faces[i];
                positions.push(vertices[j].x, vertices[j].y, vertices[j].z)
            }
            const uvs = [];
            for (let i = 0; i < faces.length; i++) {
                const j = faces[i];
                uvs.push(uv_map[j].x, uv_map[j].y)
            }

            geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );
            geometry.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvs ), 2 ) );
            geometry.computeVertexNormals();
            geometry.rotateX(Math.PI/2);

            const frame = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({color: "#482A0C"}));
            parent.add(frame)

            const painting = new THREE.Mesh(new THREE.BoxGeometry(w, s, h), new THREE.MeshPhysicalMaterial({map:texture}));
            painting.translateY(-s/2);
            frame.add(painting);
            console.log(frame)
            painting.userData.name = artworks[nbr].name;

            frame.rotateZ(artworks[nbr].rotation);
        });
    }
}


const lightSize = 125;
const lightFar = 375;
const lightMapSize = 1024;
export function directionalLight(pos, rot, color, intensity, shadows) {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.fromArray(pos);
    light.rotation.fromArray(rot)

    if (shadows) {
        light.castShadow = true;
        light.shadow.mapSize.width = lightMapSize;
        light.shadow.mapSize.height = lightMapSize;
    
        light.shadow.camera.far = lightFar;
    
        light.shadow.camera.left = -lightSize;
        light.shadow.camera.right = lightSize;
        light.shadow.camera.bottom = -lightSize; 
        light.shadow.camera.top = lightSize;
    }
    return light;
}







const starMaterial = new THREE.PointsMaterial({
    color: 0xFFFFBB,
    size: 20,
    map: textureLoader.load(
        "images/particle.png"
    ),
    blending: THREE.AdditiveBlending,
    transparent: true
});
const stars = new THREE.Points();
const starVelocity = [];
const starCoords = [];
const star_dist = [1000, 1500];
const starVelRange = [1/100, 1/50];
const starCount = 500;

export function addStars() {
    const positions = new Float32Array(3*starCount);
    const geometry = new THREE.BufferGeometry();

    for (let i = 0; i < starCount; i++) {
        const r = randRange(star_dist);
        const theta = Math.acos(2*Math.random() - 1);
        const phi = Math.random()*2*Math.PI;
        positions[3*i] = r*Math.cos(phi)*Math.sin(theta);
        positions[3*i + 1] = r*Math.sin(phi)*Math.sin(theta);
        positions[3*i + 2] = r*Math.cos(theta);

        starCoords[3*i] = r;
        starCoords[3*i + 1] = theta;
        starCoords[3*i + 2] = phi;

        starVelocity[3*i] = 0;
        starVelocity[3*i + 1] = (2*Math.random() - 1)*randRange(starVelRange);
        starVelocity[3*i + 2] = (2*Math.random() - 1)*randRange(starVelRange);
    }
    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );
    stars.geometry = geometry;
    stars.material = starMaterial;
    stars.sortParticles = true;
    window.scene.add(stars);
}

export function updateStars(time, deltaTime) {
    const positions = stars.geometry.attributes.position.array;
    window.starVelocity = starVelocity;
    for (let i = 0; i < starCount; i++) {
        starCoords[3*i] += deltaTime*starVelocity[3*i];
        starCoords[3*i + 1] += deltaTime*starVelocity[3*i+1];
        starCoords[3*i + 2] += deltaTime*starVelocity[3*i+2];

        if (starCoords[3*i + 1] < 0) {
            starVelocity[3*i + 1] *= -1;
            starCoords[3*i + 1] *= -1;
            starCoords[3*i + 2] += Math.PI;
        } else if (starCoords[3*i + 1] > Math.PI) {
            starVelocity[3*i + 1] *= -1;
            starCoords[3*i + 1] *= -1;
            starCoords[3*i + 1] += 2*Math.PI;
            starCoords[3*i + 2] += Math.PI;
        }
        if (starCoords[3*i + 2] < 0) {
            starCoords[3*i + 2] += 2*Math.PI;
        } else if (starCoords[3*i + 2] > 2*Math.PI) {
            starCoords[3*i + 2] -= 2*Math.PI;
        }
        
        const r = starCoords[3*i];
        const theta = starCoords[3*i + 1];
        const phi = starCoords[3*i + 2];
        positions[3*i] = r*Math.cos(phi)*Math.sin(theta);
        positions[3*i + 1] = r*Math.sin(phi)*Math.sin(theta);
        positions[3*i + 2] = r*Math.cos(theta);
        stars.geometry.attributes.position.needsUpdate = true;

    }
}

function randRange(range) {
    return range[0] + Math.random()*(range[1] - range[0]);
}