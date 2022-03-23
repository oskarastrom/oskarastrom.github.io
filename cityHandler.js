import * as THREE from 'https://cdn.skypack.dev/three';
import { startCameraAnimation } from './cameraHandler.js';
import { generateHDR } from './HDR_handler.js';
import { directionalLight, loadCityMesh } from './MeshMaker.js';
import { createText, loadFonts } from './textHandler.js';
import { hideText, showText } from './UI.js';
import { loadViews, loadDistrictView, loadLocationView, getDistrictNames, getLocationNames } from './views.js';

let cityScene = new THREE.Scene();
window.cityScene = cityScene;

let city;
const views = loadViews();
const districts = {};
const locations = {};
const titles = {};
let roads;
let viewMode = "city";
let viewTarget = "city";
const cityAnimPos = {};
let currentDistrict = undefined;
window.views = views;
window.locations = locations;
window.hovered = undefined;

export function loadCity(renderer) {
    loadCityScene(renderer);
    loadCityMesh();
}
export function setCity(c) {
    city = c;
    window.city = city;
    cityScene.add(c);
    const titleParent = new THREE.Object3D();
    window.cityScene.add(titleParent);
    for (const dist of city.children) {
        for (const name of getDistrictNames()) {
            if (dist.name.toLowerCase().includes(name)) {
                districts[name] = dist;
                loadDistrictView(dist, name);
                cityAnimPos[name] = 0;
                continue;
            }
        }
    }
    roads = findLocationByName("Roads");
    window.districts = districts;


    for (const distType in districts) {
        const dist = districts[distType];
        dist.userData.defaultColor = new THREE.Color(dist.material.color);
    }

    for (const name of getLocationNames()) {
        const loc = findLocationByName(name);
        locations[name] = loc
        if (loc == null) {
            console.log(name);
            console.log(window.city)
        }
        loadLocationView(loc, name);
        for (const dt in districts) {
            if (isChildOf(loc, districts[dt])) {
                views[name].district = dt;
            }
        }
        cityAnimPos[name] = 0;
    }

    loadFonts(() => {
        for (const name in districts) {
            let text = 
                (name === "work") ? "work experience" : 
                (name === "residential") ? "about me" : 
                (name === "recreation") ? "hobbies" : 
                (name === "education") ? "education" : name;
            const title = createText(text, 6, views[name].textHeight);
            districts[name].getWorldPosition(title.position)
            titleParent.add(title);
            titles[name] = title;
        }
        for (const name in locations) {
            const title = createText(name, 4, views[name].textHeight);
            locations[name].getWorldPosition(title.position);
            titleParent.add(title);
            titles[name] = title;
        }
    })
}
function findLocationByName(name) {
    let loc = undefined;
    window.city.traverse( function ( child ) {
        if (child.name === name || child.name.replaceAll("_", " ") === name) {
            loc = child;
        }
    } );
    return loc;
}

export function getCamInfo() {
    return views[viewTarget];
}

export function hoverCity(intersects) {
    if (viewMode === "city") {
        hoverDistrict(intersects);
    } else if (viewMode === "district") {
        hoverLocation(intersects);
    }
}

