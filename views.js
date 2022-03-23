import * as THREE from 'https://cdn.skypack.dev/three';

let view;

const defaultCityR = 150;
const defaultCityPolar = 72*Math.PI/180;
const defaultDistrictR = 100;
const defaultDistrictPolar = 72*Math.PI/180;
const defaultDistrictTextHeight = 20;
const defaultLocationR = 50;
const defaultLocationPolar = 72*Math.PI/180;
const defaultLocationTextHeight = 30;

export function getDistrictNames() {
    return ["recreation", "work", "residential", "education"];
}
export function getLocationNames() {
    const districtNames = getDistrictNames();
    const locationNames = []
    for (const locName in view) {
        if (locName !== "city" && !districtNames.includes(locName)) {
            locationNames.push(locName);
        }
    }
    return locationNames;
}

export function loadViews() {
    view = {
        "city": {
            target: [0, 0, 0],
            r: defaultCityR,
            polar: defaultCityPolar
        },
        "residential": {
            textHeight: 10
        },
        "work": {
            target: [0, 10, 0],
            textHeight: 35
        },
        "Modelon": {
            target: [0, 25, 0],
            textHeight: 32
        },
        "Stage": {
            textHeight: 6
        },
        "Hill": {
            textHeight: 10
        },
        "Factory": {
            textHeight: 20
        },
        "Lund University": {
            textHeight: 15
        },
        "Gymnasium": {
            textHeight: 20
        },
        "Music & Arts": {
            textHeight: 10
        },
        "SI-Leader": {
            textHeight: 10
        }
    }
    return view;
}

export function loadDistrictView(object, name) {
    if (!views[name]) {
        views[name] = {
            target: object.getWorldPosition(new THREE.Vector3()).toArray(),
            r: defaultDistrictR,
            polar: defaultDistrictPolar,
            textHeight: defaultDistrictTextHeight
        }
    } else {
        const pos = object.getWorldPosition(new THREE.Vector3());
        if (!views[name].target) {
            views[name].target = pos.toArray();
        } else {
            pos.add(new THREE.Vector3().fromArray(views[name].target));
            views[name].target = pos.toArray();
        }
        if (!views[name].r) {
            views[name].r = defaultDistrictR;
        }
        if (!views[name].polar) {
            views[name].polar = defaultDistrictPolar;
        }
        if (!views[name].textHeight) {
            views[name].textHeight = defaultDistrictTextHeight;
        }
    }
}

export function loadLocationView(object, name) {
    if (!views[name]) {
        views[name] = {
            target: object.getWorldPosition(new THREE.Vector3()).toArray(),
            r: defaultLocationR,
            polar: defaultLocationPolar,
            textHeight: defaultLocationTextHeight
        }
    } else {
        const pos = object.getWorldPosition(new THREE.Vector3());
        if (!views[name].target) {
            views[name].target = object.getWorldPosition(new THREE.Vector3()).toArray();
        } else {
            pos.add(new THREE.Vector3().fromArray(views[name].target));
            views[name].target = pos.toArray();
        }
        if (!views[name].r) {
            views[name].r = defaultLocationR;
        }
        if (!views[name].polar) {
            views[name].polar = defaultLocationPolar;
        }
        if (!views[name].textHeight) {
            views[name].textHeight = defaultLocationTextHeight;
        }
    }
}