function hoverDistrict(intersects) {
    for (const inter of intersects) {
        for (const name in districts) {
            if (inter.object === districts[name]) {
                return setHoveredDistrict(name);
            }
        }
    }
    return setHoveredDistrict(undefined);
}
function hoverLocation(intersects) {
    if (intersects.length === 0) return setHoveredLocation(undefined);
    let focus = intersects[0].object;
    if (focus === roads) {
        if (intersects.length == 1) return setHoveredLocation(undefined)
        focus = intersects[1].object;
    }

    for (const name in locations) {
        if (views[name].district === currentDistrict) {
            if (isChildOf(focus, locations[name])) {
                return setHoveredLocation(name);
            }
        }
    }

    return setHoveredLocation(undefined);
}
function setHoveredDistrict(dt) {
    const hovered = window.hovered;
    if (hovered !== dt) {
        if (hovered && districts[hovered]) {
            districts[hovered].material.color.copy(districts[hovered].userData.defaultColor);
        }
        if (dt) {
            districts[dt].material.color.set(
                new THREE.Color(1,1,1).lerp(
                    districts[dt].userData.defaultColor, 
                    0.5
                )
            )
        }
        window.hovered = dt;  
    }
}
function isChildOf(obj, loc) {
    if (obj === loc) return true;
    while (obj.parent) {
        obj = obj.parent;
        if (obj === loc) return true;
    }
    return false;
}
function setHoveredLocation(loc) {
    const hovered = window.hovered;
    if (hovered !== loc) {
        if (hovered) {
            //Reset prev hover
        }
        if (loc) {
            //Hover
        }
        window.hovered = loc;  
    }
}
export function clickCity() {
    const hovered = window.hovered;
    if (viewMode === "city" && hovered) {
        startCameraAnimation(views[hovered], () => {
            viewTarget = hovered;
            currentDistrict = hovered;
            viewMode = "district";
        });
        setHoveredDistrict(undefined);
    } else if (viewMode === "district" && hovered) {
        startCameraAnimation(views[hovered], () => {
            viewTarget = hovered;
            viewMode = "location";
            showText(hovered, "Hello there, my name is Oskar")
        });
        setHoveredLocation(undefined);
    }
}
export function retreatViewMode() {
    hideText();
    if (viewMode === "district") {
        startCameraAnimation(views['city'], () => {
            viewTarget = 'city';
            viewMode = "city";
            currentDistrict = undefined;
        });
    } else if (viewMode === "location") {
        startCameraAnimation(views[currentDistrict], () => {
            viewTarget = currentDistrict;
            viewMode = "district";
        });
    }
}
export function getViewMode() {
    return viewMode;
}


const animTime = .5;
export function updateCity(time, deltaTime) {
    if (!city) return;

    const camera = window.camera;

    for (const name in cityAnimPos) {
        
        let dir = (window.hovered === name) ? 1 : -1;
        if (cityAnimPos[name] === 0 && dir === -1) {
            dir = 0;
        } else if (cityAnimPos[name] === 1 && dir === 1) {
            dir = 0;
        }
        
        cityAnimPos[name] = clamp01(cityAnimPos[name] + dir*deltaTime/animTime);
        const t = cityAnimPos[name];

        const district = districts[name];
        if (district) {
            const s = bounce(t, dir);
            for (let c = 0; c < district.children.length; c++) {
                const child = district.children[c];
                child.scale.set(s, s, s);
            }
        }

        const title = titles[name];
        if (title) {
            const t_scale = implode(1-t, dir);
            title.scale.set(t_scale, t_scale, t_scale);

            const dist = new THREE.Vector3().subVectors(camera.position, title.position);
            const angle = Math.atan2(dist.z, dist.x);
            title.rotation.y = -angle + Math.PI/2;
        }
    }
}

function implode(t) {
    return 1+2.125*t-6.25*t*t+3.125*t*t*t;
}
function bounce(t, dir) {
    const h = 1.2;
    if (dir === 1) {
        return (4-4*h)*(t*t - t) + 1;
    } else {
        return 1;
    }
}
function clamp(t, min, max) {
    return Math.max(Math.min(t, max), min);
}
function clamp01(t) {
    return clamp(t, 0, 1);
}

function loadCityScene(renderer) {
    const hdr = generateHDR(renderer, cityScene);
    cityScene.background = hdr;
    
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, .5);
    cityScene.add(ambientLight);
    
    const mainLight = directionalLight([-240, 100, 0], [-2.576, 0.59757, 1.8212877], 0xFFFFBB, .7, true);
    cityScene.add(mainLight);
    mainLight.add(
        new THREE.Mesh(
            new THREE.SphereGeometry(5), 
            new THREE.MeshBasicMaterial({
                color:0xffff88
            })
        )
    );
    //cityScene.add(new THREE.CameraHelper(mainLight.shadow.camera))
    
    const backLight = directionalLight([240, 100, 0], [-0.5655, 0.59757, -1.3203], 0xBBBBFF, .6, false);
    cityScene.add(backLight);
}